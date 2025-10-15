import Testing
import Foundation
@testable import RenderEngine

@Suite("KeyPath Resolver Tests")
struct KeyPathResolverTests {

    @Test("Parse simple property keyPath")
    func testSimpleProperty() {
        let components = KeyPathResolver.parse("name")

        #expect(components.count == 1)
        #expect(components[0] == .property("name"))
    }

    @Test("Parse dot notation keyPath")
    func testDotNotation() {
        let components = KeyPathResolver.parse("user.name")

        #expect(components.count == 2)
        #expect(components[0] == .property("user"))
        #expect(components[1] == .property("name"))
    }

    @Test("Parse bracket notation keyPath")
    func testBracketNotation() {
        let components = KeyPathResolver.parse("items[0]")

        #expect(components.count == 2)
        #expect(components[0] == .property("items"))
        #expect(components[1] == .index(0))
    }

    @Test("Parse mixed notation keyPath")
    func testMixedNotation() {
        let components = KeyPathResolver.parse("users[1].address.city")

        #expect(components.count == 4)
        #expect(components[0] == .property("users"))
        #expect(components[1] == .index(1))
        #expect(components[2] == .property("address"))
        #expect(components[3] == .property("city"))
    }

    @Test("Parse multiple indices")
    func testMultipleIndices() {
        let components = KeyPathResolver.parse("matrix[0][1]")

        #expect(components.count == 3)
        #expect(components[0] == .property("matrix"))
        #expect(components[1] == .index(0))
        #expect(components[2] == .index(1))
    }

    @Test("Stringify components")
    func testStringify() {
        let components: [KeyPathComponent] = [
            .property("users"),
            .index(1),
            .property("name")
        ]

        let keyPath = KeyPathResolver.stringify(components)

        #expect(keyPath == "users[1].name")
    }

    @Test("Check prefix relationship")
    func testIsPrefix() {
        #expect(KeyPathResolver.isPrefix("cart", of: "cart.total") == true)
        #expect(KeyPathResolver.isPrefix("cart.total", of: "cart") == false)
        #expect(KeyPathResolver.isPrefix("cart", of: "cart") == true)
        #expect(KeyPathResolver.isPrefix("user", of: "cart.total") == false)
    }

    @Test("Check related keyPaths")
    func testAreRelated() {
        #expect(KeyPathResolver.areRelated("cart", "cart.total") == true)
        #expect(KeyPathResolver.areRelated("cart.total", "cart") == true)
        #expect(KeyPathResolver.areRelated("user", "cart") == false)
    }
}
