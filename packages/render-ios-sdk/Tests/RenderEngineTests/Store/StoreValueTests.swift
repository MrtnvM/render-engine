import Testing
import Foundation
@testable import RenderEngine

@Suite("StoreValue Tests")
struct StoreValueTests {

    @Test("StoreValue - String encoding/decoding")
    func testStringValue() throws {
        let value = StoreValue.string("hello")

        let encoder = JSONEncoder()
        let data = try encoder.encode(value)

        let decoder = JSONDecoder()
        let decoded = try decoder.decode(StoreValue.self, from: data)

        #expect(decoded == value)
        #expect(decoded.stringValue == "hello")
    }

    @Test("StoreValue - Integer encoding/decoding")
    func testIntegerValue() throws {
        let value = StoreValue.integer(42)

        let encoder = JSONEncoder()
        let data = try encoder.encode(value)

        let decoder = JSONDecoder()
        let decoded = try decoder.decode(StoreValue.self, from: data)

        #expect(decoded == value)
        #expect(decoded.integerValue == 42)
    }

    @Test("StoreValue - Number encoding/decoding")
    func testNumberValue() throws {
        let value = StoreValue.number(3.14)

        let encoder = JSONEncoder()
        let data = try encoder.encode(value)

        let decoder = JSONDecoder()
        let decoded = try decoder.decode(StoreValue.self, from: data)

        #expect(decoded == value)
        #expect(decoded.numberValue == 3.14)
    }

    @Test("StoreValue - Bool encoding/decoding")
    func testBoolValue() throws {
        let value = StoreValue.bool(true)

        let encoder = JSONEncoder()
        let data = try encoder.encode(value)

        let decoder = JSONDecoder()
        let decoded = try decoder.decode(StoreValue.self, from: data)

        #expect(decoded == value)
        #expect(decoded.boolValue == true)
    }

    @Test("StoreValue - Array encoding/decoding")
    func testArrayValue() throws {
        let value = StoreValue.array([
            .string("a"),
            .integer(1),
            .bool(true)
        ])

        let encoder = JSONEncoder()
        let data = try encoder.encode(value)

        let decoder = JSONDecoder()
        let decoded = try decoder.decode(StoreValue.self, from: data)

        #expect(decoded == value)
        #expect(decoded.arrayValue?.count == 3)
    }

    @Test("StoreValue - Object encoding/decoding")
    func testObjectValue() throws {
        let value = StoreValue.object([
            "name": .string("John"),
            "age": .integer(30),
            "active": .bool(true)
        ])

        let encoder = JSONEncoder()
        let data = try encoder.encode(value)

        let decoder = JSONDecoder()
        let decoded = try decoder.decode(StoreValue.self, from: data)

        #expect(decoded == value)
        #expect(decoded.objectValue?.count == 3)
    }

    @Test("StoreValue - Null encoding/decoding")
    func testNullValue() throws {
        let value = StoreValue.null

        let encoder = JSONEncoder()
        let data = try encoder.encode(value)

        let decoder = JSONDecoder()
        let decoded = try decoder.decode(StoreValue.self, from: data)

        #expect(decoded == value)
        #expect(decoded.isNull == true)
    }

    @Test("StoreValue - Color value")
    func testColorValue() {
        let value = StoreValue.color("#FF5733")

        #expect(value.stringValue == "#FF5733")
    }

    @Test("StoreValue - URL value")
    func testURLValue() {
        let value = StoreValue.url("https://example.com")

        #expect(value.stringValue == "https://example.com")
    }

    @Test("StoreValue - Nested object")
    func testNestedObject() throws {
        let value = StoreValue.object([
            "user": .object([
                "name": .string("Alice"),
                "address": .object([
                    "city": .string("NYC"),
                    "zip": .integer(10001)
                ])
            ])
        ])

        let encoder = JSONEncoder()
        let data = try encoder.encode(value)

        let decoder = JSONDecoder()
        let decoded = try decoder.decode(StoreValue.self, from: data)

        #expect(decoded == value)
    }
}
