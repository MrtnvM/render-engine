import Foundation

/// Semantic version representation for Store versioning
/// Used to determine when to drop and reset store data
public struct SemanticVersion: Equatable, Hashable, Codable, Sendable {

    public let major: Int
    public let minor: Int
    public let patch: Int

    public init(major: Int, minor: Int, patch: Int) {
        self.major = major
        self.minor = minor
        self.patch = patch
    }

    /// Parse version from string (e.g., "1.2.3")
    public init?(string: String) {
        let components = string.split(separator: ".").compactMap { Int($0) }
        guard components.count == 3 else { return nil }

        self.major = components[0]
        self.minor = components[1]
        self.patch = components[2]
    }

    /// String representation (e.g., "1.2.3")
    public var versionString: String {
        "\(major).\(minor).\(patch)"
    }

    /// Check if this version has a different major version than another
    /// Major version bumps trigger data reset per spec
    public func hasDifferentMajor(from other: SemanticVersion) -> Bool {
        self.major != other.major
    }

    /// Compare versions
    public static func < (lhs: SemanticVersion, rhs: SemanticVersion) -> Bool {
        if lhs.major != rhs.major {
            return lhs.major < rhs.major
        }
        if lhs.minor != rhs.minor {
            return lhs.minor < rhs.minor
        }
        return lhs.patch < rhs.patch
    }

    public static func > (lhs: SemanticVersion, rhs: SemanticVersion) -> Bool {
        rhs < lhs
    }

    public static func <= (lhs: SemanticVersion, rhs: SemanticVersion) -> Bool {
        lhs == rhs || lhs < rhs
    }

    public static func >= (lhs: SemanticVersion, rhs: SemanticVersion) -> Bool {
        lhs == rhs || lhs > rhs
    }
}

// MARK: - CustomStringConvertible

extension SemanticVersion: CustomStringConvertible {
    public var description: String {
        versionString
    }
}

// MARK: - Comparable

extension SemanticVersion: Comparable {}
