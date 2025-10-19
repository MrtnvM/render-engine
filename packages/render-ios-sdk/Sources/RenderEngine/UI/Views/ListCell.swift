import UIKit
import FlexLayout

/// Reusable table view cell for rendering list items
class ListCell: UITableViewCell {
    private var contentFlexView: UIView?
    private let logger = DIContainer.shared.logger

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        selectionStyle = .none
        backgroundColor = .clear
        contentView.backgroundColor = .clear
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    /// Configure the cell with a component template and item data
    func configure(with itemComponent: Component, item: Any, index: Int, context: RendererContext) {
        logger.debug("ListCell.configure called for index \(index)", category: "ListCell")
        logger.debug("Item type: \(type(of: item))", category: "ListCell")
        logger.debug("Item value: \(item)", category: "ListCell")

        // Clear previous content
        contentFlexView?.removeFromSuperview()
        contentFlexView = nil

        // Create props Config with item data
        // This allows PropsResolver to resolve {type: 'prop', key: 'item'} references
        var itemProps: [String: Any] = ["item": item, "index": index]

        // If item is a string, also set it directly
        if let stringItem = item as? String {
            itemProps["item"] = stringItem
            logger.debug("Item is a string: \(stringItem)", category: "ListCell")
        } else if let dictItem = item as? [String: Any] {
            logger.debug("Item is a dictionary with keys: \(dictItem.keys.joined(separator: ", "))", category: "ListCell")
        }

        let propsConfig = Config(itemProps)
        logger.debug("Created props config with keys: \(propsConfig.getRawDictionary().keys.joined(separator: ", "))", category: "ListCell")

        // Build the view tree for this item with props context
        let viewTreeBuilder = ViewTreeBuilder(
            scenario: context.scenario!,
            viewController: context.viewController,
            navigationController: context.navigationController,
            window: context.window
        )

        guard let itemView = viewTreeBuilder.buildViewTree(from: itemComponent, props: propsConfig) else {
            logger.error("Failed to build view tree for list item", category: "ListCell")
            return
        }

        // Add the item view to the cell's content view
        contentView.addSubview(itemView)
        contentFlexView = itemView

        // Enable yoga layout
        itemView.yoga.isEnabled = true

        // Pin the itemView to contentView edges using frame-based layout
        itemView.translatesAutoresizingMaskIntoConstraints = true
    }

    override func layoutSubviews() {
        super.layoutSubviews()

        // Layout the flex view to match contentView bounds
        if let flexView = contentFlexView {
            flexView.frame = contentView.bounds
            flexView.flex.layout(mode: .adjustHeight)
        }
    }

    override func sizeThatFits(_ size: CGSize) -> CGSize {
        guard let flexView = contentFlexView else {
            return CGSize(width: size.width, height: 44)
        }

        // Calculate the size that fits the content
        flexView.frame = CGRect(x: 0, y: 0, width: size.width, height: 0)
        flexView.flex.layout(mode: .adjustHeight)

        return CGSize(width: size.width, height: flexView.frame.height)
    }

    override func systemLayoutSizeFitting(_ targetSize: CGSize, withHorizontalFittingPriority horizontalFittingPriority: UILayoutPriority, verticalFittingPriority: UILayoutPriority) -> CGSize {
        return sizeThatFits(targetSize)
    }

}
