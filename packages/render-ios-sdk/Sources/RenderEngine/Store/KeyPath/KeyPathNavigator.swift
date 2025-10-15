import Foundation

/// Navigates and modifies nested StoreValue structures using keyPaths
struct KeyPathNavigator {

    /// Get a value at the specified keyPath
    static func get(_ keyPath: String, in root: StoreValue) -> StoreValue? {
        let components = KeyPathResolver.parse(keyPath)
        return navigate(components: components, in: root)
    }

    /// Set a value at the specified keyPath, creating intermediate objects/arrays as needed
    /// Returns the updated root value and the old value (if any)
    static func set(_ keyPath: String, value: StoreValue, in root: StoreValue) -> (newRoot: StoreValue, oldValue: StoreValue?) {
        let components = KeyPathResolver.parse(keyPath)
        guard !components.isEmpty else {
            return (value, root)
        }

        let oldValue = get(keyPath, in: root)
        let newRoot = setRecursive(components: components, value: value, in: root)
        return (newRoot, oldValue)
    }

    /// Remove a value at the specified keyPath
    /// Returns the updated root value and the removed value (if any)
    static func remove(_ keyPath: String, from root: StoreValue) -> (newRoot: StoreValue, removedValue: StoreValue?) {
        let components = KeyPathResolver.parse(keyPath)
        guard !components.isEmpty else {
            return (.null, root)
        }

        let removedValue = get(keyPath, in: root)
        let newRoot = removeRecursive(components: components, from: root)
        return (newRoot, removedValue)
    }

    /// Merge an object at the specified keyPath
    /// Only works if the target is an object or will become an object
    static func merge(_ keyPath: String, object: [String: StoreValue], in root: StoreValue) -> (newRoot: StoreValue, oldValue: StoreValue?) {
        let existing = get(keyPath, in: root)
        let oldValue = existing

        // Merge with existing object or create new
        let mergedObject: [String: StoreValue]
        if let existingObject = existing?.objectValue {
            mergedObject = existingObject.merging(object) { _, new in new }
        } else {
            mergedObject = object
        }

        let (newRoot, _) = set(keyPath, value: .object(mergedObject), in: root)
        return (newRoot, oldValue)
    }

    // MARK: - Private Helpers

    private static func navigate(components: [KeyPathComponent], in value: StoreValue) -> StoreValue? {
        guard !components.isEmpty else {
            return value
        }

        let first = components[0]
        let rest = Array(components.dropFirst())

        switch first {
        case .property(let name):
            guard let object = value.objectValue else {
                return nil
            }
            guard let nextValue = object[name] else {
                return nil
            }
            return rest.isEmpty ? nextValue : navigate(components: rest, in: nextValue)

        case .index(let idx):
            guard let array = value.arrayValue else {
                return nil
            }
            guard idx >= 0 && idx < array.count else {
                return nil
            }
            let nextValue = array[idx]
            return rest.isEmpty ? nextValue : navigate(components: rest, in: nextValue)
        }
    }

    private static func setRecursive(components: [KeyPathComponent], value: StoreValue, in current: StoreValue) -> StoreValue {
        guard !components.isEmpty else {
            return value
        }

        let first = components[0]
        let rest = Array(components.dropFirst())

        if rest.isEmpty {
            // Last component - perform the set
            switch first {
            case .property(let name):
                var object = current.objectValue ?? [:]
                object[name] = value
                return .object(object)

            case .index(let idx):
                var array = current.arrayValue ?? []
                // Extend array if needed
                while array.count <= idx {
                    array.append(.null)
                }
                array[idx] = value
                return .array(array)
            }
        } else {
            // Recurse deeper
            switch first {
            case .property(let name):
                var object = current.objectValue ?? [:]
                let nextValue = object[name] ?? inferDefaultValue(for: rest[0])
                object[name] = setRecursive(components: rest, value: value, in: nextValue)
                return .object(object)

            case .index(let idx):
                var array = current.arrayValue ?? []
                // Extend array if needed
                while array.count <= idx {
                    array.append(.null)
                }
                let nextValue = array[idx] != .null ? array[idx] : inferDefaultValue(for: rest[0])
                array[idx] = setRecursive(components: rest, value: value, in: nextValue)
                return .array(array)
            }
        }
    }

    private static func removeRecursive(components: [KeyPathComponent], from current: StoreValue) -> StoreValue {
        guard !components.isEmpty else {
            return .null
        }

        let first = components[0]
        let rest = Array(components.dropFirst())

        if rest.isEmpty {
            // Last component - perform the removal
            switch first {
            case .property(let name):
                var object = current.objectValue ?? [:]
                object.removeValue(forKey: name)
                return .object(object)

            case .index(let idx):
                var array = current.arrayValue ?? []
                guard idx >= 0 && idx < array.count else {
                    return current
                }
                array.remove(at: idx)
                return .array(array)
            }
        } else {
            // Recurse deeper
            switch first {
            case .property(let name):
                guard var object = current.objectValue else {
                    return current
                }
                guard let nextValue = object[name] else {
                    return current
                }
                object[name] = removeRecursive(components: rest, from: nextValue)
                return .object(object)

            case .index(let idx):
                guard var array = current.arrayValue else {
                    return current
                }
                guard idx >= 0 && idx < array.count else {
                    return current
                }
                array[idx] = removeRecursive(components: rest, from: array[idx])
                return .array(array)
            }
        }
    }

    private static func inferDefaultValue(for component: KeyPathComponent) -> StoreValue {
        switch component {
        case .property:
            return .object([:])
        case .index:
            return .array([])
        }
    }
}
