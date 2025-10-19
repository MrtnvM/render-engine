import UIKit
import FlexLayout

/// Renderer for the "List" component type.
/// A List renders items from an array using UITableView with cell reusing.
class ListRenderer: Renderer {
    let type = "List"

    @MainActor func render(component: Component, context: RendererContext) -> UIView? {
        // Extract itemComponent template from component.data
        let itemComponentConfig = component.data.getConfig(forKey: "itemComponent")

        // Check if itemComponent config is empty
        if itemComponentConfig.isEmpty {
            DIContainer.shared.logger.error("List component missing itemComponent in data", category: "ListRenderer")
            return nil
        }

        // Create the item component template
        guard let itemComponent = try? Component.create(from: itemComponentConfig) else {
            DIContainer.shared.logger.error("Failed to create itemComponent from config", category: "ListRenderer")
            return nil
        }

        // Get data source (array or store reference)
        let dataValue = component.data.get(forKey: "data")

        // Create the list view
        let listView = ListView(
            component: component,
            itemComponent: itemComponent,
            dataValue: dataValue,
            context: context
        )

        return listView
    }
}

/// Custom UIView that contains a UITableView for rendering list items
private class ListView: RenderableView, UITableViewDataSource, UITableViewDelegate {
    private let tableView: UITableView
    private let itemComponent: Component
    private var dataValue: Any?
    private var items: [Any] = []
    private let logger = DIContainer.shared.logger

    private static let cellReuseIdentifier = "ListCell"

    init(component: Component, itemComponent: Component, dataValue: Any?, context: RendererContext) {
        self.itemComponent = itemComponent
        self.dataValue = dataValue
        self.tableView = UITableView(frame: .zero, style: .plain)

        super.init(component: component, context: context)

        setupTableView()
        resolveDataSource()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupTableView() {
        tableView.dataSource = self
        tableView.delegate = self
        tableView.separatorStyle = .none
        tableView.backgroundColor = .clear
        tableView.register(ListCell.self, forCellReuseIdentifier: ListView.cellReuseIdentifier)

        // Add table view to flex container
        flex.addItem(tableView).grow(1).shrink(1)
    }

    private func resolveDataSource() {
        // Check if dataValue is a store placeholder
        if let dict = dataValue as? [String: Any],
           let storeRef = dict["__storeRef"] as? String,
           let keyPath = dict["__keyPath"] as? String {
            // This is a store reference placeholder - resolve it from the store
            logger.debug("Resolving store reference: \(storeRef).\(keyPath)", category: "ListView")

            // Get the store from context
            guard let scenario = context.scenario else {
                logger.error("Cannot resolve store reference - no scenario in context", category: "ListView")
                items = []
                tableView.reloadData()
                return
            }

            // Find the store descriptor
            let storeDescriptors = scenario.stores
            logger.debug("Found \(storeDescriptors.count) store descriptors in scenario", category: "ListView")

            var foundDescriptor: StoreDescriptor? = nil
            for descriptor in storeDescriptors {
                logger.debug("Checking store: scope=\(descriptor.scope), storage=\(descriptor.storage)", category: "ListView")
                if descriptor.scope == "scenario" && descriptor.storage == "memory" {
                    foundDescriptor = descriptor
                    break
                }
            }

            guard let descriptor = foundDescriptor else {
                logger.error("Store not found in scenario. Looking for scope='scenario', storage='memory'", category: "ListView")
                items = []
                tableView.reloadData()
                return
            }

            // Get or create the store
            guard let storeFactory = context.storeFactory else {
                logger.error("No store factory available", category: "ListView")
                items = []
                tableView.reloadData()
                return
            }

            let store = storeFactory.makeStore(
                scope: .scenario(id: scenario.key),
                storage: .memory
            )

            // Get the value directly from the initial value (since stores might not be initialized yet)
            // This is a simplified approach for MVP
            if let initialValue = descriptor.initialValue {
                logger.debug("Store initialValue keys: \(initialValue.keys.joined(separator: ", "))", category: "ListView")

                // The initialValue might have nested structure {type: "array", value: [...]}
                if let storeValueDict = initialValue[keyPath] as? [String: Any] {
                    if let type = storeValueDict["type"] as? String,
                       type == "array",
                       let valueArray = storeValueDict["value"] as? [[String: Any]] {
                        // Extract the actual values from {type: "string", value: "item1"} format
                        items = valueArray.compactMap { dict in
                            dict["value"]
                        }
                        logger.debug("Loaded \(items.count) items from store initial value", category: "ListView")
                    } else {
                        logger.warning("Store value at \(keyPath) has unexpected format", category: "ListView")
                        items = []
                    }
                } else if let arrayValue = initialValue[keyPath] as? [Any] {
                    // Fallback: plain array format
                    items = arrayValue
                    logger.debug("Loaded \(items.count) items from plain array", category: "ListView")
                } else {
                    logger.warning("No value found at keyPath: \(keyPath)", category: "ListView")
                    items = []
                }
            } else {
                logger.warning("Store has no initial value", category: "ListView")
                items = []
            }

            tableView.reloadData()
            return
        }

        // Handle direct array data
        if let array = dataValue as? [Any] {
            items = array
            tableView.reloadData()
            return
        }

        logger.warning("List data is neither an array nor a store reference", category: "ListView")
        items = []
        tableView.reloadData()
    }

    // MARK: - UITableViewDataSource

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return items.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(
            withIdentifier: ListView.cellReuseIdentifier,
            for: indexPath
        ) as! ListCell

        let item = items[indexPath.row]
        cell.configure(with: itemComponent, item: item, index: indexPath.row, context: self.context)

        return cell
    }

    // MARK: - UITableViewDelegate

    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return UITableView.automaticDimension
    }

    func tableView(_ tableView: UITableView, estimatedHeightForRowAt indexPath: IndexPath) -> CGFloat {
        return 44
    }
}
