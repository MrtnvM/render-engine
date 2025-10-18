import Testing
import UIKit
@testable import RenderEngine

@Suite("ListRenderer Tests")
struct ListRendererTests {

    @MainActor
    @Test("ListRenderer virtualizes visible cells")
    func testVirtualization() throws {
        ListRendererCell.renderedCount = 0

        let component = try makeListComponent(itemCount: 50)
        let renderer = ListRenderer()
        let context = RendererContext()

        guard let view = renderer.render(component: component, context: context) as? ListRendererView else {
            Issue.record("Expected ListRendererView instance")
            return
        }

        view.frame = CGRect(x: 0, y: 0, width: 320, height: 200)
        view.layoutIfNeeded()
        view.tableView.layoutIfNeeded()

        #expect(view.tableView.numberOfRows(inSection: 0) == 50)
        #expect(ListRendererCell.renderedCount > 0)
        #expect(ListRendererCell.renderedCount < 50)
    }

    @MainActor
    @Test("ListRenderer streams updates from store")
    func testStoreStreaming() async throws {
        ListRendererCell.renderedCount = 0

        let storeFactory = DefaultStoreFactory()
        let store = storeFactory.makeStore(scope: .scenario(id: "list-test"), storage: .memory)

        let component = try makeListComponent(
            itemCount: 1,
            data: ["itemsStoreKeyPath": "todos"]
        )

        let context = RendererContext(store: store, storeFactory: storeFactory)
        let renderer = ListRenderer()

        guard let view = renderer.render(component: component, context: context) as? ListRendererView else {
            Issue.record("Expected ListRendererView instance")
            return
        }

        view.frame = CGRect(x: 0, y: 0, width: 320, height: 240)
        view.layoutIfNeeded()
        view.tableView.layoutIfNeeded()

        #expect(view.tableView.numberOfRows(inSection: 0) == 1)

        let dynamicItems: [StoreValue] = (0..<3).map { index in
            StoreValue.object([
                "id": .string("dynamic_\(index)"),
                "type": .string("Text"),
                "style": .object([:] as [String: StoreValue]),
                "properties": .object([
                    "text": .string("Dynamic \(index)")
                ]),
                "data": .object([:] as [String: StoreValue])
            ])
        }

        await store.set("todos", .array(dynamicItems))
        try await Task.sleep(nanoseconds: 200_000_000)

        view.layoutIfNeeded()
        view.tableView.layoutIfNeeded()

        #expect(view.tableView.numberOfRows(inSection: 0) == 3)

        guard let firstCell = view.tableView.visibleCells.first else {
            Issue.record("Expected at least one visible cell")
            return
        }

        let label = (firstCell.contentView.subviews.first { $0 is UILabel }) as? UILabel
        #expect(label?.text == "Dynamic 0")
    }

    private func makeListComponent(itemCount: Int, data: [String: Any?]? = nil) throws -> Component {
        let items: [[String: Any?]] = (0..<itemCount).map { index in
            [
                "id": "text_\(index)",
                "type": "Text",
                "style": [:] as [String: Any?],
                "properties": [
                    "text": "Item \(index)"
                ],
                "data": [:] as [String: Any?]
            ]
        }

        let componentConfig: [String: Any?] = [
            "id": "list_component",
            "type": "List",
            "style": [:] as [String: Any?],
            "properties": [
                "items": items
            ],
            "data": data ?? [:]
        ]

        return try Component.create(from: Config(componentConfig))
    }
}
