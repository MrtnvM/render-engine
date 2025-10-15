import Testing
import Foundation
@testable import RenderEngine

@Suite("SemanticVersion Tests")
struct SemanticVersionTests {

    @Test("Parse version from string")
    func testParseVersion() {
        let version = SemanticVersion(string: "1.2.3")

        #expect(version?.major == 1)
        #expect(version?.minor == 2)
        #expect(version?.patch == 3)
    }

    @Test("Parse invalid version returns nil")
    func testParseInvalidVersion() {
        let version = SemanticVersion(string: "invalid")

        #expect(version == nil)
    }

    @Test("Version string representation")
    func testVersionString() {
        let version = SemanticVersion(major: 1, minor: 2, patch: 3)

        #expect(version.versionString == "1.2.3")
    }

    @Test("Version comparison - less than")
    func testVersionLessThan() {
        let v1 = SemanticVersion(major: 1, minor: 0, patch: 0)
        let v2 = SemanticVersion(major: 2, minor: 0, patch: 0)

        #expect(v1 < v2)
        #expect(v2 > v1)
    }

    @Test("Version comparison - equal")
    func testVersionEqual() {
        let v1 = SemanticVersion(major: 1, minor: 2, patch: 3)
        let v2 = SemanticVersion(major: 1, minor: 2, patch: 3)

        #expect(v1 == v2)
    }

    @Test("Version major difference detection")
    func testMajorDifference() {
        let v1 = SemanticVersion(major: 1, minor: 0, patch: 0)
        let v2 = SemanticVersion(major: 2, minor: 0, patch: 0)
        let v3 = SemanticVersion(major: 1, minor: 5, patch: 0)

        #expect(v1.hasDifferentMajor(from: v2) == true)
        #expect(v1.hasDifferentMajor(from: v3) == false)
    }

    @Test("Version comparison - minor versions")
    func testMinorVersionComparison() {
        let v1 = SemanticVersion(major: 1, minor: 0, patch: 0)
        let v2 = SemanticVersion(major: 1, minor: 5, patch: 0)

        #expect(v1 < v2)
    }

    @Test("Version comparison - patch versions")
    func testPatchVersionComparison() {
        let v1 = SemanticVersion(major: 1, minor: 0, patch: 0)
        let v2 = SemanticVersion(major: 1, minor: 0, patch: 5)

        #expect(v1 < v2)
    }
}
