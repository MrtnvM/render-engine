import Foundation
import UIKit

/// Executes declarative actions natively on iOS
@MainActor
public final class DeclarativeActionExecutor {

    private let storeFactory: StoreFactory
    private let navigationController: UINavigationController?
    private let logger: Logger?

    public init(
        storeFactory: StoreFactory,
        navigationController: UINavigationController? = nil,
        logger: Logger? = nil
    ) {
        self.storeFactory = storeFactory
        self.navigationController = navigationController
        self.logger = logger
    }

    // MARK: - Main Execution

    /// Execute a declarative action
    public func execute(_ action: AnyDeclarativeAction, scenarioId: String = "default", eventData: [String: Any]? = nil) async throws {
        logger?.debug("Executing action: \(action.id) [\(action.kind.rawValue)]", category: "ActionExecutor")

        switch action.kind {
        // Store actions
        case .storeSet:
            if let storeAction = action.as(StoreSetAction.self) {
                try await executeStoreSet(storeAction, scenarioId: scenarioId, eventData: eventData)
            }
        case .storeRemove:
            if let storeAction = action.as(StoreRemoveAction.self) {
                try await executeStoreRemove(storeAction, scenarioId: scenarioId)
            }
        case .storeMerge:
            if let storeAction = action.as(StoreMergeAction.self) {
                try await executeStoreMerge(storeAction, scenarioId: scenarioId, eventData: eventData)
            }
        case .storeTransaction:
            if let storeAction = action.as(StoreTransactionAction.self) {
                try await executeStoreTransaction(storeAction, scenarioId: scenarioId, eventData: eventData)
            }

        // Navigation actions
        case .navigationPush:
            if let navAction = action.as(NavigationPushAction.self) {
                try await executeNavigationPush(navAction, scenarioId: scenarioId, eventData: eventData)
            }
        case .navigationPop:
            if let navAction = action.as(NavigationPopAction.self) {
                executeNavigationPop(navAction)
            }
        case .navigationReplace:
            if let navAction = action.as(NavigationReplaceAction.self) {
                try await executeNavigationReplace(navAction, scenarioId: scenarioId, eventData: eventData)
            }
        case .navigationModal:
            if let navAction = action.as(NavigationModalAction.self) {
                try await executeNavigationModal(navAction, scenarioId: scenarioId, eventData: eventData)
            }
        case .navigationDismissModal:
            executeDismissModal()
        case .navigationPopTo:
            // Not yet implemented
            break
        case .navigationReset:
            // Not yet implemented
            break

        // UI actions
        case .uiShowToast:
            if let uiAction = action.as(ShowToastAction.self) {
                try await executeShowToast(uiAction, eventData: eventData)
            }
        case .uiShowAlert:
            if let uiAction = action.as(ShowAlertAction.self) {
                try await executeShowAlert(uiAction, eventData: eventData)
            }
        case .uiShowSheet:
            if let uiAction = action.as(ShowSheetAction.self) {
                try await executeShowSheet(uiAction, eventData: eventData)
            }
        case .uiDismissSheet:
            executeDismissSheet()
        case .uiShowLoading:
            executeShowLoading()
        case .uiHideLoading:
            executeHideLoading()

        // System actions
        case .systemShare:
            if let sysAction = action.as(ShareAction.self) {
                try await executeShare(sysAction, eventData: eventData)
            }
        case .systemOpenUrl:
            if let sysAction = action.as(OpenUrlAction.self) {
                try await executeOpenUrl(sysAction, eventData: eventData)
            }
        case .systemHaptic:
            if let sysAction = action.as(HapticAction.self) {
                executeHaptic(sysAction)
            }
        case .systemCopyToClipboard:
            // Not yet implemented
            break
        case .systemRequestPermission:
            // Not yet implemented
            break

        // Control flow
        case .sequence:
            if let seqAction = action.as(SequenceAction.self) {
                try await executeSequence(seqAction, scenarioId: scenarioId, eventData: eventData)
            }
        case .conditional:
            if let condAction = action.as(ConditionalAction.self) {
                try await executeConditional(condAction, scenarioId: scenarioId, eventData: eventData)
            }
        }
    }

    // MARK: - Store Action Executors

    private func executeStoreSet(_ action: StoreSetAction, scenarioId: String, eventData: [String: Any]?) async throws {
        let store = getStore(from: action.storeRef, scenarioId: scenarioId)
        let value = try await resolveValue(action.value, scenarioId: scenarioId, eventData: eventData)
        await store.set(action.keyPath, value)
        logger?.debug("Set \(action.keyPath) = \(value)", category: "StoreExecutor")
    }

    private func executeStoreRemove(_ action: StoreRemoveAction, scenarioId: String) async throws {
        let store = getStore(from: action.storeRef, scenarioId: scenarioId)
        await store.remove(action.keyPath)
        logger?.debug("Removed \(action.keyPath)", category: "StoreExecutor")
    }

    private func executeStoreMerge(_ action: StoreMergeAction, scenarioId: String, eventData: [String: Any]?) async throws {
        let store = getStore(from: action.storeRef, scenarioId: scenarioId)
        let value = try await resolveValue(action.value, scenarioId: scenarioId, eventData: eventData)

        guard case .object(let dict) = value else {
            throw ActionExecutionError.invalidValueType("Expected object for merge")
        }

        await store.merge(action.keyPath, dict)
        logger?.debug("Merged \(action.keyPath)", category: "StoreExecutor")
    }

    private func executeStoreTransaction(_ action: StoreTransactionAction, scenarioId: String, eventData: [String: Any]?) async throws {
        for nestedAction in action.actions {
            try await execute(nestedAction, scenarioId: scenarioId, eventData: eventData)
        }
        logger?.debug("Executed transaction with \(action.actions.count) actions", category: "StoreExecutor")
    }

    // MARK: - Navigation Action Executors

    private func executeNavigationPush(_ action: NavigationPushAction, scenarioId: String, eventData: [String: Any]?) async throws {
        guard let navController = navigationController else {
            logger?.warning("Navigation controller not available", category: "NavigationExecutor")
            return
        }

        let params = try await resolveParams(action.params, scenarioId: scenarioId, eventData: eventData)
        logger?.debug("Pushing screen: \(action.screenId) with params: \(params ?? [:])", category: "NavigationExecutor")

        // Note: Actual implementation would instantiate the screen view controller
        // For now, this is a placeholder
    }

    private func executeNavigationPop(_ action: NavigationPopAction) {
        guard let navController = navigationController else {
            logger?.warning("Navigation controller not available", category: "NavigationExecutor")
            return
        }

        let animated = action.animated ?? true
        navController.popViewController(animated: animated)
        logger?.debug("Popped view controller", category: "NavigationExecutor")
    }

    private func executeNavigationReplace(_ action: NavigationReplaceAction, scenarioId: String, eventData: [String: Any]?) async throws {
        guard let navController = navigationController else {
            logger?.warning("Navigation controller not available", category: "NavigationExecutor")
            return
        }

        let params = try await resolveParams(action.params, scenarioId: scenarioId, eventData: eventData)
        logger?.debug("Replacing with screen: \(action.screenId)", category: "NavigationExecutor")

        // Note: Actual implementation would replace the top view controller
    }

    private func executeNavigationModal(_ action: NavigationModalAction, scenarioId: String, eventData: [String: Any]?) async throws {
        guard let navController = navigationController else {
            logger?.warning("Navigation controller not available", category: "NavigationExecutor")
            return
        }

        let params = try await resolveParams(action.params, scenarioId: scenarioId, eventData: eventData)
        logger?.debug("Presenting modal: \(action.screenId)", category: "NavigationExecutor")

        // Note: Actual implementation would present the screen modally
    }

    private func executeDismissModal() {
        navigationController?.dismiss(animated: true)
        logger?.debug("Dismissed modal", category: "NavigationExecutor")
    }

    // MARK: - UI Action Executors

    private func executeShowToast(_ action: ShowToastAction, eventData: [String: Any]?) async throws {
        let message = try await resolveValueAsString(action.message, eventData: eventData)
        let duration = action.duration ?? 2000
        let position = action.position ?? "bottom"

        logger?.debug("Showing toast: \(message) at \(position) for \(duration)ms", category: "UIExecutor")

        // Note: Actual implementation would show a toast notification
        // Could use a library like SwiftMessages or implement custom toast
    }

    private func executeShowAlert(_ action: ShowAlertAction, eventData: [String: Any]?) async throws {
        let title = try await resolveValueAsString(action.title, eventData: eventData)
        let message = try? await resolveValueAsString(action.message ?? .literal(LiteralValue(kind: "literal", type: "null", value: AnyCodable(NSNull()))), eventData: eventData)

        logger?.debug("Showing alert: \(title)", category: "UIExecutor")

        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)

        for button in action.buttons {
            let alertAction = UIAlertAction(title: button.text, style: buttonStyle(from: button.style)) { [weak self] _ in
                if let buttonAction = button.action {
                    Task {
                        try? await self?.execute(buttonAction, eventData: eventData)
                    }
                }
            }
            alert.addAction(alertAction)
        }

        if alert.actions.isEmpty {
            alert.addAction(UIAlertAction(title: "OK", style: .default))
        }

        await navigationController?.present(alert, animated: true)
    }

    private func executeShowSheet(_ action: ShowSheetAction, eventData: [String: Any]?) async throws {
        logger?.debug("Showing action sheet", category: "UIExecutor")

        let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)

        for option in action.options {
            let alertAction = UIAlertAction(title: option.text, style: .default) { [weak self] _ in
                if let optionAction = option.action {
                    Task {
                        try? await self?.execute(optionAction, eventData: eventData)
                    }
                }
            }
            alert.addAction(alertAction)
        }

        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))

        await navigationController?.present(alert, animated: true)
    }

    private func executeDismissSheet() {
        navigationController?.presentedViewController?.dismiss(animated: true)
        logger?.debug("Dismissed sheet", category: "UIExecutor")
    }

    private var loadingViewController: UIViewController?

    private func executeShowLoading() {
        // Simple loading implementation
        let loadingVC = UIViewController()
        loadingVC.view.backgroundColor = UIColor.black.withAlphaComponent(0.5)
        loadingVC.modalPresentationStyle = .overFullScreen
        loadingVC.modalTransitionStyle = .crossDissolve

        let activityIndicator = UIActivityIndicatorView(style: .large)
        activityIndicator.color = .white
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        loadingVC.view.addSubview(activityIndicator)

        NSLayoutConstraint.activate([
            activityIndicator.centerXAnchor.constraint(equalTo: loadingVC.view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: loadingVC.view.centerYAnchor)
        ])

        activityIndicator.startAnimating()
        loadingViewController = loadingVC

        navigationController?.present(loadingVC, animated: true)
        logger?.debug("Showing loading indicator", category: "UIExecutor")
    }

    private func executeHideLoading() {
        loadingViewController?.dismiss(animated: true)
        loadingViewController = nil
        logger?.debug("Hiding loading indicator", category: "UIExecutor")
    }

    // MARK: - System Action Executors

    private func executeShare(_ action: ShareAction, eventData: [String: Any]?) async throws {
        var items: [Any] = []

        if let text = action.content.text {
            let textValue = try await resolveValueAsString(text, eventData: eventData)
            items.append(textValue)
        }

        if let url = action.content.url {
            let urlString = try await resolveValueAsString(url, eventData: eventData)
            if let shareUrl = URL(string: urlString) {
                items.append(shareUrl)
            }
        }

        logger?.debug("Sharing \(items.count) items", category: "SystemExecutor")

        let activityVC = UIActivityViewController(activityItems: items, applicationActivities: nil)

        if let popoverController = activityVC.popoverPresentationController {
            popoverController.sourceView = navigationController?.view
            popoverController.sourceRect = CGRect(x: UIScreen.main.bounds.width / 2, y: UIScreen.main.bounds.height / 2, width: 0, height: 0)
            popoverController.permittedArrowDirections = []
        }

        await navigationController?.present(activityVC, animated: true)
    }

    private func executeOpenUrl(_ action: OpenUrlAction, eventData: [String: Any]?) async throws {
        let urlString = try await resolveValueAsString(action.url, eventData: eventData)

        guard let url = URL(string: urlString) else {
            logger?.warning("Invalid URL: \(urlString)", category: "SystemExecutor")
            return
        }

        logger?.debug("Opening URL: \(urlString)", category: "SystemExecutor")

        if action.inApp == true {
            // Could use SFSafariViewController for in-app browsing
            logger?.debug("In-app browsing not yet implemented", category: "SystemExecutor")
        } else {
            await UIApplication.shared.open(url)
        }
    }

    private func executeHaptic(_ action: HapticAction) {
        let generator: UIFeedbackGenerator

        switch action.style {
        case "light":
            let impact = UIImpactFeedbackGenerator(style: .light)
            impact.impactOccurred()
            logger?.debug("Haptic: light", category: "SystemExecutor")
        case "medium":
            let impact = UIImpactFeedbackGenerator(style: .medium)
            impact.impactOccurred()
            logger?.debug("Haptic: medium", category: "SystemExecutor")
        case "heavy":
            let impact = UIImpactFeedbackGenerator(style: .heavy)
            impact.impactOccurred()
            logger?.debug("Haptic: heavy", category: "SystemExecutor")
        case "success":
            let notification = UINotificationFeedbackGenerator()
            notification.notificationOccurred(.success)
            logger?.debug("Haptic: success", category: "SystemExecutor")
        case "warning":
            let notification = UINotificationFeedbackGenerator()
            notification.notificationOccurred(.warning)
            logger?.debug("Haptic: warning", category: "SystemExecutor")
        case "error":
            let notification = UINotificationFeedbackGenerator()
            notification.notificationOccurred(.error)
            logger?.debug("Haptic: error", category: "SystemExecutor")
        default:
            let impact = UIImpactFeedbackGenerator(style: .medium)
            impact.impactOccurred()
        }
    }

    // MARK: - Control Flow Executors

    private func executeSequence(_ action: SequenceAction, scenarioId: String, eventData: [String: Any]?) async throws {
        logger?.debug("Executing sequence with \(action.actions.count) actions", category: "ControlFlowExecutor")

        if action.strategy == "parallel" {
            // Execute actions in parallel
            try await withThrowingTaskGroup(of: Void.self) { group in
                for nestedAction in action.actions {
                    group.addTask {
                        try await self.execute(nestedAction, scenarioId: scenarioId, eventData: eventData)
                    }
                }
                try await group.waitForAll()
            }
        } else {
            // Execute actions serially
            for nestedAction in action.actions {
                do {
                    try await execute(nestedAction, scenarioId: scenarioId, eventData: eventData)
                } catch {
                    if action.stopOnError == true {
                        throw error
                    }
                    logger?.warning("Action failed but continuing: \(error)", category: "ControlFlowExecutor")
                }
            }
        }
    }

    private func executeConditional(_ action: ConditionalAction, scenarioId: String, eventData: [String: Any]?) async throws {
        let conditionMet = try await evaluateCondition(action.condition, scenarioId: scenarioId, eventData: eventData)

        logger?.debug("Condition evaluated to: \(conditionMet)", category: "ControlFlowExecutor")

        if conditionMet {
            for thenAction in action.then {
                try await execute(thenAction, scenarioId: scenarioId, eventData: eventData)
            }
        } else if let elseActions = action.else {
            for elseAction in elseActions {
                try await execute(elseAction, scenarioId: scenarioId, eventData: eventData)
            }
        }
    }

    // MARK: - Value Resolution

    private func resolveValue(_ descriptor: ValueDescriptor, scenarioId: String, eventData: [String: Any]?) async throws -> StoreValue {
        switch descriptor {
        case .literal(let literal):
            return literalToStoreValue(literal)

        case .storeValue(let storeRef):
            let store = getStore(from: storeRef.storeRef, scenarioId: scenarioId)
            if let value = await store.get(storeRef.keyPath) {
                return value
            }
            if let defaultValue = storeRef.defaultValue {
                return literalToStoreValue(defaultValue)
            }
            return .null

        case .computed(let computed):
            return try await evaluateComputed(computed, scenarioId: scenarioId, eventData: eventData)

        case .eventData(let eventDataRef):
            if let data = eventData?[eventDataRef.path] {
                return anyToStoreValue(data)
            }
            return .null
        }
    }

    private func resolveValueAsString(_ descriptor: ValueDescriptor, eventData: [String: Any]?) async throws -> String {
        // Simplified version for string resolution
        switch descriptor {
        case .literal(let literal):
            if case let stringValue as String = literal.value.value {
                return stringValue
            }
            return String(describing: literal.value.value)
        default:
            return ""
        }
    }

    private func resolveParams(_ params: [String: ValueDescriptor]?, scenarioId: String, eventData: [String: Any]?) async throws -> [String: Any]? {
        guard let params = params else { return nil }

        var resolved: [String: Any] = [:]
        for (key, descriptor) in params {
            let value = try await resolveValue(descriptor, scenarioId: scenarioId, eventData: eventData)
            resolved[key] = storeValueToAny(value)
        }
        return resolved
    }

    // MARK: - Condition Evaluation

    private func evaluateCondition(_ condition: ConditionDescriptor, scenarioId: String, eventData: [String: Any]?) async throws -> Bool {
        switch condition.type {
        case "equals", "notEquals", "greaterThan", "greaterThanOrEqual", "lessThan", "lessThanOrEqual":
            guard let left = condition.left, let right = condition.right else {
                return false
            }
            let leftValue = try await resolveValue(left, scenarioId: scenarioId, eventData: eventData)
            let rightValue = try await resolveValue(right, scenarioId: scenarioId, eventData: eventData)
            return evaluateComparison(leftValue, condition.type, rightValue)

        case "and":
            guard let conditions = condition.conditions else { return false }
            for cond in conditions {
                if try await !evaluateCondition(cond, scenarioId: scenarioId, eventData: eventData) {
                    return false
                }
            }
            return true

        case "or":
            guard let conditions = condition.conditions else { return false }
            for cond in conditions {
                if try await evaluateCondition(cond, scenarioId: scenarioId, eventData: eventData) {
                    return true
                }
            }
            return false

        case "not":
            guard let conditions = condition.conditions, let first = conditions.first else {
                return false
            }
            return try await !evaluateCondition(first, scenarioId: scenarioId, eventData: eventData)

        default:
            return false
        }
    }

    private func evaluateComparison(_ left: StoreValue, _ op: String, _ right: StoreValue) -> Bool {
        // Simplified comparison logic
        switch op {
        case "equals":
            return left == right
        case "notEquals":
            return left != right
        case "greaterThan":
            if case .integer(let l) = left, case .integer(let r) = right {
                return l > r
            }
            if case .number(let l) = left, case .number(let r) = right {
                return l > r
            }
            return false
        case "greaterThanOrEqual":
            if case .integer(let l) = left, case .integer(let r) = right {
                return l >= r
            }
            if case .number(let l) = left, case .number(let r) = right {
                return l >= r
            }
            return false
        case "lessThan":
            if case .integer(let l) = left, case .integer(let r) = right {
                return l < r
            }
            if case .number(let l) = left, case .number(let r) = right {
                return l < r
            }
            return false
        case "lessThanOrEqual":
            if case .integer(let l) = left, case .integer(let r) = right {
                return l <= r
            }
            if case .number(let l) = left, case .number(let r) = right {
                return l <= r
            }
            return false
        default:
            return false
        }
    }

    private func evaluateComputed(_ computed: ComputedValue, scenarioId: String, eventData: [String: Any]?) async throws -> StoreValue {
        guard computed.operands.count >= 2 else {
            throw ActionExecutionError.invalidOperation("Computed value requires at least 2 operands")
        }

        let left = try await resolveValue(computed.operands[0], scenarioId: scenarioId, eventData: eventData)
        let right = try await resolveValue(computed.operands[1], scenarioId: scenarioId, eventData: eventData)

        switch computed.operation {
        case "add":
            if case .integer(let l) = left, case .integer(let r) = right {
                return .integer(l + r)
            }
            if case .number(let l) = left, case .number(let r) = right {
                return .number(l + r)
            }
        case "subtract":
            if case .integer(let l) = left, case .integer(let r) = right {
                return .integer(l - r)
            }
            if case .number(let l) = left, case .number(let r) = right {
                return .number(l - r)
            }
        case "multiply":
            if case .integer(let l) = left, case .integer(let r) = right {
                return .integer(l * r)
            }
            if case .number(let l) = left, case .number(let r) = right {
                return .number(l * r)
            }
        case "divide":
            if case .integer(let l) = left, case .integer(let r) = right, r != 0 {
                return .number(Double(l) / Double(r))
            }
            if case .number(let l) = left, case .number(let r) = right, r != 0 {
                return .number(l / r)
            }
        case "modulo":
            if case .integer(let l) = left, case .integer(let r) = right, r != 0 {
                return .integer(l % r)
            }
        default:
            break
        }

        return .null
    }

    // MARK: - Helpers

    private func getStore(from ref: StoreReference, scenarioId: String) -> Store {
        let scope = scopeFromString(ref.scope, scenarioId: scenarioId)
        let storage = storageFromString(ref.storage)
        return storeFactory.makeStore(scope: scope, storage: storage)
    }

    private func scopeFromString(_ scope: String, scenarioId: String) -> Scope {
        switch scope.lowercased() {
        case "app": return .app
        case "scenario": return .scenario(id: scenarioId)
        default: return .app
        }
    }

    private func storageFromString(_ storage: String) -> Storage {
        switch storage.lowercased() {
        case "memory": return .memory
        case "userprefs": return .userPrefs(suite: nil)
        case "file":
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let fileURL = documentsPath.appendingPathComponent("store_\(storage).json")
            return .file(url: fileURL)
        case "backend": return .backend(namespace: "default")
        default: return .memory
        }
    }

    private func buttonStyle(from string: String) -> UIAlertAction.Style {
        switch string {
        case "cancel": return .cancel
        case "destructive": return .destructive
        default: return .default
        }
    }

    private func literalToStoreValue(_ literal: LiteralValue) -> StoreValue {
        switch literal.type {
        case "string":
            if case let stringValue as String = literal.value.value {
                return .string(stringValue)
            }
        case "integer":
            if case let intValue as Int = literal.value.value {
                return .integer(intValue)
            }
        case "number":
            if case let doubleValue as Double = literal.value.value {
                return .number(doubleValue)
            }
        case "bool":
            if case let boolValue as Bool = literal.value.value {
                return .bool(boolValue)
            }
        case "null":
            return .null
        case "array":
            if case let arrayValue as [Any] = literal.value.value {
                // Simplified array conversion
                return .array([])
            }
        case "object":
            if case let dictValue as [String: Any] = literal.value.value {
                // Simplified object conversion
                return .object([:])
            }
        default:
            break
        }
        return .null
    }

    private func anyToStoreValue(_ any: Any) -> StoreValue {
        if let string = any as? String {
            return .string(string)
        } else if let int = any as? Int {
            return .integer(int)
        } else if let double = any as? Double {
            return .number(double)
        } else if let bool = any as? Bool {
            return .bool(bool)
        }
        return .null
    }

    private func storeValueToAny(_ value: StoreValue) -> Any {
        switch value {
        case .string(let s): return s
        case .integer(let i): return i
        case .number(let n): return n
        case .bool(let b): return b
        case .array(let a): return a.map { storeValueToAny($0) }
        case .object(let o): return o.mapValues { storeValueToAny($0) }
        case .null: return NSNull()
        default: return NSNull()
        }
    }
}

// MARK: - Errors

public enum ActionExecutionError: Error, LocalizedError {
    case invalidValueType(String)
    case invalidOperation(String)
    case navigationControllerMissing

    public var errorDescription: String? {
        switch self {
        case .invalidValueType(let message):
            return "Invalid value type: \(message)"
        case .invalidOperation(let message):
            return "Invalid operation: \(message)"
        case .navigationControllerMissing:
            return "Navigation controller is required for navigation actions"
        }
    }
}
