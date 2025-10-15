import Foundation
import Combine

/// Default implementation of the Store protocol
/// Thread-safe via serial DispatchQueue, supports persistence via StorageBackend
public final class DefaultStore: Store, @unchecked Sendable {

    public let scope: Scope
    public let storage: Storage

    private let backend: StorageBackend
    private let queue: DispatchQueue
    private let changeSubject = PassthroughSubject<StoreChange, Never>()

    private var root: StoreValue = .object([:])
    private var currentTransactionID: UUID?
    private var transactionPatches: [StorePatch] = []

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
        self.queue = DispatchQueue(label: "com.renderengine.store.\(scope.identifier).\(storage.identifier)")
        self.logger = logger

        // Load initial data from backend
        loadFromBackend()
    }

    // MARK: - IO Operations

    public func get(_ keyPath: String) -> StoreValue? {
        return queue.sync {
            KeyPathNavigator.get(keyPath, in: root)
        }
    }

    public func get<T: Decodable>(_ keyPath: String, as type: T.Type) throws -> T {
        guard let value = get(keyPath) else {
            throw StoreError.keyPathNotFound(keyPath)
        }

        // Convert StoreValue to JSON data, then decode
        let encoder = JSONEncoder()
        let decoder = JSONDecoder()
        let data = try encoder.encode(value)
        return try decoder.decode(T.self, from: data)
    }

    public func exists(_ keyPath: String) -> Bool {
        return get(keyPath) != nil
    }

    // MARK: - Mutations

    public func set(_ keyPath: String, _ value: StoreValue) {
        queue.async { [weak self] in
            guard let self = self else { return }

            let (newRoot, oldValue) = KeyPathNavigator.set(keyPath, value: value, in: self.root)
            self.root = newRoot

            let patch = StorePatch(op: .set, keyPath: keyPath, oldValue: oldValue, newValue: value)
            self.emitChange(patch: patch)
            self.saveToBackend()

            self.logger?.debug("Store.set: \(keyPath) = \(value)", category: "Store")
        }
    }

    public func merge(_ keyPath: String, _ object: [String: StoreValue]) {
        queue.async { [weak self] in
            guard let self = self else { return }

            let (newRoot, oldValue) = KeyPathNavigator.merge(keyPath, object: object, in: self.root)
            self.root = newRoot

            let patch = StorePatch(op: .merge, keyPath: keyPath, oldValue: oldValue, newValue: .object(object))
            self.emitChange(patch: patch)
            self.saveToBackend()

            self.logger?.debug("Store.merge: \(keyPath)", category: "Store")
        }
    }

    public func remove(_ keyPath: String) {
        queue.async { [weak self] in
            guard let self = self else { return }

            let (newRoot, removedValue) = KeyPathNavigator.remove(keyPath, from: self.root)
            self.root = newRoot

            let patch = StorePatch(op: .remove, keyPath: keyPath, oldValue: removedValue, newValue: nil)
            self.emitChange(patch: patch)
            self.saveToBackend()

            self.logger?.debug("Store.remove: \(keyPath)", category: "Store")
        }
    }

    // MARK: - Batch Operations

    public func transaction(_ block: @escaping (Store) -> Void) {
        queue.async { [weak self] in
            guard let self = self else { return }

            let txID = UUID()
            self.currentTransactionID = txID
            self.transactionPatches = []

            // Execute the block
            block(self)

            // Emit all patches as a single change
            if !self.transactionPatches.isEmpty {
                let change = StoreChange(patches: self.transactionPatches, transactionID: txID)
                self.changeSubject.send(change)
            }

            self.currentTransactionID = nil
            self.transactionPatches = []

            self.saveToBackend()

            self.logger?.debug("Store.transaction: \(self.transactionPatches.count) patches", category: "Store")
        }
    }

    // MARK: - Observation

    public func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never> {
        return StorePublisher(
            keyPath: keyPath,
            changeSubject: changeSubject,
            getCurrentValue: { [weak self] in
                self?.get(keyPath)
            }
        ).eraseToAnyPublisher()
    }

    public func publisher(for keyPaths: Set<String>) -> AnyPublisher<[String: StoreValue?], Never> {
        return StoreMultiKeyPublisher(
            keyPaths: keyPaths,
            changeSubject: changeSubject,
            getCurrentValues: { [weak self] in
                var result: [String: StoreValue?] = [:]
                for keyPath in keyPaths {
                    result[keyPath] = self?.get(keyPath)
                }
                return result
            }
        ).eraseToAnyPublisher()
    }

    // MARK: - Snapshot

    public func snapshot() -> [String: StoreValue] {
        return queue.sync {
            root.objectValue ?? [:]
        }
    }

    public func replaceAll(with root: [String: StoreValue]) {
        queue.async { [weak self] in
            guard let self = self else { return }

            self.root = .object(root)

            // Emit a change affecting root
            let patch = StorePatch(op: .set, keyPath: "", oldValue: nil, newValue: self.root)
            let change = StoreChange(patch: patch)
            self.changeSubject.send(change)

            self.saveToBackend()

            self.logger?.debug("Store.replaceAll: replaced entire store", category: "Store")
        }
    }

    // MARK: - Private Helpers

    private func emitChange(patch: StorePatch) {
        if let txID = currentTransactionID {
            // We're in a transaction - accumulate patches
            transactionPatches.append(patch)
        } else {
            // Emit immediately
            let change = StoreChange(patch: patch)
            changeSubject.send(change)
        }
    }

    private func loadFromBackend() {
        queue.async { [weak self] in
            guard let self = self else { return }

            Task {
                if let data = await self.backend.load() {
                    self.queue.async {
                        self.root = .object(data)
                        self.logger?.debug("Store loaded from backend: \(data.keys.count) keys", category: "Store")
                    }
                }
            }
        }
    }

    private func saveToBackend() {
        Task { @Sendable [weak self] in
            guard let self = self else { return }
            let snapshot = self.snapshot()

            do {
                try await self.backend.save(snapshot)
            } catch {
                self.logger?.error("Failed to save to backend: \(error)", category: "Store")
            }
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
