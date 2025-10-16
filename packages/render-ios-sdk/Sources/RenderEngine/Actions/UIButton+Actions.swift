import UIKit
import ObjectiveC

/// Extension to add action execution support to UIButton
extension UIButton {

    // MARK: - Associated Objects

    private static var actionContextKey = "com.renderengine.actionContext"

    private struct ActionContext {
        let actionId: String
        let rendererContext: RendererContext
        let scenarioId: String
    }

    // MARK: - Public API

    /// Configure button to execute an action when pressed
    public func onPressAction(
        actionId: String,
        in context: RendererContext,
        scenarioId: String = "default"
    ) {
        // Store action context
        let actionContext = ActionContext(
            actionId: actionId,
            rendererContext: context,
            scenarioId: scenarioId
        )
        objc_setAssociatedObject(
            self,
            &Self.actionContextKey,
            actionContext,
            .OBJC_ASSOCIATION_RETAIN
        )

        // Add target for touch event
        addTarget(self, action: #selector(handleActionPress), for: .touchUpInside)
    }

    // MARK: - Private Implementation

    @objc private func handleActionPress() {
        guard let actionContext = objc_getAssociatedObject(
            self,
            &Self.actionContextKey
        ) as? ActionContext else {
            print("⚠️ No action context found for button")
            return
        }

        Task {
            do {
                try await actionContext.rendererContext.executeAction(
                    id: actionContext.actionId,
                    scenarioId: actionContext.scenarioId
                )
            } catch {
                print("❌ Failed to execute action \(actionContext.actionId): \(error)")
            }
        }
    }
}

// MARK: - Button Component Support

extension RenderableButton {

    /// Setup action handler from component data
    func setupActionHandler() {
        // Check if component has onPress action ID
        guard let actionId = component.data.getString(forKey: "onPress") else {
            return
        }

        // Get scenario ID from context if available
        let scenarioId = context.scenario?.key ?? "default"

        // Configure button to execute action
        onPressAction(actionId: actionId, in: context, scenarioId: scenarioId)
    }
}
