import Foundation
import Combine

/// File-based storage backend
public class FileStoreBackend: KeyValueStore {
    public let scope: Scope
    public let scenarioID: String?

    private let fileURL: URL
    private var storage: [String: StoreValue] = [:]
    private var validationOptions: ValidationOptions = ValidationOptions()
    private var liveExpressions: [String: LiveExpression] = [:]
    private var subscriptions: Set<AnyCancellable> = []

    // Publishers
    private let valueSubject = CurrentValueSubject<[String: StoreValue], Never>([:])
    private let changeSubject = PassthroughSubject<StoreChange, Never>()

    public init(scope: Scope, appID: String) throws {
        guard case let .file(url) = scope else {
            throw StoreError.invalidConfiguration("FileStoreBackend requires file scope")
        }

        self.scope = scope
        self.scenarioID = scenarioID(for: scope)
        self.fileURL = url

        // Ensure directory exists
        try FileManager.default.createDirectory(
            at: url.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )

        loadData()
        setupLiveExpressions()
    }

    private func scenarioID(for scope: Scope) -> String? {
        switch scope {
        case .scenarioSession(let id):
            return id
        default:
            return nil
        }
    }

    private func loadData() {
        if let data = try? Data(contentsOf: fileURL) {
            storage = (try? JSONDecoder().decode([String: StoreValue].self, from: data)) ?? [:]
            valueSubject.send(storage)
        }
    }

    private func saveData() {
        do {
            let data = try JSONEncoder().encode(storage)
            try data.write(to: fileURL, options: .atomic)
        } catch {
            print("Failed to save file store data: \(error)")
        }
    }

    public func get(_ keyPath: String) -> StoreValue? {
        storage[keyPath]
    }

    public func get<T: Decodable>(_ keyPath: String, as: T.Type) throws -> T {
        guard let value = get(keyPath) else {
            throw StoreError.keyNotFound(keyPath)
        }

        let data = try JSONEncoder().encode(value)
        return try JSONDecoder().decode(T.self, from: data)
    }

    public func exists(_ keyPath: String) -> Bool {
        storage[keyPath] != nil
    }

    public func set(_ keyPath: String, _ value: StoreValue) {
        let validationResult = validateWrite(keyPath, value)

        switch validationOptions.mode {
        case .strict:
            guard validationResult.isValid else {
                print("File store validation failed: \(validationResult)")
                return
            }
        case .lenient:
            if !validationResult.isValid {
                print("File store validation warning: \(validationResult)")
                if let rule = validationOptions.schema[keyPath],
                   let defaultValue = rule.defaultValue {
                    set(keyPath, defaultValue)
                    return
                }
            }
        }

        let oldValue = storage[keyPath]
        storage[keyPath] = value

        let change = StoreChange(
            scenarioID: scenarioID ?? "",
            patches: [StorePatch(op: .set, keyPath: keyPath, oldValue: oldValue, newValue: value)]
        )

        valueSubject.send(storage)
        changeSubject.send(change)
        saveData()
    }

    public func merge(_ keyPath: String, _ object: [String: StoreValue]) {
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
        saveData()
    }

    public func remove(_ keyPath: String) {
        let oldValue = storage[keyPath]
        storage.removeValue(forKey: keyPath)

        let change = StoreChange(
            scenarioID: scenarioID ?? "",
            patches: [StorePatch(op: .remove, keyPath: keyPath, oldValue: oldValue)]
        )

        valueSubject.send(storage)
        changeSubject.send(change)
        saveData()
    }

    public func transaction(_ block: (KeyValueStore) -> Void) {
        block(self)
    }

    public func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never> {
        valueSubject
            .map { $0[keyPath] }
            .eraseToAnyPublisher()
    }

    public func publisher(for keyPaths: Set<String>) -> AnyPublisher<StoreValue, Never> {
        valueSubject
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
        storage
    }

    public func replaceAll(with root: [String: StoreValue]) {
        storage = root

        let change = StoreChange(
            scenarioID: scenarioID ?? "",
            patches: [StorePatch(op: .set, keyPath: "", newValue: .object(root))]
        )

        valueSubject.send(storage)
        changeSubject.send(change)
        saveData()
    }

    public func configureValidation(_ options: ValidationOptions) {
        validationOptions = options
    }

    public func validateWrite(_ keyPath: String, _ value: StoreValue) -> ValidationResult {
        validationOptions.schema[keyPath]?.validate(value) ?? .ok
    }

    public func registerLiveExpression(_ expr: LiveExpression) {
        liveExpressions[expr.id] = expr
        setupLiveExpression(expr)
    }

    public func unregisterLiveExpression(id: String) {
        liveExpressions.removeValue(forKey: id)
    }

    private func setupLiveExpressions() {
        // Set up subscriptions for dependencies
    }

    private func setupLiveExpression(_ expr: LiveExpression) {
        expr.dependsOn.forEach { dependency in
            publisher(for: dependency)
                .sink { [weak self] _ in
                    self?.evaluateExpression(expr)
                }
                .store(in: &subscriptions)
        }
        evaluateExpression(expr)
    }

    private func evaluateExpression(_ expr: LiveExpression) {
        let result = expr.compute { keyPath in
            get(keyPath)
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
}