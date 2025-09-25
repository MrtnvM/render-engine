import Foundation
import Combine

/// Base implementation of the Store protocol
public class BaseStore: Store {
    public let scope: Scope
    public let storage: Storage

    private let storageBackend: StoreStorageBackend
    private let serialQueue: DispatchQueue
    private var validationOptions = ValidationOptions()

    // MARK: - Publishers

    private let changeSubject = PassthroughSubject<StoreChange, Never>()
    public lazy var changePublisher = changeSubject.eraseToAnyPublisher()

    private var keyPathSubjects: [String: CurrentValueSubject<StoreValue?, Never>] = [:]
    private var subscriptions: Set<AnyCancellable> = []

    // MARK: - Initialization

    public init(scope: Scope, storage: Storage, storageBackend: StoreStorageBackend) {
        self.scope = scope
        self.storage = storage
        self.storageBackend = storageBackend
        self.serialQueue = DispatchQueue(label: "com.render.store.\(scope.description).\(storage.identifier)", qos: .userInitiated)

        setupPublishers()
    }

    // MARK: - IO Operations

    public func get(_ keyPath: String) -> StoreValue? {
        return serialQueue.sync {
            validateKeyPath(keyPath)
            return storageBackend.get(keyPath)
        }
    }

    public func get<T: Decodable>(_ keyPath: String, as: T.Type) throws -> T {
        return try serialQueue.sync {
            validateKeyPath(keyPath)

            guard let value = storageBackend.get(keyPath) else {
                throw StoreError.keyPathNotFound(keyPath)
            }

            let encoder = JSONEncoder()
            let decoder = JSONDecoder()

            // Convert StoreValue to JSON data
            let jsonData = try encoder.encode(value)

            // Decode to the target type
            return try decoder.decode(T.self, from: jsonData)
        }
    }

    public func exists(_ keyPath: String) -> Bool {
        return serialQueue.sync {
            validateKeyPath(keyPath)
            return storageBackend.exists(keyPath)
        }
    }

    // MARK: - Mutation Operations

    public func set(_ keyPath: String, _ value: StoreValue) {
        serialQueue.async { [weak self] in
            self?.performSet(keyPath, value)
        }
    }

    public func merge(_ keyPath: String, _ object: [String: StoreValue]) {
        serialQueue.async { [weak self] in
            self?.performMerge(keyPath, object)
        }
    }

    public func remove(_ keyPath: String) {
        serialQueue.async { [weak self] in
            self?.performRemove(keyPath)
        }
    }

    // MARK: - Batch Operations

    public func transaction(_ block: (Store) -> Void) {
        serialQueue.async { [weak self] in
            self?.performTransaction(block)
        }
    }

    // MARK: - Snapshot Operations

    public func snapshot() -> [String: StoreValue] {
        return serialQueue.sync {
            storageBackend.snapshot()
        }
    }

    public func replaceAll(with root: [String: StoreValue]) {
        serialQueue.async { [weak self] in
            self?.performReplaceAll(root)
        }
    }

    // MARK: - Validation

    public func configureValidation(_ options: ValidationOptions) {
        serialQueue.async { [weak self] in
            self?.validationOptions = options
        }
    }

    public func validateWrite(_ keyPath: String, _ value: StoreValue) -> ValidationResult {
        // Check if there's a validation rule for this key path
        if let rule = validationOptions.rule(for: keyPath) {
            return rule.validate(value)
        }

        return .ok
    }

    // MARK: - Private Methods

    private func validateKeyPath(_ keyPath: String) {
        guard !keyPath.isEmpty else {
            fatalError("Key path cannot be empty")
        }

        // Basic key path validation
        let components = keyPath.split(separator: ".")
        for component in components {
            guard !component.isEmpty else {
                fatalError("Invalid key path: \(keyPath)")
            }
        }
    }

    private func performSet(_ keyPath: String, _ value: StoreValue) {
        validateKeyPath(keyPath)

        // Validate the write
        let validationResult = validateWrite(keyPath, value)
        if case .failed(let reason) = validationResult {
            if validationOptions.mode == .strict {
                fatalError("Store validation failed: \(reason)")
            } else {
                print("Store validation warning: \(reason)")
            }
        }

        let oldValue = storageBackend.get(keyPath)
        storageBackend.set(keyPath, value)

        let patch = StorePatch(op: .set, keyPath: keyPath, oldValue: oldValue, newValue: value)
        let change = StoreChange(patches: [patch])

        notifyChange(change)
    }

    private func performMerge(_ keyPath: String, _ object: [String: StoreValue]) {
        validateKeyPath(keyPath)

        let oldValue = storageBackend.get(keyPath)
        storageBackend.merge(keyPath, object)

        let newValue = storageBackend.get(keyPath) ?? .null
        let patch = StorePatch(op: .merge, keyPath: keyPath, oldValue: oldValue, newValue: newValue)
        let change = StoreChange(patches: [patch])

        notifyChange(change)
    }

    private func performRemove(_ keyPath: String) {
        validateKeyPath(keyPath)

        let oldValue = storageBackend.get(keyPath)
        storageBackend.remove(keyPath)

        let patch = StorePatch(op: .remove, keyPath: keyPath, oldValue: oldValue, newValue: nil)
        let change = StoreChange(patches: [patch])

        notifyChange(change)
    }

    private func performTransaction(_ block: (Store) -> Void) {
        let transactionID = UUID()

        // Create a temporary storage backend that buffers changes
        let bufferedBackend = BufferedStorageBackend(wrappedBackend: storageBackend)

        // Create a temporary store with the buffered backend
        let tempStore = BaseStore(scope: scope, storage: storage, storageBackend: bufferedBackend)

        // Execute the transaction
        block(tempStore)

        // Commit all changes
        let patches = bufferedBackend.commit()

        if !patches.isEmpty {
            let change = StoreChange(patches: patches, transactionID: transactionID)
            notifyChange(change)
        }
    }

    private func performReplaceAll(with root: [String: StoreValue]) {
        let oldSnapshot = storageBackend.snapshot()

        storageBackend.replaceAll(root)

        let newSnapshot = storageBackend.snapshot()

        // Create patches for all changes
        var patches: [StorePatch] = []

        // Find removed keys
        for (key, oldValue) in oldSnapshot {
            if newSnapshot[key] == nil {
                patches.append(StorePatch(op: .remove, keyPath: key, oldValue: oldValue, newValue: nil))
            }
        }

        // Find changed/added keys
        for (key, newValue) in newSnapshot {
            let oldValue = oldSnapshot[key]
            let op: StorePatch.Op = oldValue == nil ? .set : .set
            patches.append(StorePatch(op: op, keyPath: key, oldValue: oldValue, newValue: newValue))
        }

        if !patches.isEmpty {
            let change = StoreChange(patches: patches)
            notifyChange(change)
        }
    }

    private func notifyChange(_ change: StoreChange) {
        changeSubject.send(change)

        // Notify affected key path publishers
        for keyPath in change.affectedKeyPaths {
            keyPathSubjects[keyPath]?.send(get(keyPath))
        }
    }

    private func setupPublishers() {
        // Set up a publisher for all key paths
        changePublisher
            .sink { [weak self] change in
                // This will be handled by notifyChange
            }
            .store(in: &subscriptions)
    }
}

// MARK: - Publisher Extensions

extension BaseStore {
    public func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never> {
        return keyPathSubjects[keyPath, default: createKeyPathSubject(for: keyPath)].eraseToAnyPublisher()
    }

    public func publisher(for keyPaths: Set<String>) -> AnyPublisher<StoreValue, Never> {
        let publishers = keyPaths.map { publisher(for: $0) }
        return Publishers.MergeMany(publishers).eraseToAnyPublisher()
    }

    private func createKeyPathSubject(for keyPath: String) -> CurrentValueSubject<StoreValue?, Never> {
        let subject = CurrentValueSubject<StoreValue?, Never>(get(keyPath))
        keyPathSubjects[keyPath] = subject
        return subject
    }
}