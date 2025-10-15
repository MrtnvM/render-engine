import UIKit
import Combine

/// Convenience extension for binding UIView to Store keyPaths
extension UIView {

    /// Bind this view to a store keyPath
    /// The binding is automatically cancelled when the view is deallocated
    public func bind(
        to keyPath: String,
        in store: Store,
        onChange: @escaping (StoreValue?) -> Void
    ) {
        StoreSubscriptionManager.subscribe(
            view: self,
            store: store,
            keyPath: keyPath,
            onChange: onChange
        )
    }

    /// Bind this view to multiple store keyPaths
    public func bind(
        to keyPaths: Set<String>,
        in store: Store,
        onChange: @escaping ([String: StoreValue?]) -> Void
    ) {
        StoreSubscriptionManager.subscribe(
            view: self,
            store: store,
            keyPaths: keyPaths,
            onChange: onChange
        )
    }

    /// Unbind all store subscriptions from this view
    public func unbindAll() {
        StoreSubscriptionManager.unsubscribeAll(from: self)
    }
}
