# SemanticVersion Value Object

## Overview

Semantic version following the semver specification (major.minor.patch). Provides type-safe version management for domain objects with comparison and increment operations.

## Properties

- major: number - Major version number (breaking changes)
- minor: number - Minor version number (new features, backward compatible)
- patch: number - Patch version number (bug fixes, backward compatible)

## Methods

### Factory Methods

- `static create(major: number, minor: number, patch: number): SemanticVersion`

  - **Throws:** ValidationError
  - **Business rules:** All version numbers must be non-negative integers
  - **Returns:** New SemanticVersion instance

- `static fromString(versionString: string): SemanticVersion`

  - **Throws:** ValidationError, FormatError
  - **Business rules:** Must be in format "major.minor.patch" (e.g., "1.2.3")
  - **Returns:** New SemanticVersion instance

- `static initial(): SemanticVersion`
  - **Business rules:** Creates initial version 0.0.1
  - **Returns:** New SemanticVersion instance

### Core Methods

- `incrementMajor(): SemanticVersion` - Returns new instance with major+1, minor=0, patch=0
- `incrementMinor(): SemanticVersion` - Returns new instance with minor+1, patch=0
- `incrementPatch(): SemanticVersion` - Returns new instance with patch+1
- `compareTo(other: SemanticVersion): -1 | 0 | 1` - Semantic version comparison
- `isGreaterThan(other: SemanticVersion): boolean` - Version comparison
- `isLessThan(other: SemanticVersion): boolean` - Version comparison
- `isCompatibleWith(other: SemanticVersion): boolean` - Same major version check
- `equals(other: SemanticVersion): boolean` - Deep equality comparison
- `toString(): string` - Returns "major.minor.patch" format
- `toJSON(): { major: number; minor: number; patch: number }` - Serialization format

## Business Rules

1. **Non-negative Integers**: All version numbers must be non-negative integers
2. **Format Rule**: String representation follows "major.minor.patch" format
3. **Comparison Rule**: Versions compared by major first, then minor, then patch
4. **Compatibility Rule**: Same major version indicates compatibility
5. **Increment Rule**: Major increment resets minor/patch to 0, minor increment resets patch to 0

## Dependencies

- **ValueObject<{ major: number; minor: number; patch: number }>** - Base class
- **ValidationError** - Invalid version numbers or format
- **FormatError** - Invalid version string format

## Tests

### Essential Tests

- Create with valid/invalid version numbers
- Parse valid/invalid version strings
- Version increment operations maintain immutability
- Comparison operations (compareTo, isGreaterThan, isLessThan, isCompatibleWith)
- Equality comparison and serialization

## Usage Examples

```typescript
// Create versions
const version = SemanticVersion.create(1, 2, 3)
const fromString = SemanticVersion.fromString('2.1.0')
const initial = SemanticVersion.initial() // 0.0.1

// Version operations
const nextMajor = version.incrementMajor() // 2.0.0
const nextMinor = version.incrementMinor() // 1.3.0
const nextPatch = version.incrementPatch() // 1.2.4

// Comparisons
const isNewer = version.isGreaterThan(fromString)
const compatible = version.isCompatibleWith(nextMinor) // true (same major)
```

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
