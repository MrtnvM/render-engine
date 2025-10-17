import UIKit
import Combine

// MARK: - List Renderer

/// Renderer responsible for virtualized list rendering using UITableView
class ListRenderer: Renderer {
    let type = "List"

    private let registry = DIContainer.shared.componentRegistry
    private let logger = DIContainer.shared.currentLogger

    @MainActor
    func render(component: Component, context: RendererContext) -> UIView? {
        let staticDescriptors = parseStaticItems(from: component)
        let storeKeyPath = resolveStoreKeyPath(from: component)

        return ListRendererView(
            component: component,
            context: context,
            registry: registry,
            logger: logger,
            initialItems: staticDescriptors,
            storeKeyPath: storeKeyPath
        )
    }

    private func parseStaticItems(from component: Component) -> [ListItemDescriptor] {
        // Prefer runtime data overrides, otherwise fallback to properties
        let dataItems = component.data.getConfigArray(forKey: "items")
        let propertyItems = component.properties.getConfigArray(forKey: "items")
        let configs = dataItems.isEmpty ? propertyItems : dataItems

        return configs.compactMap { config in
            guard let childComponent = try? Component.create(from: config) else {
                logger.warning("ListRenderer failed to parse item config", category: "ListRenderer")
                return nil
            }
            return ListItemDescriptor(component: childComponent)
        }
    }

    private func resolveStoreKeyPath(from component: Component) -> String? {
        if let keyPath = component.data.getString(forKey: "itemsStoreKeyPath") {
            return keyPath
        }
        if let nested = component.data.getString(forKey: "items.keyPath") {
            return nested
        }
        if let propsNested = component.properties.getString(forKey: "itemsStoreKeyPath") {
            return propsNested
        }
        return nil
    }
}

// MARK: - List Item Descriptor

struct ListItemDescriptor: Hashable {
    let id: String
    let component: Component

    init(component: Component) {
        self.id = component.id
        self.component = component
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }

    static func == (lhs: ListItemDescriptor, rhs: ListItemDescriptor) -> Bool {
        return lhs.id == rhs.id
    }
}

// MARK: - Virtualized List View

@MainActor
final class ListRendererView: RenderableView {
    enum Section: Hashable {
        case main
    }

    private let registry: ComponentRegistry
    private let logger: Logger
    private let storeKeyPath: String?

    private var staticDescriptors: [ListItemDescriptor]
    private var descriptors: [ListItemDescriptor]
    private var descriptorLookup: [String: ListItemDescriptor] = [:]

    private var storeCancellable: AnyCancellable?

    let tableView: UITableView = UITableView(frame: .zero, style: .plain)

    private lazy var dataSource: UITableViewDiffableDataSource<Section, String> = {
        let dataSource = UITableViewDiffableDataSource<Section, String>(tableView: tableView) { [weak self] tableView, indexPath, itemIdentifier in
            guard
                let self = self,
                let descriptor = self.descriptorLookup[itemIdentifier]
            else {
                return UITableViewCell()
            }

            let cell = tableView.dequeueReusableCell(withIdentifier: ListRendererCell.reuseIdentifier, for: indexPath) as? ListRendererCell ?? ListRendererCell()
            cell.configure(
                with: descriptor,
                context: self.context,
                registry: self.registry,
                logger: self.logger
            )
            return cell
        }
        return dataSource
    }()

    init(
        component: Component,
        context: RendererContext,
        registry: ComponentRegistry,
        logger: Logger,
        initialItems: [ListItemDescriptor],
        storeKeyPath: String?
    ) {
        self.registry = registry
        self.logger = logger
        self.staticDescriptors = initialItems
        self.descriptors = initialItems
        self.storeKeyPath = storeKeyPath

        super.init(component: component, context: context)

        setupTableView()
        applySnapshot(animated: false)
        subscribeToStoreIfNeeded()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    deinit {
        storeCancellable?.cancel()
    }

    private func setupTableView() {
        tableView.backgroundColor = .clear
        tableView.separatorStyle = .none
        tableView.allowsSelection = false
        tableView.rowHeight = UITableView.automaticDimension
        tableView.estimatedRowHeight = 44
        tableView.tableFooterView = UIView()
        tableView.register(ListRendererCell.self, forCellReuseIdentifier: ListRendererCell.reuseIdentifier)

        addSubview(tableView)
        tableView.yoga.isEnabled = true
        flex.define { flex in
            flex.addItem(tableView)
                .grow(1)
                .shrink(1)
        }
    }

    private func applySnapshot(animated: Bool) {
        descriptorLookup = Dictionary(uniqueKeysWithValues: descriptors.map { ($0.id, $0) })

        var snapshot = NSDiffableDataSourceSnapshot<Section, String>()
        snapshot.appendSections([.main])
        snapshot.appendItems(descriptors.map { $0.id })
        dataSource.apply(snapshot, animatingDifferences: animated)
    }

    private func subscribeToStoreIfNeeded() {
        guard let keyPath = storeKeyPath, let store = context.store else { return }

        storeCancellable = store.publisher(for: keyPath)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] value in
                guard let self = self else { return }
                let dynamicDescriptors = self.makeDescriptors(from: value)
                if dynamicDescriptors.isEmpty {
                    self.descriptors = self.staticDescriptors
                } else {
                    self.descriptors = dynamicDescriptors
                }
                self.applySnapshot(animated: true)
            }
    }

    private func makeDescriptors(from value: StoreValue?) -> [ListItemDescriptor] {
        guard let value = value else { return [] }

        switch value {
        case .array(let array):
            return array.compactMap { makeDescriptor(from: $0) }
        case .object(let object):
            return object
                .sorted { $0.key < $1.key }
                .compactMap { makeDescriptor(from: $0.value) }
        default:
            logger.warning("ListRenderer store value is not an array or object", category: "ListRenderer")
            return []
        }
    }

    private func makeDescriptor(from value: StoreValue) -> ListItemDescriptor? {
        guard case .object(let object) = value else {
            logger.warning("ListRenderer expected object value for list item", category: "ListRenderer")
            return nil
        }

        let raw = object.mapValues { $0.value }
        let config = Config(raw)

        guard let component = try? Component.create(from: config) else {
            logger.warning("ListRenderer failed to create component from store item", category: "ListRenderer")
            return nil
        }

        return ListItemDescriptor(component: component)
    }
}

// MARK: - Virtualized Cell

@MainActor
final class ListRendererCell: UITableViewCell {
    static let reuseIdentifier = "ListRendererCell"

    private var hostedView: UIView?
    private var currentComponentId: String?

    static var renderedCount = 0

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        selectionStyle = .none
        backgroundColor = .clear
        contentView.backgroundColor = .clear
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func prepareForReuse() {
        super.prepareForReuse()
        resetHostedView()
    }

    func configure(
        with descriptor: ListItemDescriptor,
        context: RendererContext,
        registry: ComponentRegistry,
        logger: Logger
    ) {
        guard descriptor.id != currentComponentId else { return }

        resetHostedView()

        guard let renderer = registry.renderer(for: descriptor.component.type) else {
            logger.warning("ListRenderer missing renderer for type \(descriptor.component.type)", category: "ListRenderer")
            return
        }

        guard let renderedView = renderer.render(component: descriptor.component, context: context) else {
            logger.warning("ListRenderer failed to render component id=\(descriptor.id)", category: "ListRenderer")
            return
        }

        hostedView = renderedView
        currentComponentId = descriptor.id

        renderedView.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(renderedView)

        NSLayoutConstraint.activate([
            renderedView.topAnchor.constraint(equalTo: contentView.topAnchor),
            renderedView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            renderedView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            renderedView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor)
        ])

        contentView.setNeedsLayout()
        contentView.layoutIfNeeded()

        ListRendererCell.renderedCount += 1
    }

    private func resetHostedView() {
        if let hostedView = hostedView {
            StoreSubscriptionManager.unsubscribeAll(from: hostedView)
            hostedView.removeFromSuperview()
        }
        hostedView = nil
        currentComponentId = nil
    }
}
