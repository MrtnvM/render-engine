import Foundation

/// Network client for making HTTP requests
class NetworkClient {
    private let session: URLSession
    
    init(session: URLSession = .shared) {
        self.session = session
    }
    
    func fetchData(from url: URL) async throws -> Data {
        do {
            let (data, response) = try await session.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw RenderSDKError.invalidResponse("Invalid response type")
            }
            
            guard httpResponse.statusCode == 200 else {
                throw RenderSDKError.invalidResponse("HTTP status code: \(httpResponse.statusCode)")
            }
            
            return data
        } catch {
            if error is RenderSDKError {
                throw error
            } else {
                throw RenderSDKError.networkError(error.localizedDescription)
            }
        }
    }
    
    func fetchJSON(from url: URL) async throws -> [String: Any] {
        let data = try await fetchData(from: url)
        
        do {
            guard let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else {
                throw RenderSDKError.parsingError("Response is not a valid JSON object")
            }
            return json
        } catch {
            throw RenderSDKError.parsingError("Failed to parse JSON: \(error.localizedDescription)")
        }
    }
}
