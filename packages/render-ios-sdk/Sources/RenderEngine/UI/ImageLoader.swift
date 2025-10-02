import UIKit

@MainActor
class ImageLoader {
    /// Load an image from various sources (URL, base64, or asset name)
    /// - Parameters:
    ///   - source: The image source string (URL, base64 data URI, or asset name)
    ///   - placeholder: Optional placeholder image source (URL or asset name)
    /// - Returns: The loaded image or nil if loading failed
    func loadImage(from source: String, placeholder: String? = nil) async -> UIImage? {
        // Set placeholder first if provided
        if let placeholder = placeholder {
            if placeholder.hasPrefix("http") {
                // Load placeholder from URL
                if let placeholderImage = await loadImageFromURL(placeholder) {
                    return placeholderImage
                }
            } else {
                let image = UIImage(named: placeholder)
                return image
            }
        }
        
        // Load the main image
        if source.hasPrefix("http") {
            // Load from URL
            return await loadImageFromURL(source)
        } else if source.hasPrefix("data:") {
            // Load from base64 data
            return await loadImageFromBase64(source)
        } else {
            // Load from assets
            return UIImage(named: source)
        }
    }
    
    /// Load an image from a URL
    /// - Parameter urlString: The URL string of the image
    /// - Returns: The loaded image or nil if loading failed
    func loadImageFromURL(_ urlString: String) async -> UIImage? {
        guard let url = URL(string: urlString) else {
            return nil
        }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            return UIImage(data: data)
        } catch {
            return nil
        }
    }
    
    /// Load an image from a base64 data URI string
    /// - Parameter base64String: The base64 data URI string (e.g., "data:image/png;base64,...")
    /// - Returns: The loaded image or nil if decoding failed
    func loadImageFromBase64(_ base64String: String) async -> UIImage? {
        // Remove data URL prefix if present
        let cleanBase64 = base64String.replacingOccurrences(of: "data:image/[^;]+;base64,", with: "", options: .regularExpression)
        
        guard let data = Data(base64Encoded: cleanBase64) else {
            return nil
        }
        
        return UIImage(data: data)
    }
}

