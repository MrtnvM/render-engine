import Foundation

public struct LiveExpression: Equatable {
    public let id: String
    public let outputKeyPath: String
    public let dependsOn: Set<String>
    public let compute: (_ get: (String) -> StoreValue?) -> StoreValue?
    public let policy: LiveExpressionPolicy

    public init(id: String, outputKeyPath: String, dependsOn: Set<String>, compute: @escaping (_ get: (String) -> StoreValue?) -> StoreValue?, policy: LiveExpressionPolicy = .writeIfChanged) {
        self.id = id
        self.outputKeyPath = outputKeyPath
        self.dependsOn = dependsOn
        self.compute = compute
        self.policy = policy
    }
}

public enum LiveExpressionPolicy {
    case writeIfChanged
    case alwaysWrite
}

