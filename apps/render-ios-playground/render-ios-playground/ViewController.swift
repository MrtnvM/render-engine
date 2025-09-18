import UIKit

/// Legacy ViewController - now delegates to MainViewController with clean architecture
class ViewController: MainViewController {
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }
}

