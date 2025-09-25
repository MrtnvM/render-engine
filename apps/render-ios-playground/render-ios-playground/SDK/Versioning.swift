import Foundation

public struct SemanticVersion: Equatable, Codable {
    public let major: Int
    public let minor: Int
    public let patch: Int

    public init(major: Int, minor: Int, patch: Int) {
        self.major = major
        self.minor = minor
        self.patch = patch
    }

    public init?(string: String) {
        let parts = string.split(separator: ".").compactMap { Int($0) }
        guard parts.count >= 1 else { return nil }
        self.major = parts[0]
        self.minor = parts.count > 1 ? parts[1] : 0
        self.patch = parts.count > 2 ? parts[2] : 0
    }
}

