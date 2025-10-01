import UIKit

class ImageLoader {
    /// Load an image from various sources (URL, base64, or asset name)
    /// - Parameters:
    ///   - source: The image source string (URL, base64 data URI, or asset name)
    ///   - placeholder: Optional placeholder image source (URL or asset name)
    func loadImage(from source: String, placeholder: String? = nil, onImageLoaded: @escaping (UIImage?) -> Void) {
        // Set placeholder first if provided
        if let placeholder = placeholder {
            if placeholder.hasPrefix("http") {
                // Load placeholder from URL
                loadImageFromURL(placeholder) { image in
                    DispatchQueue.main.async {
                        onImageLoaded(image)
                    }
                }
            } else {
                let image = UIImage(named: placeholder)
                onImageLoaded(image)
            }
        }
        
        // Load the main image
        if source.hasPrefix("http") {
            // Load from URL
            loadImageFromURL(source) { image in
                DispatchQueue.main.async {
                    onImageLoaded(image)
                }
            }
        } else if source.hasPrefix("data:") {
            // Load from base64 data
            loadImageFromBase64(source) { image in
                DispatchQueue.main.async {
                    onImageLoaded(image)
                }
            }
        } else {
            // Load from assets
            let image = UIImage(named: source)
            onImageLoaded(image)
        }
    }
    
    /// Load an image from a URL
    /// - Parameters:
    ///   - urlString: The URL string of the image
    ///   - completion: Completion handler with the loaded image or nil
    func loadImageFromURL(_ urlString: String, completion: @escaping (UIImage?) -> Void) {
        guard let url = URL(string: urlString) else {
            completion(nil)
            return
        }
        
        URLSession.shared.dataTask(with: url) { data, response, error in
            if let data = data, let image = UIImage(data: data) {
                completion(image)
            } else {
                completion(nil)
            }
        }.resume()
    }
    
    /// Load an image from a base64 data URI string
    /// - Parameter base64String: The base64 data URI string (e.g., "data:image/png;base64,...")
    func loadImageFromBase64(_ base64String: String, onImageLoaded: @escaping (UIImage) -> Void) {
        // Remove data URL prefix if present
        let cleanBase64 = base64String.replacingOccurrences(of: "data:image/[^;]+;base64,", with: "", options: .regularExpression)
        
        guard let data = Data(base64Encoded: cleanBase64),
              let image = UIImage(data: data) else {
            return
        }
        
        DispatchQueue.main.async {
            onImageLoaded(image)
        }
    }
}

