import UIKit

class ImageRenderer: Renderer {
    let type = "Image"
    
    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableImage(component: component, context: context)
    }
}

class RenderableImage: UIImageView, @MainActor Renderable {
    let component: Component
    let context: RendererContext
    
    let imageLoader = DIContainer.shared.imageLoader

    init(component: Component, context: RendererContext) {
        self.component = component
        self.context = context
        super.init(frame: .zero)
        yoga.isEnabled = true
        setupImageContent()
        applyStyle()
        applyFlexStyles()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func applyStyle() {        
        // Content mode
        if let contentModeString = get(key: "contentMode", type: String.self) {
            contentMode = parseContentMode(from: contentModeString)
        } else {
            contentMode = .scaleToFill
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

        // Get optional placeholder
        let placeholder = component.properties.getString(forKey: "placeholder")
        
        Task { [weak self] in
            guard let strongSelf = self else { return }
            let image = await strongSelf.imageLoader.loadImage(
                from: imageSource,
                placeholder: placeholder
            )
            strongSelf.image = image
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
