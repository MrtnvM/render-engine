import UIKit

class NavbarRenderer: Renderer {
    let type = "Navbar"
    
    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableNavbar(component: component)
    }
}

class RenderableNavbar: UIView, Renderable {
    let component: Component
    private var navigationController: UINavigationController?
    private weak var currentViewController: UIViewController?
    
    init(component: Component) {
        self.component = component
        super.init(frame: .zero)
        setupNavbar()
        applyFlexStyles()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupNavbar() {
        // Create navigation controller if not exists
        setupNavigationController()
        
        // Setup navbar appearance
        setupNavbarAppearance()
        
        // Add navbar content
        setupNavbarContent()
    }
    
    private func setupNavigationController() {
        // Find the current view controller in the view hierarchy
        if let currentVC = findViewController() {
            self.currentViewController = currentVC
            
            // If no navigation controller exists, create one
            if currentVC.navigationController == nil {
                let navController = UINavigationController(
                    rootViewController: currentVC
                )
                self.navigationController = navController
                
                // Present the navigation controller modally if needed
                if let presentingVC = currentVC.presentingViewController {
                    presentingVC.present(navController, animated: true)
                }
            } else {
                self.navigationController = currentVC.navigationController
            }
        }
    }
    
    private func setupNavbarAppearance() {
        guard let navController = navigationController else { return }
        
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
        navController.navigationBar.standardAppearance = appearance
        navController.navigationBar.scrollEdgeAppearance = appearance
        navController.navigationBar.compactAppearance = appearance
        
        // Hide shadow if specified
        if let hideShadow = component.style.get(forKey: "hideShadow", ofType: Bool.self), hideShadow {
            appearance.shadowColor = .clear
        }
    }
    
    private func setupNavbarContent() {
        // Title
        if let title = component.properties.getString(forKey: "title") {
            currentViewController?.title = title
        }
        
        // Left button (back button)
        if let leftButtonTitle = component.properties.getString(forKey: "leftButtonTitle") {
            let leftButton = UIBarButtonItem(
                title: leftButtonTitle,
                style: .plain,
                target: self,
                action: #selector(leftButtonTapped)
            )
            currentViewController?.navigationItem.leftBarButtonItem = leftButton
        }
        
        // Right button
        if let rightButtonTitle = component.properties.getString(forKey: "rightButtonTitle") {
            let rightButton = UIBarButtonItem(
                title: rightButtonTitle,
                style: .plain,
                target: self,
                action: #selector(rightButtonTapped)
            )
            currentViewController?.navigationItem.rightBarButtonItem = rightButton
        }
        
        // Large title preference
        if let prefersLargeTitles = component.properties.getBool(forKey: "prefersLargeTitles") {
            navigationController?.navigationBar.prefersLargeTitles = prefersLargeTitles
        }
        
        // Hide navigation bar
        if let isHidden = component.properties.getBool(forKey: "isHidden") {
            navigationController?.setNavigationBarHidden(isHidden, animated: true)
        }
    }
    
    private func findViewController() -> UIViewController? {
        var responder: UIResponder? = self
        while let nextResponder = responder?.next {
            if let viewController = nextResponder as? UIViewController {
                return viewController
            }
            responder = nextResponder
        }
        return nil
    }
    
    @objc private func leftButtonTapped() {
        // Handle left button action
        if let action = component.properties.getString(forKey: "leftButtonAction") {
            handleNavbarAction(action)
        } else {
            // Default back action
            currentViewController?.navigationController?.popViewController(animated: true)
        }
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
            currentViewController?.navigationController?.popViewController(animated: true)
        case "dismiss":
            currentViewController?.dismiss(animated: true)
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
