# Component Entity

## Overview

The **Component** entity represents a UI component definition within the server-driven UI framework. It defines the structure, properties, behavior, and appearance of individual UI elements that can be rendered across multiple platforms (Web, iOS, Android). Components are the building blocks of user interfaces and can be composed to create complex layouts and interactions.

Each component has a specific type (e.g., button, text input, container, image) and contains properties that define its appearance, behavior, and data binding capabilities. Components support inheritance, composition, and can reference other components to create reusable UI patterns.

## Fields

### Core Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | `ComponentId` | Unique identifier for the component | Auto-generated, immutable |
| `name` | `string` | Unique name for the component within the schema | Required, min 3 chars, max 50 chars, alphanumeric + underscore/hyphen |
| `type` | `ComponentType` | Type of UI component (button, text, container, etc.) | Required, must be valid component type |
| `displayName` | `string` | Human-readable display name for the component | Required, min 3 chars, max 100 chars |
| `description` | `string | null` | Optional description of the component purpose | Optional, max 500 chars |
| `properties` | `Property[]` | Array of component properties | Required, non-empty for most component types |
| `children` | `Component[]` | Child components (for container types) | Optional, depends on component type |
| `parentId` | `ComponentId | null` | Parent component ID (for nested components) | Optional, must be valid if present |
| `validationRules` | `ValidationRule[]` | Component-specific validation rules | Optional array |
| `events` | `ComponentEvent[]` | Events the component can emit | Optional array |
| `styles` | `ComponentStyle[]` | Styling properties for the component | Optional array |
| `metadata` | `ComponentMetadata` | Additional component metadata | Required |

### Derived Fields

| Field | Type | Description | Calculation |
|-------|------|-------------|-------------|
| `propertyCount` | `number` | Total number of properties | `properties.length` |
| `childCount` | `number` | Total number of direct children | `children.length` |
| `depth` | `number` | Nesting depth in component hierarchy | Computed from parent relationships |
| `isContainer` | `boolean` | Whether component can contain children | Based on component type |
| `isValid` | `boolean` | Whether component passes all validation | Computed during validation |
| `hasRequiredProperties` | `boolean` | Whether all required properties are present | Computed from property definitions |

## Methods

### Constructors

#### `constructor(props: ComponentProps)`

Creates a new Component instance with the provided properties.

**Parameters:**
- `props.id`: Optional ComponentId (generated if not provided)
- `props.name`: Component name (required)
- `props.type`: Component type (required)
- `props.displayName`: Display name (required)
- `props.description`: Optional description
- `props.properties`: Array of properties (required for most types)
- `props.children`: Array of child components (optional)
- `props.parentId`: Parent component ID (optional)
- `props.validationRules`: Validation rules (optional)
- `props.events`: Component events (optional)
- `props.styles`: Styling properties (optional)
- `props.metadata`: Component metadata (required)

**Returns:** New Component instance

**Business Rules:**
- Component name must be unique within schema
- Component type must be valid for the framework
- Required properties must be present based on component type
- Parent-child relationships must be valid

### Property Management Methods

#### `addProperty(property: Property): void`

Adds a new property to the component.

**Parameters:**
- `property`: Property to add

**Business Rules:**
- Property name must be unique within component
- Property type must be valid
- Cannot add properties that conflict with component type constraints
- Triggers `ComponentPropertyChangedDomainEvent`

#### `removeProperty(propertyName: string): void`

Removes a property from the component.

**Parameters:**
- `propertyName`: Name of property to remove

**Business Rules:**
- Property must exist in component
- Cannot remove required properties for component type
- Cannot remove properties referenced by child components
- Triggers `ComponentPropertyChangedDomainEvent`

#### `updateProperty(propertyName: string, updates: Partial<PropertyProps>): void`

Updates an existing property in the component.

**Parameters:**
- `propertyName`: Name of property to update
- `updates`: Property updates to apply

**Business Rules:**
- Property must exist in component
- Updates must maintain property validity
- Type changes must be compatible with existing usage
- Triggers `ComponentPropertyChangedDomainEvent`

#### `getProperty(propertyName: string): Property | null`

Gets a property by name.

**Parameters:**
- `propertyName`: Name of property to retrieve

**Returns:** Property if found, null otherwise

### Child Management Methods

#### `addChild(child: Component): void`

Adds a child component to this component.

**Parameters:**
- `child`: Child component to add

**Business Rules:**
- Component must be a container type
- Child must be valid (pass validation)
- Child cannot create circular dependencies
- Maximum nesting depth (10 levels) must not be exceeded
- Triggers `ComponentChildAddedDomainEvent`

#### `removeChild(childId: ComponentId): void`

Removes a child component from this component.

**Parameters:**
- `childId`: ID of child component to remove

**Business Rules:**
- Child must exist in component
- Cannot remove child that has children of its own
- Child references must be cleaned up
- Triggers `ComponentChildRemovedDomainEvent`

#### `reorderChild(childId: ComponentId, newIndex: number): void`

Changes the order of a child component.

**Parameters:**
- `childId`: ID of child component to reorder
- `newIndex`: New index position for the child

**Business Rules:**
- Child must exist in component
- New index must be within valid range
- Order changes must not break rendering logic
- Triggers `ComponentChildReorderedDomainEvent`

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

#### `validateProperty(propertyName: string, value: any): PropertyValidationResult`

Validates a specific property value.

**Parameters:**
- `propertyName`: Name of property to validate
- `value`: Value to validate

**Returns:** PropertyValidationResult with validation status and errors

**Business Rules:**
- Property must exist in component
- Value must match property type constraints
- Value must pass property-specific validation rules
- Value must be compatible with component type requirements

### Event Management Methods

#### `addEvent(event: ComponentEvent): void`

Adds an event handler to the component.

**Parameters:**
- `event`: Event to add

**Business Rules:**
- Event type must be valid for component type
- Event name must be unique within component
- Event handlers must reference valid actions
- Triggers `ComponentEventAddedDomainEvent`

#### `removeEvent(eventName: string): void`

Removes an event handler from the component.

**Parameters:**
- `eventName`: Name of event to remove

**Business Rules:**
- Event must exist in component
- Cannot remove events referenced by other components
- Triggers `ComponentEventRemovedDomainEvent`

### Style Management Methods

#### `addStyle(style: ComponentStyle): void`

Adds a style property to the component.

**Parameters:**
- `style`: Style property to add

**Business Rules:**
- Style property must be valid for component type
- Style name must be unique within component
- Style values must be valid CSS values
- Triggers `ComponentStyleChangedDomainEvent`

#### `removeStyle(styleName: string): void`

Removes a style property from the component.

**Parameters:**
- `styleName`: Name of style property to remove

**Business Rules:**
- Style must exist in component
- Cannot remove required styles for component type
- Triggers `ComponentStyleChangedDomainEvent`

### Query Methods

#### `isAncestorOf(component: Component): boolean`

Checks if this component is an ancestor of another component.

**Parameters:**
- `component`: Component to check ancestry for

**Returns:** True if this component is an ancestor, false otherwise

#### `isDescendantOf(component: Component): boolean`

Checks if this component is a descendant of another component.

**Parameters:**
- `component`: Component to check descent from

**Returns:** True if this component is a descendant, false otherwise

#### `findChildByName(name: string): Component | null`

Finds a child component by name.

**Parameters:**
- `name`: Name of child component to find

**Returns:** Child component if found, null otherwise

#### `getAllDescendants(): Component[]`

Gets all descendant components (children, grandchildren, etc.).

**Returns:** Array of all descendant components

#### `toJSON(): ComponentJSON`

Converts the component to a JSON representation.

**Returns:** JSON representation of the component

## Business Rules & Invariants

### Structural Invariants

1. **Component Identity**: Each component must have a unique identity
   - Name must be unique within the schema
   - ID must be unique across all components
   - Identity must remain consistent throughout lifecycle

2. **Type Consistency**: Component type must remain consistent
   - Type cannot be changed after creation
   - Type must be valid for the framework
   - Type determines available properties and behaviors

3. **Property Integrity**: All properties must be valid and consistent
   - Properties must have valid names and types
   - Required properties must be present
   - Property values must match type constraints
   - Property names must be unique within component

4. **Hierarchy Integrity**: Component hierarchies must be valid
   - No circular dependencies allowed
   - Maximum nesting depth of 10 levels
   - Parent-child relationships must be valid
   - Container types must support children

### Behavioral Invariants

1. **Validation**: Components must always be valid
   - Must pass all validation rules
   - Child components must also be valid
   - Property values must be type-safe
   - References must be valid

2. **Event Handling**: Component events must be properly managed
   - Event types must be valid for component type
   - Event handlers must reference valid actions
   - Event names must be unique within component

3. **Styling**: Component styles must be properly managed
   - Style properties must be valid for component type
   - Style values must be valid CSS values
   - Style inheritance must be handled properly

4. **Lifecycle**: Component lifecycle must be properly managed
   - Components cannot be modified when schema is published
   - Deletion must be handled gracefully
   - References must be cleaned up on deletion

## Dependencies

### External Dependencies

- `uuid`: For generating unique identifiers
- `zod`: For type validation and schema definitions

### Internal Dependencies

- `ComponentId`: Value object for component identification
- `ComponentType`: Value object for component type definition
- `Property`: Value object for component properties
- `ValidationRule`: Value object for validation rules
- `ComponentEvent`: Value object for component events
- `ComponentStyle`: Value object for component styling
- `ComponentMetadata`: Value object for component metadata
- `ValidationResult`: Value object for validation results
- `PropertyValidationResult`: Value object for property validation

### Domain Events

- `ComponentCreatedDomainEvent`: Emitted when a new component is created
- `ComponentUpdatedDomainEvent`: Emitted when a component is updated
- `ComponentDeletedDomainEvent`: Emitted when a component is deleted
- `ComponentPropertyChangedDomainEvent`: Emitted when component properties change
- `ComponentChildAddedDomainEvent`: Emitted when a child component is added
- `ComponentChildRemovedDomainEvent`: Emitted when a child component is removed
- `ComponentChildReorderedDomainEvent`: Emitted when child order changes
- `ComponentEventAddedDomainEvent`: Emitted when an event is added
- `ComponentEventRemovedDomainEvent`: Emitted when an event is removed
- `ComponentStyleChangedDomainEvent`: Emitted when styling changes

## Errors

### Domain Errors

- `InvalidComponentError`: Thrown when component structure is invalid
- `DuplicateComponentNameError`: Thrown when component name conflicts
- `InvalidComponentTypeError`: Thrown when component type is invalid
- `ComponentHierarchyError`: Thrown when component hierarchy is invalid
- `CircularDependencyError`: Thrown when circular dependencies are detected
- `ComponentNotFoundError`: Thrown when referenced component is not found
- `PropertyNotFoundError`: Thrown when referenced property is not found
- `InvalidPropertyError`: Thrown when property is invalid
- `EventNotFoundError`: Thrown when referenced event is not found

### Validation Errors

- `MissingRequiredPropertyError`: Thrown when required property is missing
- `InvalidPropertyValueError`: Thrown when property value is invalid
- `InvalidChildComponentError`: Thrown when child component is invalid
- `ExceededNestingDepthError`: Thrown when nesting depth is exceeded
- `InvalidComponentStructureError`: Thrown when component structure is invalid

## Factory Methods

#### `Component.create(props: Omit<ComponentProps, 'id'>): Component`

Creates a new component with auto-generated ID.

**Parameters:**
- `props`: Component properties (excluding ID)

**Returns:** New Component instance

#### `Component.fromType(type: ComponentType, name: string, displayName: string): Component`

Creates a component with default properties for the specified type.

**Parameters:**
- `type`: Component type to create
- `name`: Component name
- `displayName`: Display name

**Returns:** New Component instance with default properties for the type

**Business Rules:**
- Component type must be valid
- Default properties are added based on component type
- Required properties are automatically included
- Component is created in draft state

#### `Component.clone(original: Component, newName: string): Component`

Creates a clone of an existing component with a new name.

**Parameters:**
- `original`: Original component to clone
- `newName`: New name for the cloned component

**Returns:** New Component instance that is a copy of the original

**Business Rules:**
- New name must be unique within schema
- All properties and children are copied
- New component gets new ID
- Original component remains unchanged

## Tests

### Unit Tests

1. **Component Creation**
   - Should create component with valid properties
   - Should auto-generate ID when not provided
   - Should throw error for invalid names
   - Should throw error for invalid types
   - Should throw error for duplicate names

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

### Integration Tests

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

### JSON Format

```typescript
interface ComponentJSON {
  id: string;
  name: string;
  type: string;
  displayName: string;
  description?: string;
  properties: PropertyJSON[];
  children?: ComponentJSON[];
  parentId?: string;
  validationRules?: ValidationRuleJSON[];
  events?: ComponentEventJSON[];
  styles?: ComponentStyleJSON[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    platform?: string[];
    [key: string]: any;
  };
}
```

### Serialization Rules

1. **Identity Handling**: IDs are serialized as strings
2. **Type Handling**: Component types are serialized as strings
3. **Hierarchy Handling**: Child components are nested in parent
4. **Reference Handling**: Parent references use ID strings
5. **Metadata Handling**: Metadata is preserved during serialization
6. **Validation State**: Validation results are not serialized

### Deserialization Rules

1. **Validation**: All deserialized components must pass validation
2. **ID Generation**: Missing IDs are auto-generated
3. **Type Validation**: Component types are validated during deserialization
4. **Hierarchy Resolution**: Parent-child relationships are properly restored
5. **Reference Resolution**: All references are resolved to actual objects

## Metadata

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Last Updated** | 2025-09-15 |
| **Author** | Schema Management Domain Team |
| **Status** | Draft |
| **Dependencies** | Property, ValidationRule, ComponentEvent, ComponentStyle |
| **Complexity** | High |
| **Testing Priority** | Critical |
| **Review Required** | Yes |
| **Documentation** | Complete |
| **Breaking Changes** | None |