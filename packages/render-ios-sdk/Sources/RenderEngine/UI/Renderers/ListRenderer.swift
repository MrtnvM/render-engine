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
                logger.debug("Looking for keyPath: \(keyPath) in initialValue", category: "ListView")

                // The initialValue might have nested structure {type: "array", value: [...]}
                if let storeValueDict = initialValue[keyPath] as? [String: Any] {
                    logger.debug("Found store value dict with keys: \(storeValueDict.keys.joined(separator: ", "))", category: "ListView")
                    if let type = storeValueDict["type"] as? String,
                       type == "array",
                       let valueArray = storeValueDict["value"] as? [[String: Any]] {
                        // Extract the actual values from {type: "string", value: "item1"} format
                        var itemIds = valueArray.compactMap { dict in
                            dict["value"]
                        }
                        logger.debug("Loaded \(itemIds.count) item IDs from store initial value: \(itemIds)", category: "ListView")

                        // Check if there's an itemGetter to resolve full items
                        if let itemGetterDict = component.data.getDictionary(forKey: "itemGetter"),
                           !itemGetterDict.isEmpty {
                            logger.debug("Found itemGetter with keys: \(itemGetterDict.keys.joined(separator: ", "))", category: "ListView")
                            logger.debug("ItemGetter structure: \(itemGetterDict)", category: "ListView")
                            items = resolveItemsWithGetter(itemIds: itemIds, getter: itemGetterDict, initialValue: initialValue, scenarioId: scenario.key)
                            logger.debug("Resolved items count: \(items.count)", category: "ListView")
                            for (index, item) in items.enumerated() {
                                logger.debug("Item[\(index)]: \(item)", category: "ListView")
                            }
                        } else {
                            // No itemGetter, use IDs directly
                            logger.debug("No itemGetter found, using IDs directly", category: "ListView")
                            items = itemIds
                        }
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

    private func resolveItemsWithGetter(itemIds: [Any], getter: [String: Any], initialValue: [String: Any], scenarioId: String) -> [Any] {
        // The getter should have structure:
        // { kind: "storeValue", storeRef: {...}, keyPath: { kind: "computed", operation: "template", template: "items.{0}", operands: [...] } }

        logger.debug("resolveItemsWithGetter called with \(itemIds.count) item IDs", category: "ListView")

        guard let keyPathValue = getter["keyPath"] else {
            logger.error("itemGetter missing keyPath", category: "ListView")
            return itemIds
        }

        logger.debug("KeyPath value type: \(type(of: keyPathValue))", category: "ListView")

        var resolvedItems: [Any] = []

        for (index, itemId) in itemIds.enumerated() {
            logger.debug("Processing item \(index): \(itemId)", category: "ListView")

            // Build the actual keyPath by resolving the template
            let resolvedKeyPath: String

            if let keyPathDict = keyPathValue as? [String: Any],
               let kind = keyPathDict["kind"] as? String,
               kind == "computed",
               let operation = keyPathDict["operation"] as? String,
               operation == "template",
               let template = keyPathDict["template"] as? String {
                // Replace {0} with the item ID
                resolvedKeyPath = template.replacingOccurrences(of: "{0}", with: "\(itemId)")
                logger.debug("Resolved template '\(template)' to '\(resolvedKeyPath)'", category: "ListView")
            } else if let keyPathString = keyPathValue as? String {
                // Simple string keyPath
                resolvedKeyPath = keyPathString
                logger.debug("Using simple keyPath: \(resolvedKeyPath)", category: "ListView")
            } else {
                logger.warning("Unsupported keyPath format in itemGetter", category: "ListView")
                resolvedItems.append(itemId)
                continue
            }

            // Navigate the keyPath to get the item object
            let pathComponents = resolvedKeyPath.split(separator: ".").map(String.init)
            logger.debug("Path components: \(pathComponents)", category: "ListView")
            var currentValue: Any? = initialValue

            for component in pathComponents {
                if let dict = currentValue as? [String: Any] {
                    currentValue = dict[component]
                    logger.debug("Navigated to '\(component)', found: \(currentValue != nil ? "value" : "nil")", category: "ListView")

                    // Unwrap StoreValueDescriptor if needed
                    if let valueDict = currentValue as? [String: Any],
                       let _ = valueDict["type"] as? String,
                       let actualValue = valueDict["value"] {
                        currentValue = actualValue
                        logger.debug("Unwrapped StoreValueDescriptor, actual value type: \(type(of: actualValue))", category: "ListView")
                    }
                } else {
                    logger.warning("Cannot navigate - current value is not a dictionary", category: "ListView")
                    currentValue = nil
                    break
                }
            }

            // Extract the actual value from StoreValueDescriptor format
            if let valueDict = currentValue as? [String: Any],
               let type = valueDict["type"] as? String,
               type == "object",
               let objectValue = valueDict["value"] as? [String: Any] {
                // Convert StoreValueDescriptor object to plain dictionary
                var plainObject: [String: Any] = [:]
                logger.debug("Converting StoreValueDescriptor object with \(objectValue.count) fields", category: "ListView")
                for (key, val) in objectValue {
                    if let valDict = val as? [String: Any],
                       let innerValue = valDict["value"] {
                        plainObject[key] = innerValue
                        logger.debug("  \(key) = \(innerValue)", category: "ListView")
                    }
                }
                resolvedItems.append(plainObject)
                logger.debug("Resolved item with keys: \(plainObject.keys.joined(separator: ", "))", category: "ListView")
            } else {
                // Fallback: use the value as-is
                logger.warning("Current value is not a StoreValueDescriptor object, using as-is", category: "ListView")
                if let value = currentValue {
                    logger.debug("Appending value: \(value)", category: "ListView")
                    resolvedItems.append(value)
                } else {
                    logger.warning("No value found, using itemId", category: "ListView")
                    resolvedItems.append(itemId)
                }
            }
        }

        logger.debug("Resolved \(resolvedItems.count) full items", category: "ListView")
        return resolvedItems
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
        logger.debug("Configuring cell \(indexPath.row) with item: \(item)", category: "ListView")
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
