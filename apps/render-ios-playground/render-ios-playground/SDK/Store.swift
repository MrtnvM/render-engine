import Foundation
import Combine

/// Default implementation of the Store protocol
public class DefaultStore: Store {
    public let scope: Scope
    public let storage: Storage

    private let backend: StoreBackend
    private let queue: DispatchQueue
    private let version: SemanticVersion

    private var data: [String: StoreValue] = [:]
    private var validationOptions: ValidationOptions = .lenient
    private var subscribers: [String: AnyCancellable] = [:]
    private let changeSubject = PassthroughSubject<StoreChange, Never>()
    private let keyPathSubject = PassthroughSubject<(keyPath: String, value: StoreValue?), Never>()

    public init(
        scope: Scope,
        storage: Storage,
        backend: StoreBackend,
        version: SemanticVersion
    ) {
        self.scope = scope
        self.storage = storage
        self.backend = backend
        self.version = version
        self.queue = DispatchQueue(label: "com.render.store.\(scope.id).\(storage.id)", qos: .userInitiated)

        // Load initial data from backend
        queue.sync {
            self.data = backend.load()
        }
    }

    // MARK: - IO Operations

    public func get(_ keyPath: String) -> StoreValue? {
        queue.sync {
            resolveKeyPath(keyPath).flatMap { data[$0] }
        }
    }

    public func get<T: Decodable>(_ keyPath: String, as: T.Type) throws -> T {
        guard let value = get(keyPath) else {
            throw StoreError.keyNotFound(keyPath)
        }

        // Convert StoreValue to the requested type
        let encoder = JSONEncoder()
        let decoder = JSONDecoder()

        let jsonData = try encoder.encode(value)
        return try decoder.decode(T.self, from: jsonData)
    }

    public func exists(_ keyPath: String) -> Bool {
        get(keyPath) != nil
    }

    // MARK: - Mutations

    public func set(_ keyPath: String, _ value: StoreValue) {
        queue.async {
            self.performSet(keyPath, value)
        }
    }

    public func merge(_ keyPath: String, _ object: [String: StoreValue]) {
        queue.async {
            self.performMerge(keyPath, object)
        }
    }

    public func remove(_ keyPath: String) {
        queue.async {
            self.performRemove(keyPath)
        }
    }

    public func transaction(_ block: (Store) -> Void) {
        queue.async {
            let transactionID = UUID()
            let oldData = self.data

            block(self)

            // Create patches for all changes
            var patches: [StorePatch] = []
            for (keyPath, newValue) in self.data {
                if let oldValue = oldData[keyPath] {
                    if oldValue != newValue {
                        patches.append(StorePatch(
                            op: .set,
                            keyPath: keyPath,
                            oldValue: oldValue,
                            newValue: newValue
                        ))
                    }
                } else {
                    patches.append(StorePatch(
                        op: .set,
                        keyPath: keyPath,
                        newValue: newValue
                    ))
                }
            }

            for keyPath in oldData.keys where self.data[keyPath] == nil {
                if let oldValue = oldData[keyPath] {
                    patches.append(StorePatch(
                        op: .remove,
                        keyPath: keyPath,
                        oldValue: oldValue
                    ))
                }
            }

            if !patches.isEmpty {
                let change = StoreChange(patches: patches, transactionID: transactionID)
                self.notifySubscribers(change)
            }
        }
    }

    // MARK: - Observation

    public func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never> {
        keyPathSubject
            .filter { $0.keyPath == keyPath }
            .map { $0.value }
            .eraseToAnyPublisher()
    }

    public func publisher(for keyPaths: Set<String>) -> AnyPublisher<StoreChange, Never> {
        changeSubject
            .filter { change in
                change.patches.contains { patch in
                    keyPaths.contains(patch.keyPath)
                }
            }
            .eraseToAnyPublisher()
    }

    // MARK: - Snapshot

    public func snapshot() -> [String: StoreValue] {
        queue.sync { data }
    }

    public func replaceAll(with root: [String: StoreValue]) {
        queue.async {
            let oldData = self.data
            self.data = root

            // Create patches for all changes
            var patches: [StorePatch] = []
            for (keyPath, newValue) in root {
                if let oldValue = oldData[keyPath] {
                    if oldValue != newValue {
                        patches.append(StorePatch(
                            op: .set,
                            keyPath: keyPath,
                            oldValue: oldValue,
                            newValue: newValue
                        ))
                    }
                } else {
                    patches.append(StorePatch(
                        op: .set,
                        keyPath: keyPath,
                        newValue: newValue
                    ))
                }
            }

            for keyPath in oldData.keys where root[keyPath] == nil {
                if let oldValue = oldData[keyPath] {
                    patches.append(StorePatch(
                        op: .remove,
                        keyPath: keyPath,
                        oldValue: oldValue
                    ))
                }
            }

            if !patches.isEmpty {
                let change = StoreChange(patches: patches)
                self.notifySubscribers(change)
            }
        }
    }

    // MARK: - Validation

    public func configureValidation(_ options: ValidationOptions) {
        queue.async {
            self.validationOptions = options
        }
    }

    public func validateWrite(_ keyPath: String, _ value: StoreValue) -> ValidationResult {
        queue.sync {
            validateValue(keyPath, value)
        }
    }

    // MARK: - Private Methods

    private func performSet(_ keyPath: String, _ value: StoreValue) {
        let resolvedKeyPath = resolveKeyPath(keyPath) ?? keyPath
        let validationResult = validateValue(keyPath, value)

        guard validationResult.isValid else {
            if validationOptions.mode == .strict {
                return // Don't set invalid values in strict mode
            }
        }

        let oldValue = data[resolvedKeyPath]
        data[resolvedKeyPath] = value

        let patch = StorePatch(
            op: .set,
            keyPath: keyPath,
            oldValue: oldValue,
            newValue: value
        )

        let change = StoreChange(patches: [patch])
        notifySubscribers(change)
    }

    private func performMerge(_ keyPath: String, _ object: [String: StoreValue]) {
        let resolvedKeyPath = resolveKeyPath(keyPath) ?? keyPath

        // Validate each value in the object
        var validatedObject = [String: StoreValue]()
        for (key, value) in object {
            let fullKeyPath = keyPath.isEmpty ? key : "\(keyPath).\(key)"
            let validationResult = validateValue(fullKeyPath, value)

            if validationResult.isValid {
                validatedObject[key] = value
            } else if validationOptions.mode == .lenient {
                // Use default value if available
                if let rule = validationOptions.schema[fullKeyPath],
                   let defaultValue = rule.defaultValue {
                    validatedObject[key] = defaultValue
                }
            }
        }

        let oldValue = data[resolvedKeyPath]
        data[resolvedKeyPath] = .object(validatedObject)

        let patch = StorePatch(
            op: .merge,
            keyPath: keyPath,
            oldValue: oldValue,
            newValue: .object(validatedObject)
        )

        let change = StoreChange(patches: [patch])
        notifySubscribers(change)
    }

    private func performRemove(_ keyPath: String) {
        let resolvedKeyPath = resolveKeyPath(keyPath) ?? keyPath

        guard let oldValue = data[resolvedKeyPath] else { return }

        data.removeValue(forKey: resolvedKeyPath)

        let patch = StorePatch(
            op: .remove,
            keyPath: keyPath,
            oldValue: oldValue
        )

        let change = StoreChange(patches: [patch])
        notifySubscribers(change)
    }

    private func validateValue(_ keyPath: String, _ value: StoreValue) -> ValidationResult {
        guard let rule = validationOptions.schema[keyPath] else {
            return .ok // No validation rule means any value is acceptable
        }

        // Check required fields
        if rule.required && value == .null {
            return .failed(reason: "Field '\(keyPath)' is required")
        }

        // Check type
        let actualKind: ValidationRule.Kind
        switch value {
        case .string: actualKind = .string
        case .number: actualKind = .number
        case .integer: actualKind = .integer
        case .bool: actualKind = .bool
        case .color: actualKind = .color
        case .url: actualKind = .url
        case .array: actualKind = .array
        case .object: actualKind = .object
        case .null: return .ok // null is acceptable for optional fields
        }

        if actualKind != rule.kind {
            if validationOptions.mode == .lenient, let defaultValue = rule.defaultValue {
                return .ok // Will use default value in lenient mode
            }
            return .failed(reason: "Field '\(keyPath)' must be of type \(rule.kind.rawValue), got \(actualKind.rawValue)")
        }

        // Check numeric constraints
        if let min = rule.min {
            switch value {
            case .number(let num) where num < min:
                return .failed(reason: "Field '\(keyPath)' must be >= \(min), got \(num)")
            case .integer(let int) where Double(int) < min:
                return .failed(reason: "Field '\(keyPath)' must be >= \(min), got \(int)")
            default:
                break
            }
        }

        if let max = rule.max {
            switch value {
            case .number(let num) where num > max:
                return .failed(reason: "Field '\(keyPath)' must be <= \(max), got \(num)")
            case .integer(let int) where Double(int) > max:
                return .failed(reason: "Field '\(keyPath)' must be <= \(max), got \(int)")
            default:
                break
            }
        }

        // Check pattern (for strings)
        if let pattern = rule.pattern, case .string(let string) = value {
            do {
                let regex = try NSRegularExpression(pattern: pattern)
                let range = NSRange(location: 0, length: string.utf16.count)
                guard regex.firstMatch(in: string, range: range) != nil else {
                    return .failed(reason: "Field '\(keyPath)' does not match pattern '\(pattern)'")
                }
            } catch {
                return .failed(reason: "Invalid regex pattern '\(pattern)': \(error.localizedDescription)")
            }
        }

        return .ok
    }

    private func resolveKeyPath(_ keyPath: String) -> String? {
        // Simple key path resolution - in a real implementation,
        // this would handle dot notation and array indices
        guard !keyPath.isEmpty else { return nil }
        return keyPath
    }

    private func notifySubscribers(_ change: StoreChange) {
        // Save to backend
        backend.save(data)

        // Notify subscribers
        changeSubject.send(change)
        keyPathSubject.send((keyPath: change.patches.first?.keyPath ?? "", value: data[change.patches.first?.keyPath ?? ""]))
    }
}

// MARK: - Errors

public enum StoreError: Error {
    case keyNotFound(String)
    case validationFailed(String)
    case encodingFailed(String)
    case decodingFailed(String)
}