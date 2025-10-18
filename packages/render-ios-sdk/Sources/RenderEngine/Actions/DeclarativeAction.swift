import Foundation

// MARK: - Declarative Action Types

/// All supported declarative action kinds
public enum DeclarativeActionKind: String, Codable, Sendable {
    // Store operations
    case storeSet = "store.set"
    case storeRemove = "store.remove"
    case storeMerge = "store.merge"
    case storeTransaction = "store.transaction"

    // Navigation
    case navigationPush = "navigation.push"
    case navigationPop = "navigation.pop"
    case navigationReplace = "navigation.replace"
    case navigationModal = "navigation.modal"
    case navigationDismissModal = "navigation.dismissModal"
    case navigationPopTo = "navigation.popTo"
    case navigationReset = "navigation.reset"

    // UI
    case uiShowToast = "ui.showToast"
    case uiShowAlert = "ui.showAlert"
    case uiShowSheet = "ui.showSheet"
    case uiDismissSheet = "ui.dismissSheet"
    case uiShowLoading = "ui.showLoading"
    case uiHideLoading = "ui.hideLoading"

    // System
    case systemShare = "system.share"
    case systemOpenUrl = "system.openUrl"
    case systemHaptic = "system.haptic"
    case systemCopyToClipboard = "system.copyToClipboard"
    case systemRequestPermission = "system.requestPermission"

    // API
    case apiRequest = "api.request"

    // Control flow
    case sequence = "sequence"
    case conditional = "conditional"
}

// MARK: - Value Descriptors

/// Value descriptor that can be resolved at runtime
public enum ValueDescriptor: Codable, Equatable, Sendable {
    case literal(LiteralValue)
    case storeValue(StoreValueRef)
    case computed(ComputedValue)
    case eventData(EventDataRef)

    enum CodingKeys: String, CodingKey {
        case kind
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let kind = try container.decode(String.self, forKey: .kind)

        switch kind {
        case "literal":
            self = .literal(try LiteralValue(from: decoder))
        case "storeValue":
            self = .storeValue(try StoreValueRef(from: decoder))
        case "computed":
            self = .computed(try ComputedValue(from: decoder))
        case "eventData":
            self = .eventData(try EventDataRef(from: decoder))
        default:
            throw DecodingError.dataCorruptedError(
                forKey: .kind,
                in: container,
                debugDescription: "Unknown value descriptor kind: \(kind)"
            )
        }
    }

    public func encode(to encoder: Encoder) throws {
        switch self {
        case .literal(let value):
            try value.encode(to: encoder)
        case .storeValue(let value):
            try value.encode(to: encoder)
        case .computed(let value):
            try value.encode(to: encoder)
        case .eventData(let value):
            try value.encode(to: encoder)
        }
    }
}

public struct LiteralValue: Codable, Equatable, Sendable {
    public let kind: String = "literal"
    public let type: String
    public let value: AnyCodable

    enum CodingKeys: String, CodingKey {
        case kind, type, value
    }
}

public struct StoreValueRef: Codable, Equatable, Sendable {
    public let kind: String = "storeValue"
    public let storeRef: StoreReference
    public let keyPath: String
    public let defaultValue: LiteralValue?

    enum CodingKeys: String, CodingKey {
        case kind, storeRef, keyPath, defaultValue
    }
}

public struct ComputedValue: Codable, Equatable, Sendable {
    public let kind: String = "computed"
    public let operation: String
    public let operands: [ValueDescriptor]

    enum CodingKeys: String, CodingKey {
        case kind, operation, operands
    }
}

public struct EventDataRef: Codable, Equatable, Sendable {
    public let kind: String = "eventData"
    public let path: String

    enum CodingKeys: String, CodingKey {
        case kind, path
    }
}

public struct StoreReference: Codable, Equatable, Sendable {
    public let scope: String
    public let storage: String
}

// MARK: - Declarative Actions

public protocol DeclarativeAction: Codable, Sendable {
    var id: String { get }
    var kind: DeclarativeActionKind { get }
}

// MARK: - Store Actions

public struct StoreSetAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .storeSet
    public let storeRef: StoreReference
    public let keyPath: String
    public let value: ValueDescriptor
}

public struct StoreRemoveAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .storeRemove
    public let storeRef: StoreReference
    public let keyPath: String
}

public struct StoreMergeAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .storeMerge
    public let storeRef: StoreReference
    public let keyPath: String
    public let value: ValueDescriptor
}

public struct StoreTransactionAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .storeTransaction
    public let storeRef: StoreReference
    public let actions: [AnyDeclarativeAction]
}

// MARK: - Navigation Actions

public struct NavigationPushAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .navigationPush
    public let screenId: String
    public let params: [String: ValueDescriptor]?
    public let animated: Bool?
}

public struct NavigationPopAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .navigationPop
    public let count: Int?
    public let animated: Bool?
}

public struct NavigationReplaceAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .navigationReplace
    public let screenId: String
    public let params: [String: ValueDescriptor]?
}

public struct NavigationModalAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .navigationModal
    public let screenId: String
    public let params: [String: ValueDescriptor]?
    public let presentationStyle: String?
}

// MARK: - UI Actions

public struct ShowToastAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .uiShowToast
    public let message: ValueDescriptor
    public let duration: Int?
    public let position: String?
}

public struct ShowAlertAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .uiShowAlert
    public let title: ValueDescriptor
    public let message: ValueDescriptor?
    public let buttons: [AlertButton]
}

public struct AlertButton: Codable, Equatable, Sendable {
    public let text: String
    public let style: String
    public let action: AnyDeclarativeAction?
}

public struct ShowSheetAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .uiShowSheet
    public let title: ValueDescriptor?
    public let options: [SheetOption]
}

public struct SheetOption: Codable, Equatable, Sendable {
    public let text: String
    public let icon: String?
    public let action: AnyDeclarativeAction?
}

// MARK: - System Actions

public struct ShareAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .systemShare
    public let content: ShareContent
}

public struct ShareContent: Codable, Equatable, Sendable {
    public let text: ValueDescriptor?
    public let url: ValueDescriptor?
    public let image: ValueDescriptor?
}

public struct OpenUrlAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .systemOpenUrl
    public let url: ValueDescriptor
    public let inApp: Bool?
}

public struct HapticAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .systemHaptic
    public let style: String
}

// MARK: - API Actions

public struct ApiRequestAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .apiRequest
    public let endpoint: String
    public let method: String
    public let headers: [String: ValueDescriptor]?
    public let body: ValueDescriptor?
    public let onSuccess: AnyDeclarativeAction?
    public let onError: AnyDeclarativeAction?
    public let responseMapping: ResponseMapping?
}

public struct ResponseMapping: Codable, Equatable, Sendable {
    public let targetStoreRef: StoreReference
    public let keyPath: String
    public let transform: ResponseTransform?
}

public struct ResponseTransform: Codable, Equatable, Sendable {
    public let type: String  // "jsonPath" or "template"
    public let expression: String
}

// MARK: - Control Flow Actions

public struct SequenceAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .sequence
    public let actions: [AnyDeclarativeAction]
    public let strategy: String
    public let stopOnError: Bool?
}

public struct ConditionalAction: DeclarativeAction {
    public let id: String
    public let kind: DeclarativeActionKind = .conditional
    public let condition: ConditionDescriptor
    public let then: [AnyDeclarativeAction]
    public let `else`: [AnyDeclarativeAction]?
}

public struct ConditionDescriptor: Codable, Equatable, Sendable {
    public let type: String
    public let left: ValueDescriptor?
    public let right: ValueDescriptor?
    public let conditions: [ConditionDescriptor]?
}

// MARK: - Type-erased wrapper

public struct AnyDeclarativeAction: Codable, Sendable {
    private let _action: any DeclarativeAction

    public var id: String { _action.id }
    public var kind: DeclarativeActionKind { _action.kind }

    public init<T: DeclarativeAction>(_ action: T) {
        self._action = action
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let kind = try container.decode(String.self, forKey: .kind)
        let actionKind = DeclarativeActionKind(rawValue: kind) ?? .storeSet

        switch actionKind {
        case .storeSet:
            _action = try StoreSetAction(from: decoder)
        case .storeRemove:
            _action = try StoreRemoveAction(from: decoder)
        case .storeMerge:
            _action = try StoreMergeAction(from: decoder)
        case .storeTransaction:
            _action = try StoreTransactionAction(from: decoder)
        case .navigationPush:
            _action = try NavigationPushAction(from: decoder)
        case .navigationPop:
            _action = try NavigationPopAction(from: decoder)
        case .navigationReplace:
            _action = try NavigationReplaceAction(from: decoder)
        case .navigationModal:
            _action = try NavigationModalAction(from: decoder)
        case .uiShowToast:
            _action = try ShowToastAction(from: decoder)
        case .uiShowAlert:
            _action = try ShowAlertAction(from: decoder)
        case .uiShowSheet:
            _action = try ShowSheetAction(from: decoder)
        case .systemShare:
            _action = try ShareAction(from: decoder)
        case .systemOpenUrl:
            _action = try OpenUrlAction(from: decoder)
        case .systemHaptic:
            _action = try HapticAction(from: decoder)
        case .apiRequest:
            _action = try ApiRequestAction(from: decoder)
        case .sequence:
            _action = try SequenceAction(from: decoder)
        case .conditional:
            _action = try ConditionalAction(from: decoder)
        default:
            throw DecodingError.dataCorruptedError(
                forKey: .kind,
                in: container,
                debugDescription: "Unsupported action kind: \(kind)"
            )
        }
    }

    public func encode(to encoder: Encoder) throws {
        try _action.encode(to: encoder)
    }

    enum CodingKeys: String, CodingKey {
        case kind
    }

    public func `as`<T: DeclarativeAction>(_ type: T.Type) -> T? {
        return _action as? T
    }
}

// MARK: - AnyCodable Helper

public struct AnyCodable: Codable, Equatable, Sendable {
    public let value: Any

    public init(_ value: Any) {
        self.value = value
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let intValue = try? container.decode(Int.self) {
            value = intValue
        } else if let doubleValue = try? container.decode(Double.self) {
            value = doubleValue
        } else if let stringValue = try? container.decode(String.self) {
            value = stringValue
        } else if let boolValue = try? container.decode(Bool.self) {
            value = boolValue
        } else if container.decodeNil() {
            value = NSNull()
        } else if let arrayValue = try? container.decode([AnyCodable].self) {
            value = arrayValue.map(\.value)
        } else if let dictValue = try? container.decode([String: AnyCodable].self) {
            value = dictValue.mapValues(\.value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Cannot decode AnyCodable"
            )
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch value {
        case let intValue as Int:
            try container.encode(intValue)
        case let doubleValue as Double:
            try container.encode(doubleValue)
        case let stringValue as String:
            try container.encode(stringValue)
        case let boolValue as Bool:
            try container.encode(boolValue)
        case is NSNull:
            try container.encodeNil()
        case let arrayValue as [Any]:
            try container.encode(arrayValue.map { AnyCodable($0) })
        case let dictValue as [String: Any]:
            try container.encode(dictValue.mapValues { AnyCodable($0) })
        default:
            throw EncodingError.invalidValue(
                value,
                EncodingError.Context(
                    codingPath: container.codingPath,
                    debugDescription: "Cannot encode value of type \(type(of: value))"
                )
            )
        }
    }

    public static func == (lhs: AnyCodable, rhs: AnyCodable) -> Bool {
        // Simple equality comparison for supported types
        switch (lhs.value, rhs.value) {
        case (let l as Int, let r as Int):
            return l == r
        case (let l as Double, let r as Double):
            return l == r
        case (let l as String, let r as String):
            return l == r
        case (let l as Bool, let r as Bool):
            return l == r
        default:
            return false
        }
    }
}
