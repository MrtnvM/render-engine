import Foundation
import Combine

/// Protocol for components that can bind to store data
public protocol StoreBindable: AnyObject {
    var storeBindings: [String: AnyCancellable] { get set }

    func bindStoreValue<T: Decodable>(
        _ keyPath: String,
        to keyPath: ReferenceWritableKeyPath<Self, T?>,
        in store: Store
    ) -> AnyCancellable

    func bindStoreValue<T: Decodable>(
        _ keyPath: String,
        to keyPath: ReferenceWritableKeyPath<Self, T>,
        in store: Store,
        defaultValue: T
    ) -> AnyCancellable
}

/// Helper class for managing component-store bindings
public class ComponentStore: StoreBindable {
    public var storeBindings: [String: AnyCancellable] = [:]

    private weak var owner: AnyObject?

    public init(owner: AnyObject) {
        self.owner = owner
    }

    public func bindStoreValue<T: Decodable>(
        _ storeKeyPath: String,
        to componentKeyPath: ReferenceWritableKeyPath<Self, T?>,
        in store: Store
    ) -> AnyCancellable {
        let cancellable = store.publisher(for: storeKeyPath)
            .tryMap { storeValue -> T? in
                guard let storeValue = storeValue else { return nil }
                let data = try JSONEncoder().encode(storeValue)
                return try JSONDecoder().decode(T.self, from: data)
            }
            .replaceError(with: nil)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] value in
                self?[keyPath: componentKeyPath] = value
            }

        storeBindings[storeKeyPath] = cancellable
        return cancellable
    }

    public func bindStoreValue<T: Decodable>(
        _ storeKeyPath: String,
        to componentKeyPath: ReferenceWritableKeyPath<Self, T>,
        in store: Store,
        defaultValue: T
    ) -> AnyCancellable {
        let cancellable = store.publisher(for: storeKeyPath)
            .tryMap { storeValue -> T in
                guard let storeValue = storeValue else { return defaultValue }
                let data = try JSONEncoder().encode(storeValue)
                return try JSONDecoder().decode(T.self, from: data)
            }
            .replaceError(with: defaultValue)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] value in
                self?[keyPath: componentKeyPath] = value
            }

        storeBindings[storeKeyPath] = cancellable
        return cancellable
    }

    /// Unbind a specific store key path
    public func unbind(_ storeKeyPath: String) {
        storeBindings[storeKeyPath]?.cancel()
        storeBindings.removeValue(forKey: storeKeyPath)
    }

    /// Unbind all store bindings
    public func unbindAll() {
        for cancellable in storeBindings.values {
            cancellable.cancel()
        }
        storeBindings.removeAll()
    }

    deinit {
        unbindAll()
    }
}

/// Extension to make any NSObject conform to StoreBindable
public extension StoreBindable where Self: NSObject {
    var componentStore: ComponentStore {
        if let store = objc_getAssociatedObject(self, &AssociatedKeys.componentStore) as? ComponentStore {
            return store
        }

        let store = ComponentStore(owner: self)
        objc_setAssociatedObject(self, &AssociatedKeys.componentStore, store, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        return store
    }
}

private struct AssociatedKeys {
    static var componentStore = "componentStore"
}