import Foundation
import Combine

/// Default implementation of the Store protocol
/// Thread-safe via Swift actor, supports persistence via StorageBackend
public final class DefaultStore: Store, @unchecked Sendable {

    public let scope: Scope
    public let storage: Storage

    private let backend: StorageBackend
    private let actor: StoreActor
    private let changeSubject = PassthroughSubject<StoreChange, Never>()
    private let logger: Logger?

    /// Initialize a store with scope, storage, and backend
    init(
        scope: Scope,
        storage: Storage,
        backend: StorageBackend,
        logger: Logger? = nil
    ) {
        self.scope = scope
        self.storage = storage
        self.backend = backend
        self.logger = logger
        self.actor = StoreActor()
    }

    // MARK: - IO Operations

    public func get(_ keyPath: String) async -> StoreValue? {
        return await actor.get(keyPath)
    }

    public func get<T: Decodable>(_ keyPath: String, as type: T.Type) async throws -> T {
        guard let value = await get(keyPath) else {
            throw StoreError.keyPathNotFound(keyPath)
        }

        // Convert StoreValue to JSON data, then decode
        let encoder = JSONEncoder()
        let decoder = JSONDecoder()
        let data = try encoder.encode(value)
        return try decoder.decode(T.self, from: data)
    }

    public func exists(_ keyPath: String) async -> Bool {
        return await get(keyPath) != nil
    }

    // MARK: - Mutations

    public func set(_ keyPath: String, _ value: StoreValue) async {
        let (patch, root) = await actor.set(keyPath, value: value)

        emitChange(patch: patch)
        await saveToBackend(root: root)

        logger?.debug("Store.set: \(keyPath) = \(value)", category: "Store")
    }

    public func merge(_ keyPath: String, _ object: [String: StoreValue]) async {
        let (patch, root) = await actor.merge(keyPath, object: object)

        emitChange(patch: patch)
        await saveToBackend(root: root)

        logger?.debug("Store.merge: \(keyPath)", category: "Store")
    }

    public func remove(_ keyPath: String) async {
        let (patch, root) = await actor.remove(keyPath)

        emitChange(patch: patch)
        await saveToBackend(root: root)

        logger?.debug("Store.remove: \(keyPath)", category: "Store")
    }

    // MARK: - Batch Operations

    public func transaction(_ block: @escaping @Sendable (Store) async -> Void) async {
        // Execute the block and collect patches
        // Since the block is async, we execute it directly and track changes
        let initialSnapshot = await actor.snapshot()

        // Execute the transaction block
        await block(self)

        // Get the final snapshot to create a consolidated patch
        let finalSnapshot = await actor.snapshot()

        // Create a single transaction change event
        let txID = UUID()
        let patch = StorePatch(op: .set, keyPath: "", oldValue: .object(initialSnapshot), newValue: .object(finalSnapshot))
        let change = StoreChange(patches: [patch], transactionID: txID)
        changeSubject.send(change)

        await saveToBackend(root: finalSnapshot)

        logger?.debug("Store.transaction: completed", category: "Store")
    }

    // MARK: - Observation

    public func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never> {
        let actor = self.actor
        return StorePublisher(
            keyPath: keyPath,
            changeSubject: changeSubject,
            getCurrentValue: {
                // Bridge async to sync - this is called on background queue by publisher
                return runAsyncAndWait { await actor.get(keyPath) }
            }
        ).eraseToAnyPublisher()
    }

    public func publisher(for keyPaths: Set<String>) -> AnyPublisher<[String: StoreValue?], Never> {
        let actor = self.actor
        return StoreMultiKeyPublisher(
            keyPaths: keyPaths,
            changeSubject: changeSubject,
            getCurrentValues: {
                // Bridge async to sync - this is called on background queue by publisher
                return runAsyncAndWait {
                    var result: [String: StoreValue?] = [:]
                    for keyPath in keyPaths {
                        result[keyPath] = await actor.get(keyPath)
                    }
                    return result
                }
            }
        ).eraseToAnyPublisher()
    }

    // MARK: - Snapshot

    public func snapshot() async -> [String: StoreValue] {
        return await actor.snapshot()
    }

    public func replaceAll(with root: [String: StoreValue]) async {
        let patch = await actor.replaceAll(with: root)

        let change = StoreChange(patch: patch)
        changeSubject.send(change)

        await saveToBackend(root: root)

        logger?.debug("Store.replaceAll: replaced entire store", category: "Store")
    }

    /// Load data from backend storage
    /// Call this explicitly when you want to load persisted data
    public func loadFromBackend() async {
        if let data = await backend.load() {
            _ = await actor.replaceAll(with: data)
            logger?.debug("Store loaded from backend: \(data.keys.count) keys", category: "Store")
        }
    }

    // MARK: - Private Helpers

    private func emitChange(patch: StorePatch) {
        let change = StoreChange(patch: patch)
        changeSubject.send(change)
    }

    private func saveToBackend(root: [String: StoreValue]) async {
        do {
            try await backend.save(root)
        } catch {
            logger?.error("Failed to save to backend: \(error)", category: "Store")
        }
    }
}

// MARK: - StoreActor

/// Actor that provides thread-safe access to store data
private actor StoreActor {
    private var root: StoreValue = .object([:])
    private var currentTransactionID: UUID?
    private var transactionPatches: [StorePatch] = []

    func get(_ keyPath: String) -> StoreValue? {
        return KeyPathNavigator.get(keyPath, in: root)
    }

    func set(_ keyPath: String, value: StoreValue) -> (StorePatch, [String: StoreValue]) {
        let (newRoot, oldValue) = KeyPathNavigator.set(keyPath, value: value, in: root)
        root = newRoot

        let patch = StorePatch(op: .set, keyPath: keyPath, oldValue: oldValue, newValue: value)
        return (patch, root.objectValue ?? [:])
    }

    func merge(_ keyPath: String, object: [String: StoreValue]) -> (StorePatch, [String: StoreValue]) {
        let (newRoot, oldValue) = KeyPathNavigator.merge(keyPath, object: object, in: root)
        root = newRoot

        let patch = StorePatch(op: .merge, keyPath: keyPath, oldValue: oldValue, newValue: .object(object))
        return (patch, root.objectValue ?? [:])
    }

    func remove(_ keyPath: String) -> (StorePatch, [String: StoreValue]) {
        let (newRoot, removedValue) = KeyPathNavigator.remove(keyPath, from: root)
        root = newRoot

        let patch = StorePatch(op: .remove, keyPath: keyPath, oldValue: removedValue, newValue: nil)
        return (patch, root.objectValue ?? [:])
    }

    func transaction(block: @Sendable () -> Void) -> ([StorePatch], [String: StoreValue]) {
        let txID = UUID()
        currentTransactionID = txID
        transactionPatches = []

        // Execute the block
        block()

        let patches = transactionPatches
        currentTransactionID = nil
        transactionPatches = []

        return (patches, root.objectValue ?? [:])
    }

    func snapshot() -> [String: StoreValue] {
        return root.objectValue ?? [:]
    }

    func replaceAll(with data: [String: StoreValue]) -> StorePatch {
        let oldValue = root
        root = .object(data)

        return StorePatch(op: .set, keyPath: "", oldValue: oldValue, newValue: root)
    }

    func addTransactionPatch(_ patch: StorePatch) {
        if currentTransactionID != nil {
            transactionPatches.append(patch)
        }
    }
}

// MARK: - StoreError

public enum StoreError: Error {
    case keyPathNotFound(String)
    case decodingFailed(String)
    case invalidValue(String)

    public var localizedDescription: String {
        switch self {
        case .keyPathNotFound(let keyPath):
            return "KeyPath not found: \(keyPath)"
        case .decodingFailed(let message):
            return "Decoding failed: \(message)"
        case .invalidValue(let message):
            return "Invalid value: \(message)"
        }
    }
}

// MARK: - Async Bridge

/// Result box for safe concurrency
private final class ResultBox<T>: @unchecked Sendable {
    var value: T?
}

/// Helper to bridge async to sync for publishers
private func runAsyncAndWait<T>(_ operation: @escaping @Sendable () async -> T) -> T {
    // Use DispatchSemaphore to synchronously wait for async operation
    let semaphore = DispatchSemaphore(value: 0)
    // Use a class to safely share result across concurrency boundaries
    let box = ResultBox<T>()

    Task { @Sendable in
        box.value = await operation()
        semaphore.signal()
    }

    semaphore.wait()
    return box.value!
}
