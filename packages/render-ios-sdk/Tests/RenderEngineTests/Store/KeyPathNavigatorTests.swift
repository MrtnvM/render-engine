import Testing
import Foundation
@testable import RenderEngine

@Suite("KeyPath Navigator Tests")
struct KeyPathNavigatorTests {

    @Test("Get simple property")
    func testGetSimpleProperty() {
        let root = StoreValue.object(["name": .string("Alice")])

        let value = KeyPathNavigator.get("name", in: root)

        #expect(value == .string("Alice"))
    }

    @Test("Get nested property")
    func testGetNestedProperty() {
        let root = StoreValue.object([
            "user": .object([
                "name": .string("Bob")
            ])
        ])

        let value = KeyPathNavigator.get("user.name", in: root)

        #expect(value == .string("Bob"))
    }

    @Test("Get array element")
    func testGetArrayElement() {
        let root = StoreValue.object([
            "items": .array([
                .string("a"),
                .string("b"),
                .string("c")
            ])
        ])

        let value = KeyPathNavigator.get("items[1]", in: root)

        #expect(value == .string("b"))
    }

    @Test("Get nested array element property")
    func testGetNestedArrayProperty() {
        let root = StoreValue.object([
            "users": .array([
                .object(["name": .string("Alice")]),
                .object(["name": .string("Bob")])
            ])
        ])

        let value = KeyPathNavigator.get("users[1].name", in: root)

        #expect(value == .string("Bob"))
    }

    @Test("Get non-existent keyPath returns nil")
    func testGetNonExistent() {
        let root = StoreValue.object(["name": .string("Alice")])

        let value = KeyPathNavigator.get("age", in: root)

        #expect(value == nil)
    }

    @Test("Set simple property")
    func testSetSimpleProperty() {
        let root = StoreValue.object([:])

        let (newRoot, oldValue) = KeyPathNavigator.set("name", value: .string("Alice"), in: root)

        #expect(oldValue == nil)
        #expect(KeyPathNavigator.get("name", in: newRoot) == .string("Alice"))
    }

    @Test("Set nested property")
    func testSetNestedProperty() {
        let root = StoreValue.object([:])

        let (newRoot, _) = KeyPathNavigator.set("user.name", value: .string("Bob"), in: root)

        #expect(KeyPathNavigator.get("user.name", in: newRoot) == .string("Bob"))
    }

    @Test("Set array element")
    func testSetArrayElement() {
        let root = StoreValue.object([
            "items": .array([.string("a"), .string("b")])
        ])

        let (newRoot, _) = KeyPathNavigator.set("items[1]", value: .string("B"), in: root)

        #expect(KeyPathNavigator.get("items[1]", in: newRoot) == .string("B"))
    }

    @Test("Set extends array if needed")
    func testSetExtendsArray() {
        let root = StoreValue.object([
            "items": .array([.string("a")])
        ])

        let (newRoot, _) = KeyPathNavigator.set("items[5]", value: .string("f"), in: root)

        let items = KeyPathNavigator.get("items", in: newRoot)?.arrayValue
        #expect(items?.count == 6)
        #expect(items?[5] == .string("f"))
    }

    @Test("Remove property")
    func testRemoveProperty() {
        let root = StoreValue.object([
            "name": .string("Alice"),
            "age": .integer(30)
        ])

        let (newRoot, removedValue) = KeyPathNavigator.remove("name", from: root)

        #expect(removedValue == .string("Alice"))
        #expect(KeyPathNavigator.get("name", in: newRoot) == nil)
        #expect(KeyPathNavigator.get("age", in: newRoot) == .integer(30))
    }

    @Test("Remove array element")
    func testRemoveArrayElement() {
        let root = StoreValue.object([
            "items": .array([.string("a"), .string("b"), .string("c")])
        ])

        let (newRoot, removedValue) = KeyPathNavigator.remove("items[1]", from: root)

        #expect(removedValue == .string("b"))

        let items = KeyPathNavigator.get("items", in: newRoot)?.arrayValue
        #expect(items?.count == 2)
        #expect(items?[0] == .string("a"))
        #expect(items?[1] == .string("c"))
    }

    @Test("Merge objects")
    func testMerge() {
        let root = StoreValue.object([
            "user": .object([
                "name": .string("Alice"),
                "age": .integer(30)
            ])
        ])

        let (newRoot, _) = KeyPathNavigator.merge(
            "user",
            object: ["city": .string("NYC")],
            in: root
        )

        let user = KeyPathNavigator.get("user", in: newRoot)?.objectValue
        #expect(user?.count == 3)
        #expect(user?["name"] == .string("Alice"))
        #expect(user?["city"] == .string("NYC"))
    }

    @Test("Merge overwrites existing keys")
    func testMergeOverwrite() {
        let root = StoreValue.object([
            "user": .object(["name": .string("Alice")])
        ])

        let (newRoot, _) = KeyPathNavigator.merge(
            "user",
            object: ["name": .string("Bob")],
            in: root
        )

        #expect(KeyPathNavigator.get("user.name", in: newRoot) == .string("Bob"))
    }
}
