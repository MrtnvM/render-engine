import Testing
import Foundation
@testable import RenderEngine

@Suite("StoreValueDescriptor Tests")
struct StoreValueDescriptorTests {

    @Test("Convert string descriptor to StoreValue")
    func testStringConversion() {
        let descriptor = StoreValueDescriptor.string("hello")
        let storeValue = descriptor.toStoreValue()

        #expect(storeValue == .string("hello"))
    }

    @Test("Convert integer descriptor to StoreValue")
    func testIntegerConversion() {
        let descriptor = StoreValueDescriptor.integer(42)
        let storeValue = descriptor.toStoreValue()

        #expect(storeValue == .integer(42))
    }

    @Test("Convert number descriptor to StoreValue")
    func testNumberConversion() {
        let descriptor = StoreValueDescriptor.number(3.14)
        let storeValue = descriptor.toStoreValue()

        #expect(storeValue == .number(3.14))
    }

    @Test("Convert bool descriptor to StoreValue")
    func testBoolConversion() {
        let descriptor = StoreValueDescriptor.bool(true)
        let storeValue = descriptor.toStoreValue()

        #expect(storeValue == .bool(true))
    }

    @Test("Convert null descriptor to StoreValue")
    func testNullConversion() {
        let descriptor = StoreValueDescriptor.null
        let storeValue = descriptor.toStoreValue()

        #expect(storeValue == .null)
    }

    @Test("Convert array descriptor to StoreValue")
    func testArrayConversion() {
        let descriptor = StoreValueDescriptor.array([
            .integer(1),
            .string("two"),
            .bool(true)
        ])
        let storeValue = descriptor.toStoreValue()

        guard case .array(let arr) = storeValue else {
            Issue.record("Expected array value")
            return
        }

        #expect(arr.count == 3)
        #expect(arr[0] == .integer(1))
        #expect(arr[1] == .string("two"))
        #expect(arr[2] == .bool(true))
    }

    @Test("Convert object descriptor to StoreValue")
    func testObjectConversion() {
        let descriptor = StoreValueDescriptor.object([
            "name": .string("Alice"),
            "age": .integer(30),
            "active": .bool(true)
        ])
        let storeValue = descriptor.toStoreValue()

        guard case .object(let obj) = storeValue else {
            Issue.record("Expected object value")
            return
        }

        #expect(obj["name"] == .string("Alice"))
        #expect(obj["age"] == .integer(30))
        #expect(obj["active"] == .bool(true))
    }

    @Test("Convert nested object descriptor")
    func testNestedObjectConversion() {
        let descriptor = StoreValueDescriptor.object([
            "user": .object([
                "profile": .object([
                    "name": .string("Bob")
                ])
            ])
        ])
        let storeValue = descriptor.toStoreValue()

        guard case .object(let obj) = storeValue,
              case .object(let user) = obj["user"],
              case .object(let profile) = user["profile"] else {
            Issue.record("Expected nested object structure")
            return
        }

        #expect(profile["name"] == .string("Bob"))
    }
}
