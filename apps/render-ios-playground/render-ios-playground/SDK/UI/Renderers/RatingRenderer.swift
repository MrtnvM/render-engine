import UIKit

class RatingRenderer: Renderer {
    let type = "Rating"

    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableRating(component: component, context: context)
    }
}

class RenderableRating: UIView, Renderable {
    let component: Component
    let context: RendererContext
    
    private var starView = UIImageView()
    private var currentRating = 0.0
    private var maxRating = 5
    private let starSize: CGFloat = 16
    
    let valueProvider = DIContainer.shared.valueProvider

    init(component: Component, context: RendererContext) {
        self.component = component
        self.context = context
        super.init(frame: .zero)
        yoga.isEnabled = true
        applyStyle()
        applyFlexStyles()
        setupRating()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupRating() {
        // Get properties
        currentRating = valueProvider.resolve(
            ValueContext(
                key: "rating",
                type: Double.self,
                component: component,
                props: context.props
            )
        ) ?? 0.0

        translatesAutoresizingMaskIntoConstraints = false
        starView.translatesAutoresizingMaskIntoConstraints = false
        
        flex
            .alignItems(.center)
            .justifyContent(.center)
            .addItem(starView)
    }

    private func applyStyle() {
        applyVisualStyles()
        // Additional styling can be added here
    }
}
