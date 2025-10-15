import UIKit
import Combine

/// Manages Store subscriptions for UI components
/// Binds component lifecycle to store observation
final class StoreSubscriptionManager {

    /// Subscribe a view to a store keyPath
    /// The subscription is automatically cancelled when the view is deallocated
    static func subscribe(
        view: UIView,
        store: Store,
        keyPath: String,
        onChange: @escaping (StoreValue?) -> Void
    ) {
        let subscription = store.publisher(for: keyPath)
            .sink { value in
                onChange(value)
            }

        // Store cancellable in associated object
        addCancellable(subscription, to: view)
    }

    /// Subscribe a view to multiple store keyPaths
    static func subscribe(
        view: UIView,
        store: Store,
        keyPaths: Set<String>,
        onChange: @escaping ([String: StoreValue?]) -> Void
    ) {
        let subscription = store.publisher(for: keyPaths)
            .sink { values in
                onChange(values)
            }

        // Store cancellable in associated object
        addCancellable(subscription, to: view)
    }

    /// Unsubscribe all store subscriptions for a view
    static func unsubscribeAll(from view: UIView) {
        objc_setAssociatedObject(view, &AssociatedKeys.cancellables, nil, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
    }

    // MARK: - Private Helpers

    private static func addCancellable(_ cancellable: AnyCancellable, to view: UIView) {
        var cancellables = getCancellables(for: view)
        cancellables.append(cancellable)
        objc_setAssociatedObject(
            view,
            &AssociatedKeys.cancellables,
            cancellables,
            .OBJC_ASSOCIATION_RETAIN_NONATOMIC
        )
    }

    private static func getCancellables(for view: UIView) -> [AnyCancellable] {
        return objc_getAssociatedObject(view, &AssociatedKeys.cancellables) as? [AnyCancellable] ?? []
    }
}

// MARK: - Associated Object Keys

private struct AssociatedKeys {
    nonisolated(unsafe) static var cancellables = "com.renderengine.store.cancellables"
}
