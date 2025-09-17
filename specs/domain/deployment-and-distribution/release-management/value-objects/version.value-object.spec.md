# Version Value Object

## Overview

The Version value object represents a semantic version number following the Semantic Versioning 2.0.0 specification. It provides type safety and validation for version strings used in the deployment and distribution domain. This value object ensures that all version numbers are properly formatted and can be compared, sorted, and manipulated according to semantic versioning rules.

## Properties

- major: number - Major version number (incompatible API changes)
- minor: number - Minor version number (add functionality in backward compatible manner)
- patch: number - Patch version number (backward compatible bug fixes)
- preRelease: string | null - Pre-release identifier (e.g., "alpha", "beta.1")
- buildMetadata: string | null - Build metadata (e.g., "build.123", "exp.sha.5114f85")

## Methods

### Factory Methods

#### create(versionString: string): Version

Creates a new Version instance from a version string.

**Parameters:**

- `versionString`: String in format "MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]"

**Returns:** New Version instance

**Throws:**

- `InvalidVersionError` if version string format is invalid
- `InvalidVersionComponentError` if any version component is invalid

#### fromComponents(major: number, minor: number, patch: number, preRelease?: string, buildMetadata?: string): Version

Creates a new Version instance from individual components.

**Parameters:**

- `major`: Major version number (non-negative integer)
- `minor`: Minor version number (non-negative integer)
- `patch`: Patch version number (non-negative integer)
- `preRelease`: Optional pre-release identifier
- `buildMetadata`: Optional build metadata

**Returns:** New Version instance

**Throws:**

- `InvalidVersionComponentError` if any component is invalid

#### latest(): Version

Returns the latest stable version (0.0.0).

**Returns:** Version instance representing 0.0.0

#### min(): Version

Returns the minimum possible version (0.0.0).

**Returns:** Version instance representing 0.0.0

#### parse(versionString: string): Version | null

Parses a version string, returning null if invalid.

**Parameters:**

- `versionString`: String to parse

**Returns:** Version instance or null if invalid

### Business Methods

#### toString(): string

Returns the string representation of the version.

**Returns:** Version string in standard format

#### equals(other: Version): boolean

Compares this version with another version for equality.

**Parameters:**

- `other`: Version to compare with

**Returns:** True if versions are equal, false otherwise

#### compareTo(other: Version): number

Compares this version with another version.

**Parameters:**

- `other`: Version to compare with

**Returns:**

- -1 if this version is older than other
- 0 if versions are equal
- 1 if this version is newer than other

#### incrementMajor(): Version

Returns a new version with incremented major number.

**Returns:** New Version instance with major incremented

#### incrementMinor(): Version

Returns a new version with incremented minor number.

**Returns:** New Version instance with minor incremented

#### incrementPatch(): Version

Returns a new version with incremented patch number.

**Returns:** New Version instance with patch incremented

#### withPreRelease(preRelease: string): Version

Returns a new version with the specified pre-release identifier.

**Parameters:**

- `preRelease`: Pre-release identifier

**Returns:** New Version instance with pre-release identifier

#### withBuildMetadata(buildMetadata: string): Version

Returns a new version with the specified build metadata.

**Parameters:**

- `buildMetadata`: Build metadata

**Returns:** New Version instance with build metadata

#### isStable(): boolean

Checks if the version is stable (no pre-release identifier).

**Returns:** True if version is stable, false otherwise

#### isPreRelease(): boolean

Checks if the version has a pre-release identifier.

**Returns:** True if version is pre-release, false otherwise

## Business Rules

1. **Version Format**: Must follow Semantic Versioning 2.0.0 format
2. **Non-Negative Components**: Major, minor, and patch must be non-negative integers
3. **Pre-Release Format**: Pre-release identifiers must contain only ASCII alphanumerics and hyphens
4. **Build Metadata Format**: Build metadata must contain only ASCII alphanumerics and hyphens
5. **Identifier Separation**: Pre-release identifiers are separated by dots
6. **Numeric Identifiers**: Numeric identifiers in pre-release must not have leading zeros
7. **Comparison Rules**: Pre-release versions have lower precedence than normal versions
8. **Build Metadata Ignored**: Build metadata is ignored in version comparisons

## Dependencies

- **ValueObject<T>** - Base class (provides automatic toJSON serialization)
- **InvalidVersionError** - Thrown when version string format is invalid
- **InvalidVersionComponentError** - Thrown when version component is invalid

## Tests

### Essential Tests

- Create with valid/invalid version strings
- Create from individual components with valid/invalid values
- Equality comparison between versions
- Version comparison and ordering
- Serialization/deserialization to/from JSON
- Version increment operations (major, minor, patch)
- Pre-release identifier handling and validation
- Build metadata handling and validation
- Semantic versioning compliance
- Edge cases and boundary conditions

## Serialization

### JSON Format

```json
{
  "major": 1,
  "minor": 0,
  "patch": 0,
  "preRelease": "beta.1",
  "buildMetadata": "build.123"
}
```

### Serialization Rules

1. **Number Serialization**: Version components are serialized as numbers
2. **String Serialization**: Pre-release and build metadata are serialized as strings
3. **Null Handling**: Null values are serialized as null
4. **Object Structure**: Serialized as a plain object with all properties

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
Location: `packages/domain/src/deployment-and-distribution/release-management/value-objects/version.value-object.ts`
Status: Draft
Author: Deployment Domain Team
Bounded Context: Release Management
