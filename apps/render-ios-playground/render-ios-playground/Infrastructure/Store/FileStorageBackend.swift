import Foundation

/// File storage backend - persistent JSON file storage with atomic writes
public class FileStorageBackend: StoreStorageBackend {
    private let fileURL: URL
    private let fileManager: FileManager
    private let queue: DispatchQueue

    public init(fileURL: URL) {
        self.fileURL = fileURL
        self.fileManager = .default
        self.queue = DispatchQueue(label: "com.render.store.file", qos: .userInitiated)

        // Ensure directory exists
        try? fileManager.createDirectory(at: fileURL.deletingLastPathComponent(), withIntermediateDirectories: true)
    }

    public func get(_ keyPath: String) -> StoreValue? {
        return queue.sync {
            guard let data = try? Data(contentsOf: fileURL) else {
                return nil
            }

            do {
                let jsonObject = try JSONSerialization.jsonObject(with: data, options: [])
                guard let dict = jsonObject as? [String: Any],
                      let keyData = dict[keyPath] else {
                    return nil
                }

                let encoder = JSONEncoder()
                let keyValueData = try encoder.encode(keyData)
                let decoder = JSONDecoder()
                return try decoder.decode(StoreValue.self, from: keyValueData)
            } catch {
                print("Failed to read from file storage: \(error)")
                return nil
            }
        }
    }

    public func set(_ keyPath: String, _ value: StoreValue) {
        queue.async {
            self.performSet(keyPath, value, nil)
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

    public func exists(_ keyPath: String) -> Bool {
        return queue.sync {
            guard let data = try? Data(contentsOf: fileURL) else {
                return false
            }

            let jsonObject = try? JSONSerialization.jsonObject(with: data, options: [])
            guard let dict = jsonObject as? [String: Any] else {
                return false
            }

            return dict[keyPath] != nil
        }
    }

    public func snapshot() -> [String: StoreValue] {
        return queue.sync {
            guard let data = try? Data(contentsOf: fileURL) else {
                return [:]
            }

            do {
                let jsonObject = try JSONSerialization.jsonObject(with: data, options: [])
                guard let dict = jsonObject as? [String: Any] else {
                    return [:]
                }

                var result: [String: StoreValue] = [:]
                let encoder = JSONEncoder()
                let decoder = JSONDecoder()

                for (key, value) in dict {
                    let keyValueData = try encoder.encode(value)
                    let storeValue = try decoder.decode(StoreValue.self, from: keyValueData)
                    result[key] = storeValue
                }

                return result
            } catch {
                print("Failed to read snapshot from file storage: \(error)")
                return [:]
            }
        }
    }

    public func replaceAll(_ root: [String: StoreValue]) {
        queue.async {
            self.performReplaceAll(root)
        }
    }

    // MARK: - Private Methods

    private func performSet(_ keyPath: String, _ value: StoreValue, _ mergeObject: [String: StoreValue]?) {
        do {
            var dict = loadCurrentDictionary()

            // Convert StoreValue to JSON-compatible format
            let encoder = JSONEncoder()
            let valueData = try encoder.encode(value)
            let jsonValue = try JSONSerialization.jsonObject(with: valueData, options: [])

            if let mergeObject = mergeObject {
                // Handle merge operation
                if var currentObject = dict[keyPath] as? [String: Any] {
                    let mergeEncoder = JSONEncoder()
                    let mergeData = try mergeEncoder.encode(mergeObject)
                    let mergeJsonValue = try JSONSerialization.jsonObject(with: mergeData, options: [])

                    if let mergeDict = mergeJsonValue as? [String: Any] {
                        for (key, value) in mergeDict {
                            currentObject[key] = value
                        }
                        dict[keyPath] = currentObject
                    }
                } else {
                    dict[keyPath] = mergeJsonValue
                }
            } else {
                // Handle set operation
                dict[keyPath] = jsonValue
            }

            try saveDictionary(dict)
        } catch {
            print("Failed to write to file storage: \(error)")
        }
    }

    private func performMerge(_ keyPath: String, _ object: [String: StoreValue]) {
        performSet(keyPath, .null, object)
    }

    private func performRemove(_ keyPath: String) {
        do {
            var dict = loadCurrentDictionary()
            dict.removeValue(forKey: keyPath)
            try saveDictionary(dict)
        } catch {
            print("Failed to remove from file storage: \(error)")
        }
    }

    private func performReplaceAll(_ root: [String: StoreValue]) {
        do {
            var dict: [String: Any] = [:]
            let encoder = JSONEncoder()

            for (keyPath, value) in root {
                let valueData = try encoder.encode(value)
                let jsonValue = try JSONSerialization.jsonObject(with: valueData, options: [])
                dict[keyPath] = jsonValue
            }

            try saveDictionary(dict)
        } catch {
            print("Failed to replace all in file storage: \(error)")
        }
    }

    private func loadCurrentDictionary() -> [String: Any] {
        guard let data = try? Data(contentsOf: fileURL) else {
            return [:]
        }

        return (try? JSONSerialization.jsonObject(with: data, options: [])) as? [String: Any] ?? [:]
    }

    private func saveDictionary(_ dict: [String: Any]) throws {
        let data = try JSONSerialization.data(withJSONObject: dict, options: [.prettyPrinted, .sortedKeys])
        try data.write(to: fileURL, options: [.atomic])
    }
}