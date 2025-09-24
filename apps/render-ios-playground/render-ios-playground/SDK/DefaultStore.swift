import Foundation
import Combine

public final class DefaultStore: Store {
    public let appID: String

    private var storesByScope: [String: DefaultKeyValueStore] = [:]
    private let lock = NSLock()

    public init(appID: String) {
        self.appID = appID
    }

    public func named(_ scope: Scope) -> KeyValueStore {
        let key = scope.cacheKey
        lock.lock()
        defer { lock.unlock() }
        if let existing = storesByScope[key] { return existing }
        let store = DefaultKeyValueStore(appID: appID, scope: scope)
        storesByScope[key] = store
        return store
    }
}

fileprivate extension Scope {
    var cacheKey: String {
        switch self {
        case .appMemory: return "appMemory"
        case .userPrefs(let suite): return "userPrefs:\(suite ?? "default")"
        case .file(let url): return "file:\(url.absoluteString)"
        case .scenarioSession(let id): return "scenario:\(id)"
        case .backend(let ns, let id): return "backend:\(ns):\(id ?? "none")"
        }
    }
}

final class DefaultKeyValueStore: KeyValueStore {
    let appID: String
    let scope: Scope
    var scenarioID: String? {
        if case .scenarioSession(let id) = scope { return id }
        if case .backend(_, let id) = scope { return id }
        return nil
    }

    private let queue: DispatchQueue
    private var root: [String: StoreValue]
    private var validation: ValidationOptions = .init()

    private var valueSubjects: [String: CurrentValueSubject<StoreValue?, Never>] = [:]
    private let changeSubject = PassthroughSubject<StoreChange, Never>()
    private var liveExpressions: [String: LiveExpression] = [:]
    private var liveExprCancellables: [String: Set<AnyCancellable>] = [:]

    private var isInTransaction: Bool = false
    private var transactionPatches: [StorePatch] = []
    private var transactionID: UUID?

    init(appID: String, scope: Scope) {
        self.appID = appID
        self.scope = scope
        self.queue = DispatchQueue(label: "store.\(appID).\(scope.cacheKey)")
        self.root = Self.loadInitialRoot(appID: appID, scope: scope)
    }

    // MARK: - IO
    func get(_ keyPath: String) -> StoreValue? {
        var result: StoreValue?
        queue.sync { result = StoreKeyPath.get(from: root, keyPath: keyPath) }
        return result
    }

    func get<T: Decodable>(_ keyPath: String, as: T.Type) throws -> T {
        guard let value = get(keyPath) else {
            throw NSError(domain: "DefaultKeyValueStore", code: 404, userInfo: [NSLocalizedDescriptionKey: "Value not found for keyPath \(keyPath)"])
        }
        let data = try JSONEncoder().encode(value)
        let boxed = try JSONDecoder().decode(Box<T>.self, from: data)
        return boxed.value
    }

    func exists(_ keyPath: String) -> Bool {
        return get(keyPath) != nil
    }

    // MARK: - Mutations
    func set(_ keyPath: String, _ value: StoreValue) {
        queue.sync {
            guard case .ok = validateWrite(keyPath, value) else { return }
            let old = StoreKeyPath.set(root: &root, keyPath: keyPath, value: value)
            let patch = StorePatch(op: .set, keyPath: keyPath, oldValue: old, newValue: value)
            emit(patch: patch)
            persistIfNeeded()
            evaluateLiveExpressions(for: [keyPath])
        }
    }

    func merge(_ keyPath: String, _ object: [String: StoreValue]) {
        queue.sync {
            // Read current value
            var current = StoreKeyPath.get(from: root, keyPath: keyPath)
            if case .object(var dict)? = current {
                object.forEach { dict[$0.key] = $0.value }
                let newValue: StoreValue = .object(dict)
                guard case .ok = validateWrite(keyPath, newValue) else { return }
                let old = StoreKeyPath.set(root: &root, keyPath: keyPath, value: newValue)
                let patch = StorePatch(op: .merge, keyPath: keyPath, oldValue: old, newValue: newValue)
                emit(patch: patch)
            } else {
                let newValue: StoreValue = .object(object)
                guard case .ok = validateWrite(keyPath, newValue) else { return }
                let old = StoreKeyPath.set(root: &root, keyPath: keyPath, value: newValue)
                let patch = StorePatch(op: .set, keyPath: keyPath, oldValue: old, newValue: newValue)
                emit(patch: patch)
            }
            persistIfNeeded()
            evaluateLiveExpressions(for: [keyPath])
        }
    }

    func remove(_ keyPath: String) {
        queue.sync {
            let old = StoreKeyPath.remove(root: &root, keyPath: keyPath)
            let patch = StorePatch(op: .remove, keyPath: keyPath, oldValue: old, newValue: nil)
            emit(patch: patch)
            persistIfNeeded()
            evaluateLiveExpressions(for: [keyPath])
        }
    }

    // MARK: - Batch
    func transaction(_ block: (KeyValueStore) -> Void) {
        queue.sync {
            isInTransaction = true
            transactionID = UUID()
            transactionPatches.removeAll()
            block(self)
            let patches = transactionPatches
            let id = transactionID
            isInTransaction = false
            transactionID = nil
            if !patches.isEmpty {
                changeSubject.send(StoreChange(patches: patches, transactionID: id))
            }
        }
    }

    // MARK: - Observation
    func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never> {
        queue.sync {
            if let subject = valueSubjects[keyPath] {
                return subject.eraseToAnyPublisher()
            }
            let current = StoreKeyPath.get(from: root, keyPath: keyPath)
            let subject = CurrentValueSubject<StoreValue?, Never>(current)
            valueSubjects[keyPath] = subject
            return subject.eraseToAnyPublisher()
        }
    }

    func publisher(for keyPaths: Set<String>) -> AnyPublisher<StoreValue, Never> {
        // Publish an object with the latest values for the given keys on any change
        let initial: StoreValue = queue.sync {
            let dict = keyPaths.reduce(into: [String: StoreValue]()) { acc, k in
                acc[k] = StoreKeyPath.get(from: root, keyPath: k) ?? .null
            }
            return .object(dict)
        }
        let subject = CurrentValueSubject<StoreValue, Never>(initial)
        let cancellable = changeSubject.sink { [weak self] change in
            guard let self else { return }
            // Check intersection
            if change.patches.contains(where: { p in keyPaths.contains(p.keyPath) || keyPaths.contains(where: { self.matchesWildcard($0, p.keyPath) }) }) {
                let dict = self.queue.sync { () -> [String: StoreValue] in
                    keyPaths.reduce(into: [String: StoreValue]()) { acc, k in
                        acc[k] = StoreKeyPath.get(from: self.root, keyPath: k) ?? .null
                    }
                }
                subject.send(.object(dict))
            }
        }
        // Keep the cancellable around by storing it in a special bag keyed by subject pointer
        // For simplicity in this SDK playground, we ignore subject lifecycle management.
        _ = cancellable
        return subject.eraseToAnyPublisher()
    }

    // MARK: - Snapshot
    func snapshot() -> [String: StoreValue] {
        queue.sync { root }
    }

    func replaceAll(with root: [String: StoreValue]) {
        queue.sync {
            self.root = root
            // coarse patch
            let patch = StorePatch(op: .merge, keyPath: "$root", oldValue: nil, newValue: .object(root))
            emit(patch: patch)
            persistIfNeeded()
            evaluateLiveExpressions(for: ["$root"]) 
        }
    }

    // MARK: - Validation
    func configureValidation(_ options: ValidationOptions) { queue.sync { self.validation = options } }

    func validateWrite(_ keyPath: String, _ value: StoreValue) -> ValidationResult {
        // Simple rules: match kind, check min/max for number/integer, regex for string
        guard let rule = validation.schema[keyPath] else { return .ok }
        let kindMatches: Bool = {
            switch (rule.kind, value) {
            case (.string, .string), (.number, .number), (.integer, .integer), (.bool, .bool), (.color, .color), (.url, .url), (.array, .array), (.object, .object):
                return true
            default:
                return false
            }
        }()
        if !kindMatches {
            if validation.mode == .lenient, let coerced = coerce(value, to: rule.kind) {
                return validateWrite(keyPath, coerced)
            }
            return .failed(reason: "Kind mismatch for \(keyPath)")
        }
        switch value {
        case .number(let d):
            if let min = rule.min, d < min { return .failed(reason: "min < \(min)") }
            if let max = rule.max, d > max { return .failed(reason: "max > \(max)") }
        case .integer(let i):
            if let min = rule.min, Double(i) < min { return .failed(reason: "min < \(min)") }
            if let max = rule.max, Double(i) > max { return .failed(reason: "max > \(max)") }
        case .string(let s):
            if let pattern = rule.pattern, let regex = try? NSRegularExpression(pattern: pattern) {
                let range = NSRange(location: 0, length: s.utf16.count)
                if regex.firstMatch(in: s, options: [], range: range) == nil {
                    return .failed(reason: "pattern mismatch")
                }
            }
        default:
            break
        }
        return .ok
    }

    private func coerce(_ value: StoreValue, to kind: ValidationRule.Kind) -> StoreValue? {
        switch (value, kind) {
        case (.string(let s), .number): return Double(s).map(StoreValue.number)
        case (.string(let s), .integer): return Int(s).map(StoreValue.integer)
        case (.number(let d), .integer): return .integer(Int(d))
        default: return nil
        }
    }

    // MARK: - Expressions
    func registerLiveExpression(_ expr: LiveExpression) {
        queue.sync {
            liveExpressions[expr.id] = expr
            subscribeToExpression(expr)
            // Evaluate once on register
            evaluateExpression(expr)
        }
    }

    func unregisterLiveExpression(id: String) {
        queue.sync {
            liveExpressions.removeValue(forKey: id)
            liveExprCancellables[id]?.forEach { $0.cancel() }
            liveExprCancellables.removeValue(forKey: id)
        }
    }

    private func subscribeToExpression(_ expr: LiveExpression) {
        var cancellables = Set<AnyCancellable>()
        let paths = Array(expr.dependsOn)
        let publisher = changeSubject
            .filter { [weak self] change in
                guard let self else { return false }
                return change.patches.contains { patch in
                    paths.contains(patch.keyPath) || paths.contains(where: { self.matchesWildcard($0, patch.keyPath) })
                }
            }
            .eraseToAnyPublisher()
        publisher.sink { [weak self] _ in
            self?.queue.sync { self?.evaluateExpression(expr) }
        }.store(in: &cancellables)
        liveExprCancellables[expr.id] = cancellables
    }

    private func evaluateLiveExpressions(for changedPaths: [String]) {
        let expressions = liveExpressions.values
        for expr in expressions {
            if expr.dependsOn.contains(where: { dep in changedPaths.contains(dep) || matchesWildcard(dep, changedPaths.first ?? "") }) {
                evaluateExpression(expr)
            }
        }
    }

    private func evaluateExpression(_ expr: LiveExpression) {
        let newValue = expr.compute { [weak self] path in
            guard let self = self else { return nil }
            return StoreKeyPath.get(from: self.root, keyPath: path)
        }
        guard let computed = newValue else { return }
        if expr.policy == .writeIfChanged {
            if let current = StoreKeyPath.get(from: root, keyPath: expr.outputKeyPath), current == computed {
                return
            }
        }
        _ = validateWrite(expr.outputKeyPath, computed)
        let old = StoreKeyPath.set(root: &root, keyPath: expr.outputKeyPath, value: computed)
        let patch = StorePatch(op: .set, keyPath: expr.outputKeyPath, oldValue: old, newValue: computed)
        emit(patch: patch)
        persistIfNeeded()
    }

    // MARK: - Helpers
    private func emit(patch: StorePatch) {
        if let subject = valueSubjects[patch.keyPath] {
            subject.send(StoreKeyPath.get(from: root, keyPath: patch.keyPath))
        }
        if isInTransaction {
            transactionPatches.append(patch)
        } else {
            changeSubject.send(StoreChange(patches: [patch], transactionID: nil))
        }
    }

    private func matchesWildcard(_ dep: String, _ path: String) -> Bool {
        // Very simple wildcard: treat "[*]" as prefix up to the bracket
        if let range = dep.range(of: "[*]") {
            let prefix = String(dep[..<range.lowerBound])
            return path.hasPrefix(prefix)
        }
        return false
    }

    private func persistIfNeeded() {
        switch scope {
        case .userPrefs:
            Self.persistToUserDefaults(appID: appID, scope: scope, root: root)
        case .file(let url):
            Self.persistToFile(url: url, root: root)
        default:
            break
        }
    }

    private static func loadInitialRoot(appID: String, scope: Scope) -> [String: StoreValue] {
        switch scope {
        case .userPrefs:
            if let loaded = loadFromUserDefaults(appID: appID, scope: scope) { return loaded }
            return [:]
        case .file(let url):
            if let loaded = loadFromFile(url: url) { return loaded }
            return [:]
        default:
            return [:]
        }
    }

    private static func persistToUserDefaults(appID: String, scope: Scope, root: [String: StoreValue]) {
        guard case .userPrefs(let suite) = scope else { return }
        let defaults = suite.flatMap { UserDefaults(suiteName: $0) } ?? .standard
        let key = "\(appID).store.userprefs"
        if let data = try? JSONEncoder().encode(StoreValue.object(root)) {
            defaults.set(data, forKey: key)
        }
    }

    private static func loadFromUserDefaults(appID: String, scope: Scope) -> [String: StoreValue]? {
        guard case .userPrefs(let suite) = scope else { return nil }
        let defaults = suite.flatMap { UserDefaults(suiteName: $0) } ?? .standard
        let key = "\(appID).store.userprefs"
        if let data = defaults.data(forKey: key), let value = try? JSONDecoder().decode(StoreValue.self, from: data), case .object(let dict) = value {
            return dict
        }
        return nil
    }

    private static func persistToFile(url: URL, root: [String: StoreValue]) {
        do {
            let data = try JSONEncoder().encode(StoreValue.object(root))
            let temp = url.appendingPathExtension("tmp")
            try data.write(to: temp, options: .atomic)
            let fm = FileManager.default
            if fm.fileExists(atPath: url.path) {
                try fm.removeItem(at: url)
            }
            try fm.moveItem(at: temp, to: url)
        } catch {
            print("Store: failed to persist to file: \(error)")
        }
    }

    private static func loadFromFile(url: URL) -> [String: StoreValue]? {
        do {
            let data = try Data(contentsOf: url)
            let value = try JSONDecoder().decode(StoreValue.self, from: data)
            if case .object(let dict) = value { return dict }
        } catch {
            return nil
        }
        return nil
    }
}

// Helper to decode StoreValue directly as boxed value into a concrete Decodable
private struct Box<T: Decodable>: Decodable {
    let value: T
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)
        switch type {
        case "string": value = try container.decode(T.self, forKey: .value)
        case "number": value = try container.decode(T.self, forKey: .value)
        case "integer": value = try container.decode(T.self, forKey: .value)
        case "bool": value = try container.decode(T.self, forKey: .value)
        case "color": value = try container.decode(T.self, forKey: .value)
        case "url": value = try container.decode(T.self, forKey: .value)
        case "array": value = try container.decode(T.self, forKey: .value)
        case "object": value = try container.decode(T.self, forKey: .value)
        default:
            throw DecodingError.dataCorruptedError(forKey: .type, in: container, debugDescription: "Unsupported type for Box")
        }
    }
    enum CodingKeys: String, CodingKey { case type, value }
}

