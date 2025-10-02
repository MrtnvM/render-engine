import UIKit

class NavbarRenderer: Renderer {
    let type = "Navbar"
    
    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableNavbar(component: component, context: context)
    }
}

class RenderableNavbar: UIView, Renderable {
    let component: Component
    let context: RendererContext
    
    init(component: Component, context: RendererContext) {
        self.component = component
        self.context = context
        super.init(frame: .zero)
        yoga.isEnabled = true
        setupNavbar()
        applyFlexStyles()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupNavbar() {
        // Setup navbar appearance
        setupNavbarAppearance()
        
        // Add navbar content
        setupNavbarContent()
    }
    
    private func setupNavbarAppearance() {
        // Configure navigation bar appearance
        let appearance = UINavigationBarAppearance()
        
        // Background color
        if let backgroundColor = component.style.get(forKey: "backgroundColor", ofType: UIColor.self) {
            appearance.backgroundColor = backgroundColor
        } else {
            appearance.backgroundColor = .systemBackground
        }
        
        // Title color
        if let titleColor = component.style.get(forKey: "titleColor", ofType: UIColor.self) {
            appearance.titleTextAttributes = [.foregroundColor: titleColor]
        }
        
        // Large title color
        if let largeTitleColor = component.style.get(forKey: "largeTitleColor", ofType: UIColor.self) {
            appearance.largeTitleTextAttributes = [.foregroundColor: largeTitleColor]
        }
        
        // Configure appearance
        context.navigationController?.navigationBar.standardAppearance = appearance
        context.navigationController?.navigationBar.scrollEdgeAppearance = appearance
        context.navigationController?.navigationBar.compactAppearance = appearance
        
        // Hide shadow if specified
        if let hideShadow = component.style.get(forKey: "hideShadow", ofType: Bool.self), hideShadow {
            appearance.shadowColor = .clear
        }
    }
    
    private func setupNavbarContent() {
        // Title
        if let title = component.properties.getString(forKey: "title") {
            context.viewController?.title = title
        }
        
        // Left button (back button)
        if let leftButtonTitle = component.properties.getString(forKey: "leftButtonTitle") {
            let leftButton = UIBarButtonItem(
                title: leftButtonTitle,
                style: .plain,
                target: self,
                action: #selector(leftButtonTapped)
            )
            context.viewController?.navigationItem.leftBarButtonItem = leftButton
        }
        
        // Right button
        if let rightButtonTitle = component.properties.getString(forKey: "rightButtonTitle") {
            let rightButton = UIBarButtonItem(
                title: rightButtonTitle,
                style: .plain,
                target: self,
                action: #selector(rightButtonTapped)
            )
            context.viewController?.navigationItem.rightBarButtonItem = rightButton
        }
        
        // Large title preference
        if let prefersLargeTitles = component.properties.getBool(forKey: "prefersLargeTitles") {
            context.navigationController?.navigationBar.prefersLargeTitles = prefersLargeTitles
        }
        
        // Hide navigation bar
        if let isHidden = component.properties.getBool(forKey: "isHidden") {
            context.navigationController?.setNavigationBarHidden(isHidden, animated: true)
        }
    }
    
    
    @objc private func leftButtonTapped() {
        // Handle left button action
        if let action = component.properties.getString(forKey: "leftButtonAction") {
            if action == "back" {
                // Check if view controller was presented modally or pushed
                if isModalPresentation() {
                    context.viewController?.dismiss(animated: true)
                } else {
                    context.navigationController?.popViewController(animated: true)
                }
                return
            }
            handleNavbarAction(action)
        } else {
            // Default back action - check if modal or pushed
            if isModalPresentation() {
                context.viewController?.dismiss(animated: true)
            } else {
                context.navigationController?.popViewController(animated: true)
            }
        }
    }
    
    private func isModalPresentation() -> Bool {
        // Check if the current view controller was presented modally
        // by checking if it has a presenting view controller
        guard let viewController = context.viewController else { return false }
        
        // If there's a presenting view controller, it was presented modally
        if viewController.presentingViewController != nil {
            return true
        }
        
        // Also check if the navigation controller itself was presented modally
        if let navController = context.navigationController,
           navController.presentingViewController != nil {
            return true
        }
        
        return false
    }
    
    @objc private func rightButtonTapped() {
        // Handle right button action
        if let action = component.properties.getString(forKey: "rightButtonAction") {
            handleNavbarAction(action)
        }
    }
    
    private func handleNavbarAction(_ action: String) {
        switch action.lowercased() {
        case "back", "pop":
            context.navigationController?.popViewController(animated: true)
        case "dismiss":
            context.viewController?.dismiss(animated: true)
        case "push":
            // Could be extended to push specific view controllers
            break
        case "present":
            // Could be extended to present specific view controllers
            break
        default:
            print("Unknown navbar action: \(action)")
        }
    }
}
