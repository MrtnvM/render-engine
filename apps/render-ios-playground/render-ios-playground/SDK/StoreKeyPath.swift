import Foundation

// Utility to parse and navigate dot/bracket key paths on StoreValue trees
enum StoreKeyPathSegment: Equatable {
    case key(String)
    case index(Int)
}

struct StoreKeyPath {
    static func parse(_ keyPath: String) -> [StoreKeyPathSegment] {
        // Supports simple dot paths and bracket indices: a.b[0].c
        var result: [StoreKeyPathSegment] = []
        var buffer: String = ""
        var i = keyPath.startIndex
        func flushKey() {
            if !buffer.isEmpty {
                result.append(.key(buffer))
                buffer.removeAll()
            }
        }
        while i < keyPath.endIndex {
            let ch = keyPath[i]
            if ch == "." {
                flushKey()
                i = keyPath.index(after: i)
                continue
            } else if ch == "[" {
                flushKey()
                // parse number until ]
                var j = keyPath.index(after: i)
                var numberBuffer: String = ""
                while j < keyPath.endIndex && keyPath[j] != "]" {
                    numberBuffer.append(keyPath[j])
                    j = keyPath.index(after: j)
                }
                if let idx = Int(numberBuffer) {
                    result.append(.index(idx))
                } else {
                    // fallback: treat as key with brackets if not numeric
                    result.append(.key("[\(numberBuffer)]"))
                }
                i = j < keyPath.endIndex ? keyPath.index(after: j) : j
                continue
            } else {
                buffer.append(ch)
                i = keyPath.index(after: i)
            }
        }
        flushKey()
        return result
    }

    static func get(from root: [String: StoreValue], keyPath: String) -> StoreValue? {
        var current: StoreValue = .object(root)
        for segment in parse(keyPath) {
            switch (current, segment) {
            case (.object(let dict), .key(let k)):
                current = dict[k] ?? .null
            case (.array(let arr), .index(let i)):
                if i >= 0 && i < arr.count { current = arr[i] } else { return nil }
            default:
                return nil
            }
        }
        if case .null = current { return nil }
        return current
    }

    static func exists(in root: [String: StoreValue], keyPath: String) -> Bool {
        return get(from: root, keyPath: keyPath) != nil
    }

    static func set(root: inout [String: StoreValue], keyPath: String, value: StoreValue) -> StoreValue? {
        var segments = parse(keyPath)
        guard !segments.isEmpty else { return nil }
        return setRecursive(container: &root, segments: &segments, value: value)
    }

    private static func setRecursive(container: inout [String: StoreValue], segments: inout [StoreKeyPathSegment], value: StoreValue) -> StoreValue? {
        guard let first = segments.first else { return nil }
        switch first {
        case .key(let key):
            var nextValue: StoreValue = container[key] ?? .null
            segments.removeFirst()
            if segments.isEmpty {
                let old = container[key]
                container[key] = value
                return old
            }
            switch nextValue {
            case .object(var dict):
                let old = setRecursive(container: &dict, segments: &segments, value: value)
                container[key] = .object(dict)
                return old
            case .array(var arr):
                // If next is index, delegate into array
                if case .index = segments.first {
                    let old = setRecursive(container: &arr, segments: &segments, value: value)
                    container[key] = .array(arr)
                    return old
                } else {
                    // overwrite with object then continue
                    var dict: [String: StoreValue] = [:]
                    let old = setRecursive(container: &dict, segments: &segments, value: value)
                    container[key] = .object(dict)
                    return old
                }
            default:
                var dict: [String: StoreValue] = [:]
                let old = setRecursive(container: &dict, segments: &segments, value: value)
                container[key] = .object(dict)
                return old
            }
        case .index:
            // not expected at dictionary level
            return nil
        }
    }

    private static func setRecursive(container: inout [StoreValue], segments: inout [StoreKeyPathSegment], value: StoreValue) -> StoreValue? {
        guard let first = segments.first else { return nil }
        switch first {
        case .index(let idx):
            segments.removeFirst()
            if segments.isEmpty {
                if idx >= 0 && idx < container.count {
                    let old = container[idx]
                    container[idx] = value
                    return old
                } else { return nil }
            }
            if idx >= 0 && idx < container.count {
                switch container[idx] {
                case .object(var dict):
                    let old = setRecursive(container: &dict, segments: &segments, value: value)
                    container[idx] = .object(dict)
                    return old
                case .array(var arr):
                    let old = setRecursive(container: &arr, segments: &segments, value: value)
                    container[idx] = .array(arr)
                    return old
                default:
                    var dict: [String: StoreValue] = [:]
                    let old = setRecursive(container: &dict, segments: &segments, value: value)
                    container[idx] = .object(dict)
                    return old
                }
            }
            return nil
        case .key:
            return nil
        }
    }

    static func remove(root: inout [String: StoreValue], keyPath: String) -> StoreValue? {
        var segments = parse(keyPath)
        guard !segments.isEmpty else { return nil }
        return removeRecursive(container: &root, segments: &segments)
    }

    private static func removeRecursive(container: inout [String: StoreValue], segments: inout [StoreKeyPathSegment]) -> StoreValue? {
        guard let first = segments.first else { return nil }
        switch first {
        case .key(let key):
            segments.removeFirst()
            if segments.isEmpty {
                return container.removeValue(forKey: key)
            }
            switch container[key] ?? .null {
            case .object(var dict):
                let old = removeRecursive(container: &dict, segments: &segments)
                container[key] = .object(dict)
                return old
            case .array(var arr):
                let old = removeRecursive(container: &arr, segments: &segments)
                container[key] = .array(arr)
                return old
            default:
                return nil
            }
        case .index:
            return nil
        }
    }

    private static func removeRecursive(container: inout [StoreValue], segments: inout [StoreKeyPathSegment]) -> StoreValue? {
        guard let first = segments.first else { return nil }
        switch first {
        case .index(let idx):
            segments.removeFirst()
            if segments.isEmpty {
                if idx >= 0 && idx < container.count {
                    return container.remove(at: idx)
                }
                return nil
            }
            if idx >= 0 && idx < container.count {
                switch container[idx] {
                case .object(var dict):
                    let old = removeRecursive(container: &dict, segments: &segments)
                    container[idx] = .object(dict)
                    return old
                case .array(var arr):
                    let old = removeRecursive(container: &arr, segments: &segments)
                    container[idx] = .array(arr)
                    return old
                default:
                    return nil
                }
            }
            return nil
        case .key:
            return nil
        }
    }
}

