# Component Entity

## Overview

The **Component** entity represents a UI component definition within the server-driven UI framework. It defines the structure, properties, behavior, and appearance of individual UI elements that can be rendered across multiple platforms (Web, iOS, Android). Components are the building blocks of user interfaces and can be composed to create complex layouts and interactions.

Each component has a specific type (e.g., button, text input, container, image) and contains properties that define its appearance, behavior, and data binding capabilities. Components support inheritance, composition, and can reference other components to create reusable UI patterns.

## Fields

### Core Fields

| Field         | Type                | Description                                          | Constraints                                  |
| ------------- | ------------------- | ---------------------------------------------------- | -------------------------------------------- | ---------------------------------- |
| `id`          | `ID`                | Unique identifier for the component                  | Auto-generated, immutable                    |
| `name`        | `Name`              | Name for the component within the schema             | Required, uses Name value object validation  |
| `type`        | `ComponentType`     | Type of UI component (button, text, container, etc.) | Required, must be valid component type       |
| `description` | `Description`       | Optional description of the component purpose        | Optional, uses Description value object      |
| `properties`  | `Property[]`        | Array of component properties                        | Required, non-empty for most component types |
| `children`    | `Component[]`       | Child components (for container types)               | Optional, depends on component type          |
| `parentId`    | `ID                 | null`                                                | Parent component ID (for nested components)  | Optional, must be valid if present |
| `styles`      | `ComponentStyle[]`  | Styling properties for the component                 | Optional array                               |
| `metadata`    | `ComponentMetadata` | Additional component metadata                        | Required                                     |

### Derived Fields

| Field         | Type      | Description                            | Calculation             |
| ------------- | --------- | -------------------------------------- | ----------------------- |
| `isContainer` | `boolean` | Whether component can contain children | Based on component type |

## Methods

### Constructors

#### private `constructor(props: ComponentProps)`

Creates a new Component instance with the provided properties.

**Parameters:**

- `props.id`: Optional ComponentId (generated if not provided)
- `props.name`: Component name (required)
- `props.type`: Component type (required)
- `props.description`: Optional description (empty created if not provided)
- `props.properties`: Array of properties (required for most types)
- `props.children`: Array of child components (optional)
- `props.parentId`: Parent component ID (optional)
- `props.styles`: Styling properties (optional)
- `props.metadata`: Component metadata (required)

**Returns:** New Component instance

**Business Rules:**

- Component type must be valid for the framework
- Required properties must be present based on component type
- Parent-child relationships must be valid

### Property Management Methods

#### `addProperty(property: Property): void`

Adds a new property to the component.

**Parameters:**

- `property`: Property to add

**Business Rules:**

- Property type must be valid
- Cannot add properties that conflict with component type constraints
- Triggers `ComponentUpdatedEvent`

#### `removeProperty(propertyName: PropertyName): void`

Removes a property from the component.

**Parameters:**

- `propertyId`: ID of property to remove

**Business Rules:**

- Property must exist in component
- Cannot remove required properties for component type
- Triggers `ComponentUpdatedEvent`

#### `updateProperty(propertyId: ID, updates: Partial<PropertyProps>): void`

Updates an existing property in the component.

**Parameters:**

- `propertyId`: ID of property to update
- `updates`: Property updates to apply

**Business Rules:**

- Property must exist in component
- Updates must maintain property validity
- Type changes must be compatible with existing usage
- Triggers `ComponentUpdatedEvent`

#### `getProperty(propertyId: ID): Property | null`

Gets a property by name.

**Parameters:**

- `propertyId`: Name of property to retrieve

**Returns:** Property if found, null otherwise

### Child Management Methods

#### `addChild(child: Component): void`

Adds a child component to this component.

**Parameters:**

- `child`: Child component to add

**Business Rules:**

- Component must be a container type
- Child cannot create circular dependencies
- Maximum nesting depth (100 levels) must not be exceeded
- Triggers `ComponentUpdatedEvent`

#### `removeChild(childId: ID): void`

Removes a child component from this component.

**Parameters:**

- `childId`: ID of child component to remove

**Business Rules:**

- Child must exist in component
- Cannot remove child that has children of its own
- Child references must be cleaned up
- Triggers `ComponentUpdatedEvent`

#### `reorderChild(childId: ID, newIndex: number): void`

Changes the order of a child component.

**Parameters:**

- `childId`: ID of child component to reorder
- `newIndex`: New index position for the child

**Business Rules:**

- Child must exist in component
- New index must be within valid range
- Order changes must not break rendering logic
- Triggers `ComponentUpdatedEvent`

### Validation Methods

#### `validate(): ValidationResult`

Validates the component against all validation rules.

**Returns:** ValidationResult with validation status and errors

**Business Rules:**

- All properties must be valid
- Required properties must be present
- Property values must match component type constraints
- Child components must be valid (recursively)
- Component must respect hierarchy constraints

### Style Management Methods

#### `addStyle(style: ComponentStyle): void`

Adds a style property to the component.

**Parameters:**

- `style`: Style property to add

**Business Rules:**

- Style property must be valid for component type
- Style name must be unique within component
- Triggers `ComponentUpdatedEvent`

#### `removeStyle(styleId: ID): void`

Removes a style property from the component.

**Parameters:**

- `styleId`: ID of style property to remove

**Business Rules:**

- Style must exist in component
- Cannot remove required styles for component type
- Triggers `ComponentUpdatedEvent`

### Query Methods

#### `findChildByID(id: string): Component | null`

Finds a child component by name.

**Parameters:**

- `id`: ID of child component to find

**Returns:** Child component if found, null otherwise

#### `toJSON(): Record<string, unknown>`

Converts the component to a JSON representation.

**Returns:** JSON representation of the component

## Business Rules & Invariants

### Structural Invariants

1. **Component Identity**: Each component must have a unique identity

   - ID value object must be used
   - Identity must remain consistent throughout lifecycle

2. **Type Consistency**: Component type must remain consistent

   - Type cannot be changed after creation
   - Type must be valid for the framework
   - Type determines available properties and behaviors

3. **Property Integrity**: All properties must be valid and consistent

   - Required properties must be present
   - Property values must match type constraints
   - Property names must be unique within component

4. **Hierarchy Integrity**: Component hierarchies must be valid
   - No circular dependencies allowed
   - Maximum nesting depth of 100 levels
   - Parent-child relationships must be valid
   - Container types must support children

### Behavioral Invariants

1. **Validation**: Components must always be valid

   - Must pass all validation rules
   - Child components must also be valid
   - Property values must be type-safe
   - References must be valid

2. **Event Handling**: Component events must be properly emitted

3. **Styling**: Component styles must be properly managed

   - Style properties must be valid for component type
   - Style values must be valid values
   - Style inheritance must be handled properly

4. **Lifecycle**: Component lifecycle must be properly managed
   - Components cannot be modified when schema is published
   - Deletion must be handled gracefully
   - References must be cleaned up on deletion

## Dependencies

### Internal Dependencies

- `ID`: Value object for component identification
- `Name`: Value object for component names from kernel
- `Description`: Value object for component descriptions from kernel
- `ComponentType`: Value object for component type definition
- `Property`: Value object for component properties
- `ComponentUpdatedEvent`: Value object for component events
- `ComponentStyle`: Value object for component styling
- `ComponentMetadata`: Value object for component metadata

### Domain Events

- `ComponentCreatedDomainEvent`: Emitted when a new component is created
- `ComponentUpdatedDomainEvent`: Emitted when a component is updated
- `ComponentDeletedDomainEvent`: Emitted when a component is deleted

## Errors

### Domain Errors

- `ComponentError`: Thrown on any component error with code, message, description. Created only with factory methods for each case

### Validation Errors

- `ValidationError`: (Already implemented error from kernel module) Thrown when any validation issue happened

## Factory Methods

#### `Component.create(props: Omit<ComponentProps, 'id'> & {id?: ID}): Component`

Creates a new component with auto-generated ID or provided ID.

**Parameters:**

- `props`: Component properties

**Returns:** New Component instance

## Tests

### Unit Tests

1. **Component Creation**

   - Should create component with valid properties
   - Should auto-generate ID when not provided
   - Should throw error for invalid names
   - Should throw error for invalid types

2. **Property Management**

   - Should add valid property to component
   - Should throw error for duplicate property names
   - Should remove property from component
   - Should throw error for removing required property
   - Should update existing property

3. **Child Management**

   - Should add child component to container
   - Should throw error for adding child to non-container
   - Should remove child component
   - Should throw error for circular dependencies
   - Should reorder child components

4. **Validation**

   - Should validate valid component successfully
   - Should detect missing required properties
   - Should detect invalid property values
   - Should validate child components recursively
   - Should detect hierarchy issues

5. **Event Management**

   - Should add event to component
   - Should remove event from component
   - Should throw error for invalid event types
   - Should handle event uniqueness

6. **Style Management**
   - Should add style to component
   - Should remove style from component
   - Should throw error for invalid style properties
   - Should handle style inheritance

### Integration Tests (future implementations, do not implement not now)

1. **Schema Integration**

   - Should integrate with schema validation
   - Should handle schema-level constraints
   - Should participate in schema serialization
   - Should handle schema lifecycle events

2. **Component Relationships**

   - Should handle parent-child relationships
   - Should manage component references
   - Should handle component deletion properly
   - Should maintain relationship integrity

3. **Platform Integration**
   - Should support platform-specific properties
   - Should handle platform constraints
   - Should provide platform-specific validation
   - Should support platform-specific events

### Performance Tests

1. **Large Component Trees**

   - Should handle components with many children
   - Should validate large component trees efficiently
   - Should serialize large components quickly
   - Should maintain memory efficiency

2. **Frequent Updates**
   - Should handle frequent property updates
   - Should manage child component updates efficiently
   - Should handle event processing efficiently
   - Should maintain performance under load

## Serialization

### Serialization Rules

1. **Identity Handling**: IDs are serialized as strings
2. **Type Handling**: Component types are serialized as strings
3. **Hierarchy Handling**: Child components are nested in parent
4. **Reference Handling**: Parent references use ID strings
5. **Metadata Handling**: Metadata is preserved during serialization

### Deserialization Rules

1. **Validation**: All deserialized components must pass validation
2. **ID Generation**: Missing IDs are auto-generated
3. **Type Validation**: Component types are validated during deserialization
4. **Hierarchy Resolution**: Parent-child relationships are properly restored
5. **Reference Resolution**: All references are resolved to actual objects

## Metadata

| Field            | Value                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| **Version**      | 1.0.0                                                                                  |
| **Last Updated** | 2025-09-15                                                                             |
| **Location**     | `packages/domain/src/schema-management/schema-definition/entities/component.entity.ts` |
