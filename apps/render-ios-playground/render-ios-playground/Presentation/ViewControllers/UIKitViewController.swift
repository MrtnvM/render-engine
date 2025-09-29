import UIKit

/// UI Kit main view controller that displays all available component categories
class UIKitViewController: UIViewController {

    // MARK: - Properties
    private let componentCategories = [
        ("Buttons", "Button"),
        ("Text", "Text"),
        ("Checkboxes", "Checkbox"),
        ("Images", "Image"),
        ("Ratings", "Rating"),
        ("Steppers", "Stepper"),
        ("Navigation", "Navbar"),
        ("Layout", "View"),
        ("Container", "Row"),
        ("Container", "Column"),
        ("Container", "Stack")
    ]

    // MARK: - UI Components
    private lazy var tableView: UITableView = {
        let table = UITableView()
        table.delegate = self
        table.dataSource = self
        table.register(UITableViewCell.self, forCellReuseIdentifier: "ComponentCell")
        table.translatesAutoresizingMaskIntoConstraints = false
        return table
    }()

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupNavigation()
    }

    // MARK: - Setup
    private func setupUI() {
        title = "🎨 UI Kit"
        view.backgroundColor = .systemBackground

        view.addSubview(tableView)
        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
    }

    private func setupNavigation() {
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "Back",
            style: .plain,
            target: self,
            action: #selector(backButtonTapped)
        )
    }

    // MARK: - Actions
    @objc private func backButtonTapped() {
        dismiss(animated: true)
    }
}

// MARK: - UITableViewDataSource
extension UIKitViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return componentCategories.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "ComponentCell", for: indexPath)
        let (displayName, _) = componentCategories[indexPath.row]

        var content = cell.defaultContentConfiguration()
        content.text = displayName
        content.secondaryText = "Tap to see different states and configurations"
        cell.contentConfiguration = content

        return cell
    }
}

// MARK: - UITableViewDelegate
extension UIKitViewController: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)

        let (displayName, componentType) = componentCategories[indexPath.row]
        let showcaseVC = ComponentShowcaseViewController(componentType: componentType, displayName: displayName)
        navigationController?.pushViewController(showcaseVC, animated: true)
    }
}