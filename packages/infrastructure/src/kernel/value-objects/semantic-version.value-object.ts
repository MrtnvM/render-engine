/**
 * SemanticVersion Value Object
 *
 * Semantic version following the semver specification (major.minor.patch).
 * Provides type-safe version management for domain objects with comparison and increment operations.
 */

export class SemanticVersion {
  private constructor(
    private readonly majorVersion: number,
    private readonly minorVersion: number,
    private readonly patchVersion: number,
  ) {}

  /**
   * Create a new SemanticVersion instance
   * @param major Major version number (breaking changes)
   * @param minor Minor version number (new features, backward compatible)
   * @param patch Patch version number (bug fixes, backward compatible)
   * @throws Error if any version number is invalid
   * @returns New SemanticVersion instance
   */
  static create(major: number, minor: number, patch: number): SemanticVersion {
    // Business Rule: All version numbers must be non-negative integers
    if (!Number.isInteger(major) || major < 0) {
      throw new Error(`Major version must be a non-negative integer, got ${major}`)
    }
    if (!Number.isInteger(minor) || minor < 0) {
      throw new Error(`Minor version must be a non-negative integer, got ${minor}`)
    }
    if (!Number.isInteger(patch) || patch < 0) {
      throw new Error(`Patch version must be a non-negative integer, got ${patch}`)
    }

    return new SemanticVersion(major, minor, patch)
  }

  /**
   * Create a SemanticVersion from a version string
   * @param versionString Version string in format "major.minor.patch"
   * @throws Error if version numbers are invalid or format is wrong
   * @returns New SemanticVersion instance
   */
  static fromString(versionString: string): SemanticVersion {
    // Business Rule: Must be in format "major.minor.patch"
    const versionRegex = /^(\d+)\.(\d+)\.(\d+)$/
    const match = versionString.match(versionRegex)

    if (!match) {
      throw new Error(`Invalid version format: ${versionString}. Expected format: major.minor.patch`)
    }

    const major = Number.parseInt(match[1], 10)
    const minor = Number.parseInt(match[2], 10)
    const patch = Number.parseInt(match[3], 10)

    return SemanticVersion.create(major, minor, patch)
  }

  /**
   * Create initial version 0.0.1
   * @returns New SemanticVersion instance with version 0.0.1
   */
  static initial(): SemanticVersion {
    return SemanticVersion.create(0, 0, 1)
  }

  /**
   * Get major version number
   */
  get major(): number {
    return this.majorVersion
  }

  /**
   * Get minor version number
   */
  get minor(): number {
    return this.minorVersion
  }

  /**
   * Get patch version number
   */
  get patch(): number {
    return this.patchVersion
  }

  /**
   * Increment major version and reset minor and patch to 0
   * @returns New SemanticVersion instance with incremented major version
   */
  incrementMajor(): SemanticVersion {
    return SemanticVersion.create(this.majorVersion + 1, 0, 0)
  }

  /**
   * Increment minor version and reset patch to 0
   * @returns New SemanticVersion instance with incremented minor version
   */
  incrementMinor(): SemanticVersion {
    return SemanticVersion.create(this.majorVersion, this.minorVersion + 1, 0)
  }

  /**
   * Increment patch version
   * @returns New SemanticVersion instance with incremented patch version
   */
  incrementPatch(): SemanticVersion {
    return SemanticVersion.create(this.majorVersion, this.minorVersion, this.patchVersion + 1)
  }

  /**
   * Compare this version with another version
   * @param other Version to compare against
   * @returns -1 if this < other, 0 if equal, 1 if this > other
   */
  compareTo(other: SemanticVersion): -1 | 0 | 1 {
    // Business Rule: Versions compared by major first, then minor, then patch
    if (this.majorVersion !== other.majorVersion) {
      return this.majorVersion < other.majorVersion ? -1 : 1
    }

    if (this.minorVersion !== other.minorVersion) {
      return this.minorVersion < other.minorVersion ? -1 : 1
    }

    if (this.patchVersion !== other.patchVersion) {
      return this.patchVersion < other.patchVersion ? -1 : 1
    }

    return 0
  }

  /**
   * Check if this version is greater than another version
   * @param other Version to compare against
   * @returns true if this version is greater than other
   */
  isGreaterThan(other: SemanticVersion): boolean {
    return this.compareTo(other) === 1
  }

  /**
   * Check if this version is less than another version
   * @param other Version to compare against
   * @returns true if this version is less than other
   */
  isLessThan(other: SemanticVersion): boolean {
    return this.compareTo(other) === -1
  }

  /**
   * Check if this version is compatible with another version
   * @param other Version to check compatibility against
   * @returns true if versions have the same major version (compatible)
   */
  isCompatibleWith(other: SemanticVersion): boolean {
    // Business Rule: Same major version indicates compatibility
    return this.majorVersion === other.majorVersion
  }

  /**
   * Check if this version equals another version
   * @param other Version to compare against
   * @returns true if versions are equal
   */
  equals(other: SemanticVersion): boolean {
    return this.majorVersion === other.majorVersion &&
           this.minorVersion === other.minorVersion &&
           this.patchVersion === other.patchVersion
  }

  /**
   * Convert version to string representation
   * @returns Version string in "major.minor.patch" format
   */
  toString(): string {
    return `${this.majorVersion}.${this.minorVersion}.${this.patchVersion}`
  }

  /**
   * Convert version to JSON-serializable object
   * @returns Object with major, minor, and patch properties
   */
  toJSON(): { major: number; minor: number; patch: number } {
    return {
      major: this.majorVersion,
      minor: this.minorVersion,
      patch: this.patchVersion,
    }
  }
}