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

        // Emit current value immediately
        _ = subscriber.receive(getCurrentValue())

        // Subscribe to changes
        cancellable = changeSubject
            .filter { change in
                // Only emit if this keyPath or a parent keyPath was affected
                change.affectedKeyPaths.contains { affectedPath in
                    KeyPathResolver.areRelated(keyPath, affectedPath)
                }
            }
            .sink { [weak self] _ in
                guard let self = self, let subscriber = self.subscriber else { return }
                _ = subscriber.receive(getCurrentValue())
            }
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
