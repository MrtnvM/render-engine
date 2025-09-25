import Foundation

/// Backend adapter for remote synchronization
public class BackendStoreAdapter: StoreBackend {
    private let baseURL: URL
    private let session: URLSession

    public init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    public var isAvailable: Bool {
        // Check network connectivity
        // For now, assume always available
        true
    }

    public func pull(namespace: String, scenarioID: String?) async throws -> [String: StoreValue] {
        var url = baseURL.appendingPathComponent("api/store/\(namespace)")
        if let scenarioID = scenarioID {
            url = url.appendingPathComponent(scenarioID)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw StoreError.backendError("Failed to pull data from backend")
        }

        return try JSONDecoder().decode([String: StoreValue].self, from: data)
    }

    public func push(namespace: String, scenarioID: String?, changes: [StoreChange]) async throws {
        var url = baseURL.appendingPathComponent("api/store/\(namespace)")
        if let scenarioID = scenarioID {
            url = url.appendingPathComponent(scenarioID)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = try JSONEncoder().encode(changes)
        request.httpBody = body

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw StoreError.backendError("Failed to push data to backend")
        }
    }
}

/// Simple HTTP backend for testing
public class SimpleHTTPStoreBackend: StoreBackend {
    private let baseURL: URL
    private let session: URLSession
    private var cachedData: [String: [String: StoreValue]] = [:] // namespace -> data

    public init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    public var isAvailable: Bool {
        // Simple availability check
        true
    }

    public func pull(namespace: String, scenarioID: String?) async throws -> [String: StoreValue] {
        let key = key(for: namespace, scenarioID: scenarioID)

        // Return cached data for testing
        if let data = cachedData[key] {
            return data
        }

        // Try to fetch from server
        var url = baseURL.appendingPathComponent("store/\(namespace)")
        if let scenarioID = scenarioID {
            url = url.appendingPathComponent(scenarioID)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                throw StoreError.backendError("Failed to pull data from backend")
            }

            let storeData = try JSONDecoder().decode([String: StoreValue].self, from: data)
            cachedData[key] = storeData
            return storeData
        } catch {
            // Return empty data if server is not available
            let emptyData: [String: StoreValue] = [:]
            cachedData[key] = emptyData
            return emptyData
        }
    }

    public func push(namespace: String, scenarioID: String?, changes: [StoreChange]) async throws {
        let key = key(for: namespace, scenarioID: scenarioID)

        // Update cached data with changes
        var currentData = cachedData[key] ?? [:]

        for change in changes {
            for patch in change.patches {
                switch patch.op {
                case .set:
                    if let newValue = patch.newValue {
                        currentData[patch.keyPath] = newValue
                    }
                case .remove:
                    currentData.removeValue(forKey: patch.keyPath)
                case .merge:
                    if let mergeData = patch.newValue?.objectValue {
                        var existingData = currentData[patch.keyPath]?.objectValue ?? [:]
                        existingData.merge(mergeData) { _, new in new }
                        currentData[patch.keyPath] = .object(existingData)
                    }
                }
            }
        }

        cachedData[key] = currentData

        // Try to push to server
        var url = baseURL.appendingPathComponent("store/\(namespace)")
        if let scenarioID = scenarioID {
            url = url.appendingPathComponent(scenarioID)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = try JSONEncoder().encode(changes)
        request.httpBody = body

        do {
            let (_, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse,
                  (200...299).contains(httpResponse.statusCode) else {
                throw StoreError.backendError("Failed to push data to backend")
            }
        } catch {
            // Log error but don't fail - this is for testing
            print("Warning: Failed to push to backend: \(error)")
        }
    }

    private func key(for namespace: String, scenarioID: String?) -> String {
        if let scenarioID = scenarioID {
            return "\(namespace)_\(scenarioID)"
        } else {
            return namespace
        }
    }
}