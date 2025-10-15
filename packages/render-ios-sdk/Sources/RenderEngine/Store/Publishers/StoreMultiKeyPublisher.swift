import Foundation
import Combine

/// Publisher that emits when any of the specified keyPaths change
/// Returns a dictionary of keyPath -> value
final class StoreMultiKeyPublisher: Publisher {
    typealias Output = [String: StoreValue?]
    typealias Failure = Never

    private let keyPaths: Set<String>
    private let changeSubject: PassthroughSubject<StoreChange, Never>
    private let getCurrentValues: () -> [String: StoreValue?]

    init(
        keyPaths: Set<String>,
        changeSubject: PassthroughSubject<StoreChange, Never>,
        getCurrentValues: @escaping () -> [String: StoreValue?]
    ) {
        self.keyPaths = keyPaths
        self.changeSubject = changeSubject
        self.getCurrentValues = getCurrentValues
    }

    func receive<S>(subscriber: S) where S: Subscriber, Never == S.Failure, [String: StoreValue?] == S.Input {
        let subscription = StoreMultiKeySubscription(
            subscriber: subscriber,
            keyPaths: keyPaths,
            changeSubject: changeSubject,
            getCurrentValues: getCurrentValues
        )
        subscriber.receive(subscription: subscription)
    }
}

// MARK: - Subscription

private final class StoreMultiKeySubscription<S: Subscriber>: Subscription
    where S.Input == [String: StoreValue?], S.Failure == Never {

    private var subscriber: S?
    private let keyPaths: Set<String>
    private var cancellable: AnyCancellable?

    init(
        subscriber: S,
        keyPaths: Set<String>,
        changeSubject: PassthroughSubject<StoreChange, Never>,
        getCurrentValues: @escaping () -> [String: StoreValue?]
    ) {
        self.subscriber = subscriber
        self.keyPaths = keyPaths

        // Emit current values immediately
        _ = subscriber.receive(getCurrentValues())

        // Subscribe to changes
        cancellable = changeSubject
            .filter { change in
                // Emit if any of our tracked keyPaths were affected
                change.affectedKeyPaths.contains { affectedPath in
                    keyPaths.contains { trackedPath in
                        KeyPathResolver.areRelated(trackedPath, affectedPath)
                    }
                }
            }
            .sink { [weak self] _ in
                guard let self = self, let subscriber = self.subscriber else { return }
                _ = subscriber.receive(getCurrentValues())
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
