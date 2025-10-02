/**
 * SemanticVersion Value Object Tests
 */

import { describe, it, expect } from 'vitest'
import { SemanticVersion } from '../../value-objects/semantic-version.value-object.js'
import { ValidationError, FormatError } from '../../errors/index.js'

describe('SemanticVersion', () => {
  describe('Factory Methods', () => {
    describe('create()', () => {
      it('should create a valid semantic version', () => {
        const version = SemanticVersion.create(1, 2, 3)

        expect(version.major).toBe(1)
        expect(version.minor).toBe(2)
        expect(version.patch).toBe(3)
      })

      it('should create version with zero values', () => {
        const version = SemanticVersion.create(0, 0, 0)

        expect(version.major).toBe(0)
        expect(version.minor).toBe(0)
        expect(version.patch).toBe(0)
      })

      it('should throw ValidationError for negative major version', () => {
        expect(() => SemanticVersion.create(-1, 0, 0)).toThrow(ValidationError as any)
        expect(() => SemanticVersion.create(-1, 0, 0)).toThrow(
          "Field 'major' failed validation: must be a non-negative integer",
        )
      })

      it('should throw ValidationError for negative minor version', () => {
        expect(() => SemanticVersion.create(1, -1, 0)).toThrow(ValidationError as any)
        expect(() => SemanticVersion.create(1, -1, 0)).toThrow(
          "Field 'minor' failed validation: must be a non-negative integer",
        )
      })

      it('should throw ValidationError for negative patch version', () => {
        expect(() => SemanticVersion.create(1, 0, -1)).toThrow(ValidationError as any)
        expect(() => SemanticVersion.create(1, 0, -1)).toThrow(
          "Field 'patch' failed validation: must be a non-negative integer",
        )
      })

      it('should throw ValidationError for non-integer major version', () => {
        expect(() => SemanticVersion.create(1.5, 0, 0)).toThrow(ValidationError as any)
        expect(() => SemanticVersion.create(1.5, 0, 0)).toThrow(
          "Field 'major' failed validation: must be a non-negative integer",
        )
      })

      it('should throw ValidationError for non-integer minor version', () => {
        expect(() => SemanticVersion.create(1, 2.5, 0)).toThrow(ValidationError as any)
        expect(() => SemanticVersion.create(1, 2.5, 0)).toThrow(
          "Field 'minor' failed validation: must be a non-negative integer",
        )
      })

      it('should throw ValidationError for non-integer patch version', () => {
        expect(() => SemanticVersion.create(1, 2, 3.5)).toThrow(ValidationError as any)
        expect(() => SemanticVersion.create(1, 2, 3.5)).toThrow(
          "Field 'patch' failed validation: must be a non-negative integer",
        )
      })
    })

    describe('fromString()', () => {
      it('should parse valid version string', () => {
        const version = SemanticVersion.fromString('1.2.3')

        expect(version.major).toBe(1)
        expect(version.minor).toBe(2)
        expect(version.patch).toBe(3)
      })

      it('should parse version string with zeros', () => {
        const version = SemanticVersion.fromString('0.0.0')

        expect(version.major).toBe(0)
        expect(version.minor).toBe(0)
        expect(version.patch).toBe(0)
      })

      it('should parse version string with large numbers', () => {
        const version = SemanticVersion.fromString('999.888.777')

        expect(version.major).toBe(999)
        expect(version.minor).toBe(888)
        expect(version.patch).toBe(777)
      })

      it('should throw FormatError for invalid format - missing patch', () => {
        expect(() => SemanticVersion.fromString('1.2')).toThrow(FormatError as any)
        expect(() => SemanticVersion.fromString('1.2')).toThrow(
          "Field 'versionString' has invalid format. Expected: major.minor.patch, Got: 1.2",
        )
      })

      it('should throw FormatError for invalid format - too many parts', () => {
        expect(() => SemanticVersion.fromString('1.2.3.4')).toThrow(FormatError as any)
        expect(() => SemanticVersion.fromString('1.2.3.4')).toThrow(
          "Field 'versionString' has invalid format. Expected: major.minor.patch, Got: 1.2.3.4",
        )
      })

      it('should throw FormatError for non-numeric parts', () => {
        expect(() => SemanticVersion.fromString('1.a.3')).toThrow(FormatError as any)
        expect(() => SemanticVersion.fromString('1.a.3')).toThrow(
          "Field 'versionString' has invalid format. Expected: major.minor.patch, Got: 1.a.3",
        )
      })

      it('should throw FormatError for empty string', () => {
        expect(() => SemanticVersion.fromString('')).toThrow(FormatError as any)
        expect(() => SemanticVersion.fromString('')).toThrow(
          "Field 'versionString' has invalid format. Expected: major.minor.patch, Got: ",
        )
      })

      it('should throw FormatError for version with spaces', () => {
        expect(() => SemanticVersion.fromString('1. 2.3')).toThrow(FormatError as any)
        expect(() => SemanticVersion.fromString('1. 2.3')).toThrow(
          "Field 'versionString' has invalid format. Expected: major.minor.patch, Got: 1. 2.3",
        )
      })
    })

    describe('initial()', () => {
      it('should create initial version 0.0.1', () => {
        const version = SemanticVersion.initial()

        expect(version.major).toBe(0)
        expect(version.minor).toBe(0)
        expect(version.patch).toBe(1)
      })
    })
  })

  describe('Increment Operations', () => {
    describe('incrementMajor()', () => {
      it('should increment major and reset minor and patch to 0', () => {
        const version = SemanticVersion.create(1, 2, 3)
        const incremented = version.incrementMajor()

        expect(incremented.major).toBe(2)
        expect(incremented.minor).toBe(0)
        expect(incremented.patch).toBe(0)
      })

      it('should maintain immutability', () => {
        const version = SemanticVersion.create(1, 2, 3)
        const incremented = version.incrementMajor()

        expect(version.major).toBe(1)
        expect(version.minor).toBe(2)
        expect(version.patch).toBe(3)
        expect(incremented).not.toBe(version)
      })
    })

    describe('incrementMinor()', () => {
      it('should increment minor and reset patch to 0', () => {
        const version = SemanticVersion.create(1, 2, 3)
        const incremented = version.incrementMinor()

        expect(incremented.major).toBe(1)
        expect(incremented.minor).toBe(3)
        expect(incremented.patch).toBe(0)
      })

      it('should maintain immutability', () => {
        const version = SemanticVersion.create(1, 2, 3)
        const incremented = version.incrementMinor()

        expect(version.major).toBe(1)
        expect(version.minor).toBe(2)
        expect(version.patch).toBe(3)
        expect(incremented).not.toBe(version)
      })
    })

    describe('incrementPatch()', () => {
      it('should increment patch only', () => {
        const version = SemanticVersion.create(1, 2, 3)
        const incremented = version.incrementPatch()

        expect(incremented.major).toBe(1)
        expect(incremented.minor).toBe(2)
        expect(incremented.patch).toBe(4)
      })

      it('should maintain immutability', () => {
        const version = SemanticVersion.create(1, 2, 3)
        const incremented = version.incrementPatch()

        expect(version.major).toBe(1)
        expect(version.minor).toBe(2)
        expect(version.patch).toBe(3)
        expect(incremented).not.toBe(version)
      })
    })
  })

  describe('Comparison Operations', () => {
    describe('compareTo()', () => {
      it('should return 0 for equal versions', () => {
        const version1 = SemanticVersion.create(1, 2, 3)
        const version2 = SemanticVersion.create(1, 2, 3)

        expect(version1.compareTo(version2)).toBe(0)
      })

      it('should return -1 when this version is less than other', () => {
        const version1 = SemanticVersion.create(1, 2, 3)
        const version2 = SemanticVersion.create(2, 0, 0)

        expect(version1.compareTo(version2)).toBe(-1)
      })

      it('should return 1 when this version is greater than other', () => {
        const version1 = SemanticVersion.create(2, 0, 0)
        const version2 = SemanticVersion.create(1, 2, 3)

        expect(version1.compareTo(version2)).toBe(1)
      })

      it('should compare by major version first', () => {
        const version1 = SemanticVersion.create(1, 9, 9)
        const version2 = SemanticVersion.create(2, 0, 0)

        expect(version1.compareTo(version2)).toBe(-1)
      })

      it('should compare by minor version when major is equal', () => {
        const version1 = SemanticVersion.create(1, 1, 9)
        const version2 = SemanticVersion.create(1, 2, 0)

        expect(version1.compareTo(version2)).toBe(-1)
      })

      it('should compare by patch version when major and minor are equal', () => {
        const version1 = SemanticVersion.create(1, 2, 1)
        const version2 = SemanticVersion.create(1, 2, 2)

        expect(version1.compareTo(version2)).toBe(-1)
      })
    })

    describe('isGreaterThan()', () => {
      it('should return true when this version is greater', () => {
        const version1 = SemanticVersion.create(2, 0, 0)
        const version2 = SemanticVersion.create(1, 9, 9)

        expect(version1.isGreaterThan(version2)).toBe(true)
      })

      it('should return false when this version is less', () => {
        const version1 = SemanticVersion.create(1, 0, 0)
        const version2 = SemanticVersion.create(2, 0, 0)

        expect(version1.isGreaterThan(version2)).toBe(false)
      })

      it('should return false when versions are equal', () => {
        const version1 = SemanticVersion.create(1, 2, 3)
        const version2 = SemanticVersion.create(1, 2, 3)

        expect(version1.isGreaterThan(version2)).toBe(false)
      })
    })

    describe('isLessThan()', () => {
      it('should return true when this version is less', () => {
        const version1 = SemanticVersion.create(1, 0, 0)
        const version2 = SemanticVersion.create(2, 0, 0)

        expect(version1.isLessThan(version2)).toBe(true)
      })

      it('should return false when this version is greater', () => {
        const version1 = SemanticVersion.create(2, 0, 0)
        const version2 = SemanticVersion.create(1, 9, 9)

        expect(version1.isLessThan(version2)).toBe(false)
      })

      it('should return false when versions are equal', () => {
        const version1 = SemanticVersion.create(1, 2, 3)
        const version2 = SemanticVersion.create(1, 2, 3)

        expect(version1.isLessThan(version2)).toBe(false)
      })
    })

    describe('isCompatibleWith()', () => {
      it('should return true for same major version', () => {
        const version1 = SemanticVersion.create(1, 2, 3)
        const version2 = SemanticVersion.create(1, 5, 7)

        expect(version1.isCompatibleWith(version2)).toBe(true)
      })

      it('should return false for different major versions', () => {
        const version1 = SemanticVersion.create(1, 2, 3)
        const version2 = SemanticVersion.create(2, 0, 0)

        expect(version1.isCompatibleWith(version2)).toBe(false)
      })

      it('should return true for same version', () => {
        const version1 = SemanticVersion.create(1, 2, 3)
        const version2 = SemanticVersion.create(1, 2, 3)

        expect(version1.isCompatibleWith(version2)).toBe(true)
      })
    })
  })

  describe('Equality and Serialization', () => {
    describe('equals()', () => {
      it('should return true for equal versions', () => {
        const version1 = SemanticVersion.create(1, 2, 3)
        const version2 = SemanticVersion.create(1, 2, 3)

        expect(version1.equals(version2)).toBe(true)
      })

      it('should return false for different versions', () => {
        const version1 = SemanticVersion.create(1, 2, 3)
        const version2 = SemanticVersion.create(1, 2, 4)

        expect(version1.equals(version2)).toBe(false)
      })

      it('should return false for non-SemanticVersion objects', () => {
        const version = SemanticVersion.create(1, 2, 3)
        const notVersion = { major: 1, minor: 2, patch: 3 }

        expect(version.equals(notVersion as any)).toBe(false)
      })

      it('should return false for null', () => {
        const version = SemanticVersion.create(1, 2, 3)

        expect(version.equals(null as any)).toBe(false)
      })

      it('should return false for undefined', () => {
        const version = SemanticVersion.create(1, 2, 3)

        expect(version.equals(undefined as any)).toBe(false)
      })
    })

    describe('toString()', () => {
      it('should return version string in major.minor.patch format', () => {
        const version = SemanticVersion.create(1, 2, 3)

        expect(version.toString()).toBe('1.2.3')
      })

      it('should handle zero versions', () => {
        const version = SemanticVersion.create(0, 0, 0)

        expect(version.toString()).toBe('0.0.0')
      })

      it('should handle large version numbers', () => {
        const version = SemanticVersion.create(999, 888, 777)

        expect(version.toString()).toBe('999.888.777')
      })
    })

    describe('toJSON()', () => {
      it('should return object with major, minor, and patch properties', () => {
        const version = SemanticVersion.create(1, 2, 3)
        const json = version.toJSON()

        expect(json).toEqual({
          major: 1,
          minor: 2,
          patch: 3,
        })
      })

      it('should be JSON serializable', () => {
        const version = SemanticVersion.create(1, 2, 3)
        const jsonString = JSON.stringify(version)
        const parsed = JSON.parse(jsonString)

        expect(parsed).toEqual({
          major: 1,
          minor: 2,
          patch: 3,
        })
      })
    })
  })

  describe('Property Getters', () => {
    it('should provide access to major version', () => {
      const version = SemanticVersion.create(5, 2, 3)

      expect(version.major).toBe(5)
    })

    it('should provide access to minor version', () => {
      const version = SemanticVersion.create(1, 7, 3)

      expect(version.minor).toBe(7)
    })

    it('should provide access to patch version', () => {
      const version = SemanticVersion.create(1, 2, 9)

      expect(version.patch).toBe(9)
    })
  })

  describe('Integration Tests', () => {
    it('should work with complex version operations', () => {
      // Start with initial version
      let version = SemanticVersion.initial() // 0.0.1

      // Add some patches
      version = version.incrementPatch() // 0.0.2
      version = version.incrementPatch() // 0.0.3

      // Add minor feature
      version = version.incrementMinor() // 0.1.0

      // Add major breaking change
      version = version.incrementMajor() // 1.0.0

      expect(version.toString()).toBe('1.0.0')
      expect(version.major).toBe(1)
      expect(version.minor).toBe(0)
      expect(version.patch).toBe(0)
    })

    it('should maintain version comparison consistency', () => {
      const versions = [
        SemanticVersion.create(0, 0, 1),
        SemanticVersion.create(0, 1, 0),
        SemanticVersion.create(1, 0, 0),
        SemanticVersion.create(1, 0, 1),
        SemanticVersion.create(1, 1, 0),
        SemanticVersion.create(2, 0, 0),
      ]

      // Check that versions are in ascending order
      for (let i = 0; i < versions.length - 1; i++) {
        expect(versions[i].isLessThan(versions[i + 1])).toBe(true)
        expect(versions[i + 1].isGreaterThan(versions[i])).toBe(true)
      }
    })

    it('should handle roundtrip string conversion', () => {
      const original = SemanticVersion.create(1, 2, 3)
      const versionString = original.toString()
      const parsed = SemanticVersion.fromString(versionString)

      expect(original.equals(parsed)).toBe(true)
      expect(parsed.toString()).toBe(versionString)
    })
  })
})
