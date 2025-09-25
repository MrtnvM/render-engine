import Foundation
import Combine

/// Default implementation of KeyValueStore
public class DefaultKeyValueStore: KeyValueStore {
    public let scope: Scope
    public let scenarioID: String?

    private let store: DefaultStore
    private let queue: DispatchQueue
    private var storage: [String: StoreValue] = [:]
    private var validationOptions: ValidationOptions = ValidationOptions()
    private var liveExpressions: [String: LiveExpression] = [:]
    private var subscriptions: Set<AnyCancellable> = []

    // Publishers
    private let valueSubject = CurrentValueSubject<[String: StoreValue], Never>([:])
    private let changeSubject = PassthroughSubject<StoreChange, Never>()

    public init(scope: Scope, store: DefaultStore, queue: DispatchQueue) {
        self.scope = scope
        self.store = store
        self.queue = queue
        self.scenarioID = scenarioID(for: scope)

        // Load initial data
        loadData()

        // Set up live expression subscriptions
        setupLiveExpressions()
    }

    public func get(_ keyPath: String) -> StoreValue? {
        return queue.sync {
            storage[keyPath]
        }
    }

    public func get<T: Decodable>(_ keyPath: String, as: T.Type) throws -> T {
        guard let value = get(keyPath) else {
            throw StoreError.keyNotFound(keyPath)
        }

        // Convert StoreValue to JSON data and decode
        let data = try JSONEncoder().encode(value)
        return try JSONDecoder().decode(T.self, from: data)
    }

    public func exists(_ keyPath: String) -> Bool {
        return queue.sync {
            storage[keyPath] != nil
        }
    }

    public func set(_ keyPath: String, _ value: StoreValue) {
        queue.async { [weak self] in
            self?.performSet(keyPath, value)
        }
    }

    public func merge(_ keyPath: String, _ object: [String: StoreValue]) {
        queue.async { [weak self] in
            self?.performMerge(keyPath, object)
        }
    }

    public func remove(_ keyPath: String) {
        queue.async { [weak self] in
            self?.performRemove(keyPath)
        }
    }

    public func transaction(_ block: (KeyValueStore) -> Void) {
        queue.async { [weak self] in
            self?.performTransaction(block)
        }
    }

    public func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never> {
        return valueSubject
            .map { $0[keyPath] }
            .eraseToAnyPublisher()
    }

    public func publisher(for keyPaths: Set<String>) -> AnyPublisher<StoreValue, Never> {
        return valueSubject
            .map { values in
                keyPaths.reduce(into: [String: StoreValue]()) { result, keyPath in
                    if let value = values[keyPath] {
                        result[keyPath] = value
                    }
                }
            }
            .eraseToAnyPublisher()
    }

    public func snapshot() -> [String: StoreValue] {
        return queue.sync {
            storage
        }
    }

    public func replaceAll(with root: [String: StoreValue]) {
        queue.async { [weak self] in
            self?.performReplaceAll(root)
        }
    }

    public func configureValidation(_ options: ValidationOptions) {
        queue.async { [weak self] in
            self?.validationOptions = options
        }
    }

    public func validateWrite(_ keyPath: String, _ value: StoreValue) -> ValidationResult {
        return validationOptions.schema[keyPath]?.validate(value) ?? .ok
    }

    public func registerLiveExpression(_ expr: LiveExpression) {
        queue.async { [weak self] in
            self?.liveExpressions[expr.id] = expr
            self?.setupLiveExpression(expr)
        }
    }

    public func unregisterLiveExpression(id: String) {
        queue.async { [weak self] in
            self?.liveExpressions.removeValue(forKey: id)
        }
    }

    // MARK: - Private Methods

    private func loadData() {
        switch scope {
        case .appMemory:
            // Memory store starts empty
            break
        case .userPrefs(let suite):
            loadFromUserDefaults(suite: suite)
        case .file(let url):
            loadFromFile(url: url)
        case .scenarioSession:
            loadFromScenarioSession()
        case .backend:
            // Backend data is loaded on demand
            break
        }
    }

    private func loadFromUserDefaults(suite: String?) {
        let defaults = suite.flatMap { UserDefaults(suiteName: $0) } ?? .standard
        if let data = defaults.data(forKey: storeDataKey) {
            storage = (try? JSONDecoder().decode([String: StoreValue].self, from: data)) ?? [:]
        }
    }

    private func loadFromFile(url: URL) {
        if let data = try? Data(contentsOf: url) {
            storage = (try? JSONDecoder().decode([String: StoreValue].self, from: data)) ?? [:]
        }
    }

    private func loadFromScenarioSession() {
        if let data = UserDefaults.standard.data(forKey: scenarioDataKey) {
            storage = (try? JSONDecoder().decode([String: StoreValue].self, from: data)) ?? [:]
        }
    }

    private func saveData() {
        switch scope {
        case .appMemory:
            break
        case .userPrefs(let suite):
            saveToUserDefaults(suite: suite)
        case .file(let url):
            saveToFile(url: url)
        case .scenarioSession:
            saveToScenarioSession()
        case .backend:
            // Backend saves happen through the backend adapter
            break
        }
    }

    private func saveToUserDefaults(suite: String?) {
        let defaults = suite.flatMap { UserDefaults(suiteName: $0) } ?? .standard
        if let data = try? JSONEncoder().encode(storage) {
            defaults.set(data, forKey: storeDataKey)
        }
    }

    private func saveToFile(url: URL) {
        if let data = try? JSONEncoder().encode(storage) {
            try? data.write(to: url, options: .atomic)
        }
    }

    private func saveToScenarioSession() {
        if let data = try? JSONEncoder().encode(storage) {
            UserDefaults.standard.set(data, forKey: scenarioDataKey)
        }
    }

    private var storeDataKey: String {
        "\(store.appID)_\(scope.description)"
    }

    private func scenarioID(for scope: Scope) -> String? {
        switch scope {
        case .scenarioSession(let id):
            return id
        default:
            return nil
        }
    }

    private func performSet(_ keyPath: String, _ value: StoreValue) {
        let validationResult = validateWrite(keyPath, value)

        switch validationOptions.mode {
        case .strict:
            guard validationResult.isValid else {
                print("Store validation failed: \(validationResult)")
                return
            }
        case .lenient:
            if !validationResult.isValid {
                print("Store validation warning: \(validationResult)")
                // Use default value if available
                if let rule = validationOptions.schema[keyPath],
                   let defaultValue = rule.defaultValue {
                    performSet(keyPath, defaultValue)
                    return
                }
            }
        }

        let oldValue = storage[keyPath]
        storage[keyPath] = value

        // Notify change
        let change = StoreChange(
            scenarioID: scenarioID ?? "",
            patches: [StorePatch(op: .set, keyPath: keyPath, oldValue: oldValue, newValue: value)]
        )

        valueSubject.send(storage)
        changeSubject.send(change)
        store.storeSubject.send(change)

        saveData()
        evaluateLiveExpressions()
    }

    private func performMerge(_ keyPath: String, _ object: [String: StoreValue]) {
        let oldValue = storage[keyPath]
        let mergedValue: StoreValue

        if var existingObject = storage[keyPath]?.objectValue {
            existingObject.merge(object) { _, new in new }
            mergedValue = .object(existingObject)
        } else {
            mergedValue = .object(object)
        }

        storage[keyPath] = mergedValue

        let change = StoreChange(
            scenarioID: scenarioID ?? "",
            patches: [StorePatch(op: .merge, keyPath: keyPath, oldValue: oldValue, newValue: mergedValue)]
        )

        valueSubject.send(storage)
        changeSubject.send(change)
        store.storeSubject.send(change)

        saveData()
        evaluateLiveExpressions()
    }

    private func performRemove(_ keyPath: String) {
        let oldValue = storage[keyPath]
        storage.removeValue(forKey: keyPath)

        let change = StoreChange(
            scenarioID: scenarioID ?? "",
            patches: [StorePatch(op: .remove, keyPath: keyPath, oldValue: oldValue)]
        )

        valueSubject.send(storage)
        changeSubject.send(change)
        store.storeSubject.send(change)

        saveData()
        evaluateLiveExpressions()
    }

    private func performTransaction(_ block: (KeyValueStore) -> Void) {
        // For now, just execute the block synchronously
        // In a more sophisticated implementation, this could batch changes
        block(self)
    }

    private func performReplaceAll(with root: [String: StoreValue]) {
        storage = root

        let change = StoreChange(
            scenarioID: scenarioID ?? "",
            patches: [StorePatch(op: .set, keyPath: "", newValue: .object(root))]
        )

        valueSubject.send(storage)
        changeSubject.send(change)
        store.storeSubject.send(change)

        saveData()
        evaluateLiveExpressions()
    }

    private func setupLiveExpressions() {
        // This would set up subscriptions for dependencies
        // For now, we'll evaluate expressions when values change
    }

    private func setupLiveExpression(_ expr: LiveExpression) {
        // Set up subscriptions to dependencies
        expr.dependsOn.forEach { dependency in
            publisher(for: dependency)
                .sink { [weak self] _ in
                    self?.evaluateExpression(expr)
                }
                .store(in: &subscriptions)
        }

        // Evaluate immediately
        evaluateExpression(expr)
    }

    private func evaluateExpression(_ expr: LiveExpression) {
        let result = expr.compute { [weak self] keyPath in
            self?.get(keyPath)
        }

        if let result = result {
            switch expr.policy {
            case .writeIfChanged:
                if get(expr.outputKeyPath) != result {
                    set(expr.outputKeyPath, result)
                }
            case .alwaysWrite:
                set(expr.outputKeyPath, result)
            }
        }
    }

    private func evaluateLiveExpressions() {
        liveExpressions.values.forEach(evaluateExpression)
    }
}

// MARK: - Store Error

public enum StoreError: Error {
    case keyNotFound(String)
    case invalidType
    case validationFailed(String)
}