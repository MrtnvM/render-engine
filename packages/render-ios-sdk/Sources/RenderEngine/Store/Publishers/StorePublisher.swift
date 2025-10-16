import Foundation
import Combine

/// Publisher that emits values when a specific keyPath changes in the store
final class StorePublisher: Publisher {
    typealias Output = StoreValue?
    typealias Failure = Never

    private let keyPath: String
    private let changeSubject: PassthroughSubject<StoreChange, Never>
    private let getCurrentValue: () -> StoreValue?

    init(
        keyPath: String,
        changeSubject: PassthroughSubject<StoreChange, Never>,
        getCurrentValue: @escaping () -> StoreValue?
    ) {
        self.keyPath = keyPath
        self.changeSubject = changeSubject
        self.getCurrentValue = getCurrentValue
    }

    func receive<S>(subscriber: S) where S: Subscriber, Never == S.Failure, StoreValue? == S.Input {
        let subscription = StoreSubscription(
            subscriber: subscriber,
            keyPath: keyPath,
            changeSubject: changeSubject,
            getCurrentValue: getCurrentValue
        )
        subscriber.receive(subscription: subscription)
    }
}

// MARK: - Subscription

private final class StoreSubscription<S: Subscriber>: Subscription where S.Input == StoreValue?, S.Failure == Never {

    private var subscriber: S?
    private let keyPath: String
    private var cancellable: AnyCancellable?

    init(
        subscriber: S,
        keyPath: String,
        changeSubject: PassthroughSubject<StoreChange, Never>,
        getCurrentValue: @escaping () -> StoreValue?
    ) {
        self.subscriber = subscriber
        self.keyPath = keyPath

        // Subscribe to changes first
        cancellable = changeSubject
            .filter { change in
                // Only emit if this keyPath or a parent keyPath was affected
                change.affectedKeyPaths.contains { affectedPath in
                    KeyPathResolver.areRelated(keyPath, affectedPath)
                }
            }
            .sink { [weak self] change in
                guard let self = self, let subscriber = self.subscriber else { return }
                // Find the patch that affects our keyPath and use its newValue
                // This avoids calling getCurrentValue() which would cause a deadlock
                if let patch = change.patches.first(where: { KeyPathResolver.areRelated(keyPath, $0.keyPath) }) {
                    _ = subscriber.receive(patch.newValue)
                } else {
                    // Fallback: schedule getCurrentValue on a different queue to avoid deadlock
                    DispatchQueue.global().async {
                        let value = getCurrentValue()
                        _ = subscriber.receive(value)
                    }
                }
            }

        // Emit current value immediately AFTER setting up the subscription
        // Use global queue with sync to ensure initial value is emitted before any changes
        let value = DispatchQueue.global().sync {
            return getCurrentValue()
        }
        _ = subscriber.receive(value)
    }

    func request(_ demand: Subscribers.Demand) {
        // We ignore demand for now since we push changes
    }

    func cancel() {
        cancellable?.cancel()
        cancellable = nil
        subscriber = nil
    }
}
