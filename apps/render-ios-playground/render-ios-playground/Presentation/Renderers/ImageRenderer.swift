import UIKit

class ImageRenderer: Renderer {
    let type = "Image"
    
    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableImage(component: component, context: context)
    }
}

class RenderableImage: UIImageView, Renderable {
    let component: Component
    let context: RendererContext

    init(component: Component, context: RendererContext) {
        self.component = component
        self.context = context
        super.init(frame: .zero)
        setupImageContent()
        applyStyle()
        applyFlexStyles()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func applyStyle() {
        let style = component.style
        
        // Content mode
        if let contentModeString = get(key: "contentMode", type: String.self) {
            contentMode = parseContentMode(from: contentModeString)
        } else {
            contentMode = .scaleAspectFit
        }
        
        if let tintColor = get(key: "tintColor", type: UIColor.self) {
            self.tintColor = tintColor
        }
        
        // Clips to bounds
        if let clipsToBounds = get(key: "clipsToBounds", type: Bool.self) {
            self.clipsToBounds = clipsToBounds
        }
        
        // Apply visual styles from the Renderable extension
        applyVisualStyles()
    }
    
    private func setupImageContent() {
        let imageSource = get(key: "source", type: String.self)
        guard let imageSource = imageSource else {
            return
        }

        loadImage(from: imageSource)

        // Placeholder image
        if let placeholder = component.properties.getString(forKey: "placeholder") {
            if placeholder.hasPrefix("http") {
                // Load placeholder from URL
                loadImageFromURL(placeholder) { [weak self] image in
                    self?.image = image
                }
            } else {
                // Load placeholder from assets
                self.image = UIImage(named: placeholder)
            }
        }
    }
    
    private func loadImage(from source: String) {
        if source.hasPrefix("http") {
            // Load from URL
            loadImageFromURL(source) { [weak self] image in
                DispatchQueue.main.async {
                    self?.image = image
                }
            }
        } else if source.hasPrefix("data:") {
            // Load from base64 data
            loadImageFromBase64(source)
        } else {
            // Load from assets
            self.image = UIImage(named: source)
        }
    }
    
    private func loadImageFromURL(_ urlString: String, completion: @escaping (UIImage?) -> Void) {
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
    
    private func loadImageFromBase64(_ base64String: String) {
        // Remove data URL prefix if present
        let cleanBase64 = base64String.replacingOccurrences(of: "data:image/[^;]+;base64,", with: "", options: .regularExpression)
        
        guard let data = Data(base64Encoded: cleanBase64),
              let image = UIImage(data: data) else {
            return
        }
        
        DispatchQueue.main.async {
            self.image = image
        }
    }
    
    private func parseContentMode(from string: String) -> UIView.ContentMode {
        switch string.lowercased() {
        case "scaleToFill":
            return .scaleToFill
        case "scaleAspectFit":
            return .scaleAspectFit
        case "scaleAspectFill":
            return .scaleAspectFill
        case "redraw":
            return .redraw
        case "center":
            return .center
        case "top":
            return .top
        case "bottom":
            return .bottom
        case "left":
            return .left
        case "right":
            return .right
        case "topLeft":
            return .topLeft
        case "topRight":
            return .topRight
        case "bottomLeft":
            return .bottomLeft
        case "bottomRight":
            return .bottomRight
        default:
            return .scaleAspectFit
        }
    }
}
