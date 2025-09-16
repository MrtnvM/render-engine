# Schema Entity

## Overview

The **Schema** entity represents a complete UI component schema definition within the server-driven UI framework. It serves as the central business object that defines the structure, components, properties, and validation rules for user interfaces that can be rendered across multiple platforms (Web, iOS, Android). Schemas enable dynamic UI updates without requiring app store releases by providing a JSON-based description of the user interface.

The Schema entity manages the entire lifecycle of UI definitions, including versioning, validation, and backward compatibility. It acts as the root aggregate in the Schema Management Domain, containing all related components and their relationships.

## Fields

### Core Fields

| Field              | Type               | Description                                         | Constraints                          |
| ------------------ | ------------------ | --------------------------------------------------- | ------------------------------------ |
| `id`               | `ID`               | Unique identifier for the schema                    | Auto-generated, immutable            |
| `name`             | `string`           | Human-readable name for the schema                  | Required, min 3 chars, max 100 chars |
| `version`          | `SemanticVersion`  | Version of the schema following semantic versioning | Required, format: major.minor.patch  |
| `description`      | `string \| null`   | Optional description of the schema purpose          | Optional, max 500 chars              |
| `components`       | `Component[]`      | Collection of UI components defined in the schema   | Required, non-empty array            |
| `globalProperties` | `Property[]`       | Global properties available to all components       | Optional array                       |
| `validationRules`  | `ValidationRule[]` | Schema-level validation rules                       | Optional array                       |
| `metadata`         | `SchemaMetadata`   | Additional schema metadata                          | Required                             |

### Derived Fields

| Field                 | Type                  | Description                                                 | Calculation                        |
| --------------------- | --------------------- | ----------------------------------------------------------- | ---------------------------------- |
| `componentCount`      | `number`              | Total number of components in the schema                    | `components.length`                |
| `isValid`             | `boolean`             | Whether the schema passes all validation rules              | Computed during validation         |
| `compatibilityStatus` | `CompatibilityStatus` | Backward compatibility status with previous versions        | Computed during version comparison |
| `lastModified`        | `DateTime`            | Last modification timestamp                                 | Automatically updated              |
| `status`              | `SchemaStatus`        | Current status of the schema (draft, published, deprecated) | Managed through state transitions  |

## Methods

### Constructors

#### `constructor(props: SchemaProps)`

Creates a new Schema instance with the provided properties.

**Parameters:**

- `props.id`: Optional ID (generated if not provided)
- `props.name`: Schema name (required)
- `props.version`: Schema version (required)
- `props.description`: Optional description
- `props.components`: Array of components (required)
- `props.globalProperties`: Optional global properties
- `props.validationRules`: Optional validation rules
- `props.metadata`: Schema metadata (required)

**Returns:** New Schema instance

**Business Rules:**

- Schema must have a valid name (3-100 characters)
- Schema must have at least one component
- Schema version must follow semantic versioning
- All components must be valid and have unique names within the schema

### Core Methods

#### `addComponent(component: Component): void`

Adds a new component to the schema.

**Parameters:**

- `component`: Component to add

**Business Rules:**

- Component must have a unique name within the schema
- Component must be valid (pass all validation rules)
- Cannot add components to published schemas (must create new version)
- Triggers `ComponentAddedDomainEvent`

#### `removeComponent(componentId: ComponentId): void`

Removes a component from the schema.

**Parameters:**

- `componentId`: ID of component to remove

**Business Rules:**

- Component must exist in the schema
- Cannot remove components referenced by other components
- Cannot remove components from published schemas
- Triggers `ComponentRemovedDomainEvent`

#### `updateComponent(componentId: ComponentId, updates: Partial<ComponentProps>): void`

Updates an existing component in the schema.

**Parameters:**

- `componentId`: ID of component to update
- `updates: Partial<ComponentProps>`: Properties to update

**Business Rules:**

- Component must exist in the schema
- Updates must not break component validity
- Cannot update published schemas (must create new version)
- Triggers `ComponentUpdatedDomainEvent`

#### `addComponentHierarchy(parentId: ComponentId, childId: ComponentId): void`

Establishes a parent-child relationship between components.

**Parameters:**

- `parentId`: ID of parent component
- `childId`: ID of child component

**Business Rules:**

- Both components must exist in the schema
- Cannot create circular dependencies
- Parent component must support child components
- Triggers `ComponentHierarchyAddedDomainEvent`

### Validation Methods

#### `validate(): ValidationResult`

Validates the entire schema against all validation rules.

**Returns:** ValidationResult with validation status and errors

**Business Rules:**

- All components must be valid
- All global properties must be valid
- Schema-level validation rules must pass
- Component hierarchies must be valid (no circular dependencies)

#### `validateBackwardCompatibility(previousVersion: Schema): CompatibilityResult`

Validates that this schema maintains backward compatibility with a previous version.

**Parameters:**

- `previousVersion`: Previous schema version to compare against

**Returns:** CompatibilityResult with compatibility status and issues

**Business Rules:**

- Cannot remove required properties from existing components
- Cannot change property types in breaking ways
- Must maintain component naming consistency
- New versions must be greater than previous versions

### Version Management Methods

#### `createNewVersion(version: SemanticVersion, changes: SchemaChange[]): Schema`

Creates a new version of the schema with specified changes.

**Parameters:**

- `version`: New version number
- `changes`: Array of changes to apply

**Returns:** New Schema instance with updated version

**Business Rules:**

- New version must be greater than current version
- Changes must maintain backward compatibility (unless major version bump)
- Original schema remains unchanged (immutability)
- Triggers `SchemaVersionCreatedDomainEvent`

#### `publish(): void`

Publishes the schema, making it available for use.

**Business Rules:**

- Schema must be valid (pass all validation)
- Schema must have at least one component
- Cannot publish deprecated schemas
- Triggers `SchemaPublishedDomainEvent`

#### `deprecate(): void`

Marks the schema as deprecated.

**Business Rules:**

- Cannot deprecate schemas with active usage
- Must provide replacement schema information
- Triggers `SchemaDeprecatedDomainEvent`

### Query Methods

#### `findComponent(name: string): Component | null`

Finds a component by name.

**Parameters:**

- `name`: Component name to search for

**Returns:** Component if found, null otherwise

#### `getComponentsByType(type: ComponentType): Component[]`

Gets all components of a specific type.

**Parameters:**

- `type`: Component type to filter by

**Returns:** Array of components matching the type

#### `getComponentHierarchy(componentId: ComponentId): Component[]`

Gets the complete hierarchy for a component (parents and children).

**Parameters:**

- `componentId`: ID of component to get hierarchy for

**Returns:** Array of components in hierarchical order

#### `toJSON(): SchemaJSON`

Converts the schema to a JSON representation suitable for client applications.

**Returns:** JSON representation of the schema

## Business Rules & Invariants

### Structural Invariants

1. **Schema Validity**: A schema must always be structurally valid

   - Must have a valid name (3-100 characters)
   - Must have at least one component
   - All components must have unique names within the schema
   - Version must follow semantic versioning

2. **Component Integrity**: All components in a schema must be valid

   - Components must have required properties defined
   - Components must pass their own validation rules
   - Component references must be valid (no broken references)

3. **Hierarchy Integrity**: Component hierarchies must be valid

   - No circular dependencies allowed
   - Parent-child relationships must be valid
   - Component nesting depth must be reasonable (max 100 levels)

4. **Version Integrity**: Schema versions must be properly managed
   - Versions must follow semantic versioning (major.minor.patch)
   - New versions must be greater than previous versions
   - Breaking changes require major version increment

### State Management Invariants

1. **Immutability**: Published schemas cannot be modified

   - Once published, a schema becomes immutable
   - Changes require creating a new version
   - Draft schemas can be modified freely

2. **Lifecycle Management**: Schema status must follow proper transitions

   - Draft → Published → Deprecated
   - Cannot revert from published to draft
   - Cannot deprecate schemas with active usage

3. **Backward Compatibility**: New versions must maintain compatibility
   - Minor/patch versions must be backward compatible
   - Major versions can introduce breaking changes
   - Must provide migration paths for breaking changes

### Data Integrity Invariants

1. **JSON Structure**: Schema must serialize to valid JSON

   - Must be parseable as valid JSON
   - Must maintain all business rules when serialized/deserialized
   - Circular references must be prevented (throws error)

2. **Reference Integrity**: All references must be valid
   - Component references must exist within the schema
   - Property references must be valid
   - Validation rule references must be valid

## Dependencies

### Internal Dependencies

- `ID`: Value object for schema and component identification
- `Component`: Entity for UI components
- `Property`: Value object for component properties
- `ValidationRule`: Value object for validation rules
- `SemanticVersion`: Value object for version management
- `SchemaMetadata`: Value object for schema metadata
- `ValidationResult`: Value object for validation results
- `CompatibilityResult`: Value object for compatibility checking

### Domain Events

- `SchemaCreatedDomainEvent`: Emitted when a new schema is created
- `SchemaUpdatedDomainEvent`: Emitted when a schema is updated
- `SchemaPublishedDomainEvent`: Emitted when a schema is published
- `SchemaDeprecatedDomainEvent`: Emitted when a schema is deprecated
- `SchemaVersionCreatedDomainEvent`: Emitted when a new version is created
- `ComponentAddedDomainEvent`: Emitted when a component is added
- `ComponentRemovedDomainEvent`: Emitted when a component is removed
- `ComponentUpdatedDomainEvent`: Emitted when a component is updated
- `ComponentHierarchyAddedDomainEvent`: Emitted when component hierarchy is established

## Errors

### Domain Errors

- `InvalidSchemaError`: Thrown when schema structure is invalid
- `ComponentNameConflictError`: Thrown when component names conflict
- `SchemaValidationError`: Thrown when schema validation fails
- `InvalidVersionError`: Thrown when version format is invalid
- `BackwardCompatibilityError`: Thrown when backward compatibility is broken
- `CircularDependencyError`: Thrown when circular dependencies are detected
- `SchemaStateTransitionError`: Thrown when invalid state transition is attempted
- `ComponentNotFoundError`: Thrown when referenced component is not found

### Validation Errors

- `InvalidSchemaNameError`: Thrown when schema name is invalid
- `EmptySchemaError`: Thrown when schema has no components
- `DuplicateComponentError`: Thrown when duplicate component names exist
- `InvalidComponentHierarchyError`: Thrown when component hierarchy is invalid
- `InvalidVersionFormatError`: Thrown when version format is invalid

## Factory Methods

#### `Schema.create(props: Omit<SchemaProps, 'id'>): Schema`

Creates a new schema with auto-generated ID.

**Parameters:**

- `props`: Schema properties (excluding ID)

**Returns:** New Schema instance

#### `Schema.fromJSON(json: SchemaJSON): Schema`

Creates a schema from JSON representation.

**Parameters:**

- `json`: JSON representation of schema

**Returns:** Schema instance

**Business Rules:**

- JSON must be valid schema representation
- Must pass all validation rules
- Must have valid structure and relationships

#### `Schema.duplicate(original: Schema, newName: string, newVersion: SemanticVersion): Schema`

Creates a duplicate of an existing schema with new name and version.

**Parameters:**

- `original`: Original schema to duplicate
- `newName`: New name for the duplicated schema
- `newVersion`: New version for the duplicated schema

**Returns:** New Schema instance that is a copy of the original

**Business Rules:**

- New name must be unique within the schema registry
- New version must be valid semantic version
- All components and relationships are copied
- Original schema remains unchanged

## Tests

### Unit Tests

1. **Schema Creation**

   - Should create schema with valid properties
   - Should auto-generate ID when not provided
   - Should throw error for invalid names
   - Should throw error for empty component array
   - Should throw error for duplicate component names

2. **Component Management**

   - Should add valid component to schema
   - Should throw error for duplicate component names
   - Should remove component from schema
   - Should throw error for non-existent component removal
   - Should update existing component
   - Should throw error for updating published schema

3. **Validation**

   - Should validate valid schema successfully
   - Should detect invalid component references
   - Should detect circular dependencies
   - Should validate backward compatibility
   - Should return comprehensive validation results

4. **Version Management**

   - Should create new version with changes
   - Should throw error for invalid version increments
   - Should publish valid schema
   - Should throw error for publishing invalid schema
   - Should deprecate schema properly
   - Should throw error for deprecating active schema

5. **JSON Serialization**
   - Should serialize to valid JSON
   - Should deserialize from valid JSON
   - Should maintain business rules after serialization
   - Should handle circular references properly

### Integration Tests

1. **Schema Registry Integration**

   - Should register schema with registry
   - Should retrieve schema from registry
   - Should handle version conflicts
   - Should maintain schema uniqueness

2. **Component Integration**

   - Should manage component relationships properly
   - Should handle component validation
   - Should maintain component hierarchies
   - Should handle component lifecycle events

3. **Validation Integration**
   - Should integrate with validation services
   - Should provide actionable error messages
   - Should support extensible validation rules
   - Should handle validation performance

### Performance Tests

1. **Large Schema Performance**

   - Should handle schemas with 1000+ components
   - Should validate large schemas efficiently
   - Should serialize/deserialize large schemas quickly
   - Should maintain memory efficiency

2. **Concurrent Access**
   - Should handle concurrent schema modifications
   - Should prevent race conditions
   - Should maintain data consistency
   - Should handle high-frequency updates

## Serialization

### JSON Format

```typescript
interface SchemaJSON {
  id: string
  name: string
  version: string
  description?: string
  components: ComponentJSON[]
  globalProperties?: PropertyJSON[]
  validationRules?: ValidationRuleJSON[]
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy?: string
    tags?: string[]
    [key: string]: any
  }
  status: 'draft' | 'published' | 'deprecated'
  compatibility?: {
    backwardCompatible: boolean
    breakingChanges?: string[]
  }
}
```

### Serialization Rules

1. **Identity Handling**: IDs are serialized as strings
2. **Date Handling**: Dates are serialized as ISO strings
3. **Circular References**: Component references use IDs to avoid circularity
4. **Validation State**: Validation results are not serialized (computed at runtime)
5. **Metadata**: Additional metadata is preserved during serialization
6. **Compatibility**: Compatibility information is computed and included

### Deserialization Rules

1. **Validation**: All deserialized schemas must pass validation
2. **ID Generation**: Missing IDs are auto-generated during deserialization
3. **Date Parsing**: ISO date strings are parsed to Date objects
4. **Reference Resolution**: Component references are resolved to actual objects
5. **State Restoration**: Schema status and metadata are properly restored

## Metadata

| Field                | Value                                                |
| -------------------- | ---------------------------------------------------- |
| **Version**          | 1.0.0                                                |
| **Last Updated**     | 2025-09-15                                           |
| **Author**           | Schema Management Domain Team                        |
| **Status**           | Draft                                                |
| **Dependencies**     | Component, Property, ValidationRule, SemanticVersion |
| **Complexity**       | High                                                 |
| **Testing Priority** | Critical                                             |
| **Review Required**  | Yes                                                  |
| **Documentation**    | Complete                                             |
| **Breaking Changes** | None                                                 |
