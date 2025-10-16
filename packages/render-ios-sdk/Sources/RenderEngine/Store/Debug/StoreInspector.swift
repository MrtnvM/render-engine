#if DEBUG
import UIKit
import Combine

/// Debug inspector for viewing and manipulating Store data
/// Only available in DEBUG builds
public final class StoreInspector: UIViewController {

    private let store: Store
    private var cancellables = Set<AnyCancellable>()

    private let tableView = UITableView(frame: .zero, style: .grouped)
    private var snapshot: [String: StoreValue] = [:]
    private var keyPaths: [String] = []

    // MARK: - Initialization

    public init(store: Store) {
        self.store = store
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: - Lifecycle

    public override func viewDidLoad() {
        super.viewDidLoad()

        title = "Store Inspector: \(store.scope.description)"
        view.backgroundColor = .systemBackground

        setupTableView()
        setupNavigationBar()
        loadSnapshot()
    }

    // MARK: - Setup

    private func setupTableView() {
        view.addSubview(tableView)
        tableView.frame = view.bounds
        tableView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "AddCell")
    }

    private func setupNavigationBar() {
        let refreshButton = UIBarButtonItem(
            barButtonSystemItem: .refresh,
            target: self,
            action: #selector(refreshTapped)
        )

        let addButton = UIBarButtonItem(
            barButtonSystemItem: .add,
            target: self,
            action: #selector(addTapped)
        )

        let clearButton = UIBarButtonItem(
            title: "Clear",
            style: .plain,
            target: self,
            action: #selector(clearTapped)
        )

        navigationItem.rightBarButtonItems = [refreshButton, addButton, clearButton]
    }

    // MARK: - Actions

    @objc private func refreshTapped() {
        loadSnapshot()
    }

    @objc private func addTapped() {
        let alert = UIAlertController(
            title: "Add/Update Value",
            message: "Enter keyPath and value (JSON format)",
            preferredStyle: .alert
        )

        alert.addTextField { textField in
            textField.placeholder = "KeyPath (e.g., cart.total)"
        }

        alert.addTextField { textField in
            textField.placeholder = "Value (e.g., 100 or \"hello\")"
        }

        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Set", style: .default) { [weak self] _ in
            guard let keyPath = alert.textFields?[0].text,
                  let valueText = alert.textFields?[1].text,
                  !keyPath.isEmpty else { return }

            self?.setValue(keyPath: keyPath, valueText: valueText)
        })

        present(alert, animated: true)
    }

    @objc private func clearTapped() {
        let alert = UIAlertController(
            title: "Clear Store",
            message: "This will remove all data from the store. Continue?",
            preferredStyle: .alert
        )

        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Clear", style: .destructive) { [weak self] _ in
            Task {
                await self?.store.replaceAll(with: [:])
                await MainActor.run {
                    self?.loadSnapshot()
                }
            }
        })

        present(alert, animated: true)
    }

    // MARK: - Private Helpers

    private func loadSnapshot() {
        Task {
            snapshot = await store.snapshot()
            keyPaths = snapshot.keys.sorted()
            await MainActor.run {
                tableView.reloadData()
            }
        }
    }

    private func setValue(keyPath: String, valueText: String) {
        Task {
            // Try to parse as JSON
            if let data = valueText.data(using: .utf8),
               let jsonValue = try? JSONDecoder().decode(StoreValue.self, from: data) {
                await store.set(keyPath, jsonValue)
            } else if let intValue = Int(valueText) {
                await store.set(keyPath, .integer(intValue))
            } else if let doubleValue = Double(valueText) {
                await store.set(keyPath, .number(doubleValue))
            } else if valueText.lowercased() == "true" {
                await store.set(keyPath, .bool(true))
            } else if valueText.lowercased() == "false" {
                await store.set(keyPath, .bool(false))
            } else if valueText.lowercased() == "null" {
                await store.set(keyPath, .null)
            } else {
                // Default to string
                await store.set(keyPath, .string(valueText))
            }

            await MainActor.run {
                loadSnapshot()
            }
        }
    }
}

// MARK: - UITableViewDataSource

extension StoreInspector: UITableViewDataSource {
    public func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }

    public func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return keyPaths.count
    }

    public func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath)
        let keyPath = keyPaths[indexPath.row]

        cell.textLabel?.text = keyPath
        cell.detailTextLabel?.text = snapshot[keyPath]?.description
        cell.textLabel?.font = .monospacedSystemFont(ofSize: 14, weight: .regular)
        cell.detailTextLabel?.font = .monospacedSystemFont(ofSize: 12, weight: .regular)

        return cell
    }
}

// MARK: - UITableViewDelegate

extension StoreInspector: UITableViewDelegate {
    public func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)

        let keyPath = keyPaths[indexPath.row]
        let value = snapshot[keyPath]

        let alert = UIAlertController(
            title: keyPath,
            message: "Value: \(value?.description ?? "nil")",
            preferredStyle: .alert
        )

        alert.addAction(UIAlertAction(title: "OK", style: .default))
        alert.addAction(UIAlertAction(title: "Edit", style: .default) { [weak self] _ in
            self?.editValue(keyPath: keyPath, currentValue: value)
        })
        alert.addAction(UIAlertAction(title: "Delete", style: .destructive) { [weak self] _ in
            Task {
                await self?.store.remove(keyPath)
                await MainActor.run {
                    self?.loadSnapshot()
                }
            }
        })

        present(alert, animated: true)
    }

    private func editValue(keyPath: String, currentValue: StoreValue?) {
        let alert = UIAlertController(
            title: "Edit Value",
            message: "KeyPath: \(keyPath)",
            preferredStyle: .alert
        )

        alert.addTextField { textField in
            textField.text = currentValue?.description
            textField.placeholder = "New value"
        }

        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        alert.addAction(UIAlertAction(title: "Save", style: .default) { [weak self] _ in
            guard let valueText = alert.textFields?[0].text else { return }
            self?.setValue(keyPath: keyPath, valueText: valueText)
        })

        present(alert, animated: true)
    }

    public func tableView(
        _ tableView: UITableView,
        commit editingStyle: UITableViewCell.EditingStyle,
        forRowAt indexPath: IndexPath
    ) {
        if editingStyle == .delete {
            let keyPath = keyPaths[indexPath.row]
            Task {
                await store.remove(keyPath)
                await MainActor.run {
                    loadSnapshot()
                }
            }
        }
    }
}

#endif
