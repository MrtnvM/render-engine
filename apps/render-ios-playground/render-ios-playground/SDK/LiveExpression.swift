import Foundation

/// A live expression that automatically recomputes when its dependencies change
public struct LiveExpression: Equatable {
    public let id: String
    public let outputKeyPath: String
    public let dependsOn: Set<String>
    public let compute: (_ get: (String) -> StoreValue?) -> StoreValue?
    public let policy: LiveExpressionPolicy

    public init(
        id: String,
        outputKeyPath: String,
        dependsOn: Set<String>,
        compute: @escaping (_ get: (String) -> StoreValue?) -> StoreValue?,
        policy: LiveExpressionPolicy = .writeIfChanged
    ) {
        self.id = id
        self.outputKeyPath = outputKeyPath
        self.dependsOn = dependsOn
        self.compute = compute
        self.policy = policy
    }
}

/// Policy for when to write computed values back to the store
public enum LiveExpressionPolicy: Equatable {
    case writeIfChanged  // Only write if the computed value is different from current value
    case alwaysWrite     // Always write the computed value
}