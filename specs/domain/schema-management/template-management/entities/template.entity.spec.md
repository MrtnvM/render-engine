# Template Entity

## Overview

The **Template** entity represents a reusable UI template within the server-driven UI framework. Templates enable developers to create predefined UI patterns and layouts that can be instantiated with different parameters, promoting consistency and reusability across the application. Templates can inherit from other templates, support complex parameterization, and can be compiled for optimal performance.

Templates serve as blueprints for creating consistent UI components and layouts. They support parameterization, inheritance, composition, and can be optimized through compilation. Templates are essential for maintaining design consistency and reducing development effort.

## Fields

### Core Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | `TemplateId` | Unique identifier for the template | Auto-generated, immutable |
| `name` | `string` | Unique name for the template | Required, min 3 chars, max 50 chars, alphanumeric + underscore/hyphen |
| `version` | `SemanticVersion` | Template version following semantic versioning | Required, format: major.minor.patch |
| `displayName` | `string` | Human-readable display name | Required, min 3 chars, max 100 chars |
| `description` | `string | null` | Optional description of the template purpose | Optional, max 500 chars |
| `parameters` | `TemplateParameter[]` | Template parameters for configuration | Required array (can be empty) |
| `content` | `TemplateContent` | Template content definition | Required |
| `parentTemplateId` | `TemplateId | null` | Parent template for inheritance | Optional, must be valid if present |
| `inheritance` | `TemplateInheritance | null` | Inheritance configuration | Optional |
| `compilation` | `TemplateCompilation | null` | Compilation result and metadata | Optional |
| `metadata` | `TemplateMetadata` | Additional template metadata | Required |

### Derived Fields

| Field | Type | Description | Calculation |
|-------|------|-------------|-------------|
| `parameterCount` | `number` | Total number of parameters | `parameters.length` |
| `hasParameters` | `boolean` | Whether template has parameters | `parameters.length > 0` |
| `hasParent` | `boolean` | Whether template has a parent | `parentTemplateId !== null` |
| `isCompiled` | `boolean` | Whether template is compiled | `compilation !== null` |
| `isRoot` | `boolean` | Whether template is a root template | `parentTemplateId === null` |
| `inheritanceDepth` | `number` | Depth in inheritance hierarchy | Computed from parent relationships |
| `lastModified` | `DateTime` | Last modification timestamp | Automatically updated |
| `status` | `TemplateStatus` | Current status of the template | Managed through state transitions |

## Methods

### Constructors

#### `constructor(props: TemplateProps)`

Creates a new Template instance with the provided properties.

**Parameters:**
- `props.id`: Optional TemplateId (generated if not provided)
- `props.name`: Template name (required)
- `props.version`: Template version (required)
- `props.displayName`: Display name (required)
- `props.description`: Optional description
- `props.parameters`: Template parameters (required, can be empty)
- `props.content`: Template content (required)
- `props.parentTemplateId`: Parent template ID (optional)
- `props.inheritance`: Inheritance configuration (optional)
- `props.compilation`: Compilation result (optional)
- `props.metadata`: Template metadata (required)

**Returns:** New Template instance

**Business Rules:**
- Template name must be unique within template registry
- Template version must follow semantic versioning
- Parameters must be unique within template
- Parent template must exist if specified
- Content must be valid template definition

### Parameter Management Methods

#### `addParameter(parameter: TemplateParameter): void`

Adds a new parameter to the template.

**Parameters:**
- `parameter`: Parameter to add

**Business Rules:**
- Parameter name must be unique within template
- Parameter type must be valid
- Parameter must have valid default value if required
- Cannot add parameters that conflict with inherited parameters
- Triggers `TemplateParameterAddedDomainEvent`

#### `removeParameter(parameterName: string): void`

Removes a parameter from the template.

**Parameters:**
- `parameterName`: Name of parameter to remove

**Business Rules:**
- Parameter must exist in template
- Cannot remove parameters used in template content
- Cannot remove inherited parameters
- Triggers `TemplateParameterRemovedDomainEvent`

#### `updateParameter(parameterName: string, updates: Partial<TemplateParameterProps>): void`

Updates an existing parameter in the template.

**Parameters:**
- `parameterName`: Name of parameter to update
- `updates`: Parameter updates to apply

**Business Rules:**
- Parameter must exist in template
- Updates must maintain parameter validity
- Type changes must be compatible with existing usage
- Cannot update inherited parameters
- Triggers `TemplateParameterUpdatedDomainEvent`

#### `getParameter(parameterName: string): TemplateParameter | null`

Gets a parameter by name.

**Parameters:**
- `parameterName`: Name of parameter to retrieve

**Returns:** Parameter if found, null otherwise

#### `getAllParameters(): TemplateParameter[]`

Gets all parameters including inherited ones.

**Returns:** Array of all parameters (inherited + local)

### Content Management Methods

#### `updateContent(content: TemplateContent): void`

Updates the template content.

**Parameters:**
- `content`: New template content

**Business Rules:**
- Content must be valid template definition
- Content must use valid parameter references
- Content must be compatible with parent template content
- Content must not create circular dependencies
- Triggers `TemplateContentUpdatedDomainEvent`

#### `validateContent(): TemplateValidationResult`

Validates the template content against parameters and constraints.

**Returns:** TemplateValidationResult with validation status and errors

**Business Rules:**
- Content must reference valid parameters
- Content must follow template syntax rules
- Content must be compatible with inheritance
- Content must not have syntax errors

### Inheritance Methods

#### `setParent(parentTemplateId: TemplateId, inheritance?: TemplateInheritance): void`

Sets the parent template for inheritance.

**Parameters:**
- `parentTemplateId`: Parent template ID
- `inheritance`: Optional inheritance configuration

**Business Rules:**
- Parent template must exist
- Cannot create circular dependencies
- Must maintain parameter compatibility
- Must maintain content compatibility
- Triggers `TemplateParentSetDomainEvent`

#### `removeParent(): void`

Removes the parent template relationship.

**Business Rules:**
- Cannot remove parent if template has children
- Must handle inherited parameters appropriately
- Must validate template remains valid
- Triggers `TemplateParentRemovedDomainEvent`

#### `getInheritanceChain(): Template[]`

Gets the complete inheritance chain for this template.

**Returns:** Array of Template instances from root to current template

#### `getEffectiveContent(): TemplateContent`

Gets the effective content after applying inheritance.

**Returns:** Effective TemplateContent after inheritance resolution

### Compilation Methods

#### `compile(): TemplateCompilation`

Compiles the template for optimal performance.

**Returns:** TemplateCompilation with compilation result and metadata

**Business Rules:**
- Template must be valid before compilation
- Compilation must optimize parameter usage
- Compilation must resolve inheritance
- Compilation must generate executable content
- Triggers `TemplateCompiledDomainEvent`

#### `recompile(): TemplateCompilation`

Recompiles an already compiled template.

**Returns:** Updated TemplateCompilation

**Business Rules:**
- Template must already be compiled
- Recompilation should handle changes gracefully
- Should maintain compatibility with previous compilation
- Should update compilation metadata

#### `isCompilationStale(): boolean`

Checks if the compilation is stale and needs recompilation.

**Returns:** True if compilation is stale, false otherwise

**Business Rules:**
- Should consider template modifications
- Should consider parent template changes
- Should consider parameter changes
- Should consider compilation threshold settings

### Instantiation Methods

#### `instantiate(parameters: Record<string, unknown>): TemplateInstance`

Creates a template instance with provided parameters.

**Parameters:**
- `parameters`: Parameter values for instantiation

**Returns:** TemplateInstance with resolved content

**Business Rules:**
- All required parameters must be provided
- Parameter values must match parameter types
- Parameter values must pass validation rules
- Should resolve inheritance chain
- Should apply parameter substitutions

#### `validateInstantiationParameters(parameters: Record<string, unknown>): TemplateValidationResult`

Validates parameters for template instantiation.

**Parameters:**
- `parameters`: Parameters to validate

**Returns:** TemplateValidationResult with validation status and errors

**Business Rules:**
- Must validate all provided parameters
- Must check for missing required parameters
- Must validate parameter types and values
- Must check for extra parameters

### Query Methods

#### `getParameterUsage(parameterName: string): ParameterUsage`

Gets usage information for a specific parameter.

**Parameters:**
- `parameterName`: Name of parameter to analyze

**Returns:** ParameterUsage with usage statistics and locations

#### `getDependencies(): TemplateDependency[]`

Gets all template dependencies.

**Returns:** Array of TemplateDependency objects

#### `isDependentOn(templateId: TemplateId): boolean`

Checks if this template depends on another template.

**Parameters:**
- `templateId`: Template ID to check dependency on

**Returns:** True if dependent, false otherwise

#### `toJSON(): TemplateJSON`

Converts the template to a JSON representation.

**Returns:** JSON representation of the template

## Business Rules & Invariants

### Structural Invariants

1. **Template Identity**: Each template must have a unique identity
   - Name must be unique within template registry
   - ID must be unique across all templates
   - Version must follow semantic versioning
   - Identity must remain consistent throughout lifecycle

2. **Parameter Integrity**: Template parameters must be valid and consistent
   - Parameters must have unique names within template
   - Parameters must have valid types and default values
   - Required parameters must have valid defaults
   - Parameter references in content must be valid

3. **Content Validity**: Template content must be valid and executable
   - Content must follow template syntax rules
   - Content must reference valid parameters
   - Content must be compatible with inheritance
   - Content must not have circular references

4. **Inheritance Integrity**: Template inheritance must be valid and acyclic
   - Parent-child relationships must be valid
   - No circular dependencies allowed
   - Parameter inheritance must be compatible
   - Content inheritance must be compatible

### Compilation Invariants

1. **Compilation Consistency**: Template compilation must be consistent
   - Compilation must reflect current template state
   - Compilation must resolve inheritance properly
   - Compilation must optimize parameter usage
   - Compilation must be reversible if needed

2. **Performance Requirements**: Template compilation must be efficient
   - Compilation should be fast for large templates
   - Compiled templates should execute quickly
   - Memory usage should be optimized
   - Compilation should support caching

## Dependencies

### External Dependencies

- `uuid`: For generating unique identifiers
- `zod`: For type validation and schema definitions
- `date-fns`: For date/time operations

### Internal Dependencies

- `TemplateId`: Value object for template identification
- `TemplateParameter`: Value object for template parameters
- `TemplateContent`: Value object for template content
- `TemplateInheritance`: Value object for inheritance configuration
- `TemplateCompilation`: Value object for compilation result
- `TemplateMetadata`: Value object for template metadata
- `SemanticVersion`: Value object for version management
- `TemplateValidationResult`: Value object for validation results
- `TemplateInstance`: Value object for template instances
- `ParameterUsage`: Value object for parameter usage analysis
- `TemplateDependency`: Value object for template dependencies

### Domain Events

- `TemplateCreatedDomainEvent`: Emitted when a new template is created
- `TemplateUpdatedDomainEvent`: Emitted when a template is updated
- `TemplateDeletedDomainEvent`: Emitted when a template is deleted
- `TemplateParameterAddedDomainEvent`: Emitted when a parameter is added
- `TemplateParameterRemovedDomainEvent`: Emitted when a parameter is removed
- `TemplateParameterUpdatedDomainEvent`: Emitted when a parameter is updated
- `TemplateContentUpdatedDomainEvent`: Emitted when content is updated
- `TemplateParentSetDomainEvent`: Emitted when parent is set
- `TemplateParentRemovedDomainEvent`: Emitted when parent is removed
- `TemplateCompiledDomainEvent`: Emitted when template is compiled

## Errors

### Domain Errors

- `InvalidTemplateError`: Thrown when template is invalid
- `DuplicateTemplateNameError`: Thrown when template name conflicts
- `TemplateNotFoundError`: Thrown when template is not found
- `InvalidParameterError`: Thrown when parameter is invalid
- `InvalidContentError`: Thrown when template content is invalid
- `InheritanceError`: Thrown when inheritance is invalid
- `CircularDependencyError`: Thrown when circular dependencies are detected
- `CompilationError`: Thrown when compilation fails
- `InstantiationError`: Thrown when template instantiation fails

### Validation Errors

- `MissingRequiredParameterError`: Thrown when required parameter is missing
- `InvalidParameterValueError`: Thrown when parameter value is invalid
- `ParameterNameConflictError`: Thrown when parameter names conflict
- `ContentSyntaxError`: Thrown when content has syntax errors
- `InheritanceCompatibilityError`: Thrown when inheritance is incompatible

## Factory Methods

#### `Template.create(props: Omit<TemplateProps, 'id'>): Template`

Creates a new template with auto-generated ID.

**Parameters:**
- `props`: Template properties (excluding ID)

**Returns:** New Template instance

#### `Template.fromSchema(schema: Schema, name: string, displayName: string): Template`

Creates a template from a schema definition.

**Parameters:**
- `schema`: Schema to convert to template
- `name`: Template name
- `displayName`: Template display name

**Returns:** New Template instance based on schema

**Business Rules:**
- Schema components become template content
- Schema properties become template parameters
- Schema validation rules become template constraints
- Template is created with schema metadata

#### `Template.inherit(parent: Template, name: string, displayName: string, inheritance?: TemplateInheritance): Template`

Creates a template that inherits from a parent template.

**Parameters:**
- `parent`: Parent template to inherit from
- `name`: Child template name
- `displayName`: Child template display name
- `inheritance`: Optional inheritance configuration

**Returns:** New Template instance that inherits from parent

**Business Rules:**
- Child template inherits parent parameters
- Child template can override parent content
- Child template must maintain compatibility with parent
- Inheritance configuration must be valid

## Tests

### Unit Tests

1. **Template Creation**
   - Should create template with valid properties
   - Should auto-generate ID when not provided
   - Should throw error for invalid names
   - Should throw error for invalid versions
   - Should throw error for duplicate names

2. **Parameter Management**
   - Should add valid parameter to template
   - Should throw error for duplicate parameter names
   - Should remove parameter from template
   - Should throw error for removing used parameter
   - Should update existing parameter

3. **Content Management**
   - Should update template content
   - Should validate content against parameters
   - Should handle content syntax errors
   - Should validate parameter references
   - Should handle content inheritance

4. **Inheritance Management**
   - Should set parent template
   - Should remove parent template
   - Should get inheritance chain
   - Should handle circular dependencies
   - Should resolve effective content

5. **Compilation**
   - Should compile valid template
   - Should recompile compiled template
   - Should check compilation staleness
   - Should handle compilation errors
   - Should optimize performance

6. **Instantiation**
   - Should instantiate template with parameters
   - Should validate instantiation parameters
   - Should resolve parameter substitutions
   - Should handle inheritance in instantiation
   - Should provide error feedback

### Integration Tests

1. **Schema Integration**
   - Should create templates from schemas
   - Should handle schema updates
   - Should maintain compatibility with schemas
   - Should handle schema versioning

2. **Template Registry Integration**
   - Should register templates with registry
   - Should handle template lookups
   - Should manage template versions
   - Should handle template dependencies

3. **Platform Integration**
   - Should support platform-specific compilation
   - Should handle platform-specific parameters
   - Should support platform-specific content
   - Should handle platform constraints

### Performance Tests

1. **Large Template Performance**
   - Should handle templates with many parameters
   - Should compile large templates efficiently
   - Should instantiate large templates quickly
   - Should maintain memory efficiency

2. **Frequent Updates**
   - Should handle frequent template updates
   - Should manage compilation caching
   - Should handle inheritance updates
   - Should maintain performance under load

## Serialization

### JSON Format

```typescript
interface TemplateJSON {
  id: string;
  name: string;
  version: string;
  displayName: string;
  description?: string;
  parameters: TemplateParameterJSON[];
  content: TemplateContentJSON;
  parentTemplateId?: string;
  inheritance?: TemplateInheritanceJSON;
  compilation?: TemplateCompilationJSON;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    [key: string]: any;
  };
  status: 'draft' | 'published' | 'deprecated';
}
```

### Serialization Rules

1. **Identity Handling**: IDs are serialized as strings
2. **Version Handling**: Versions are serialized as strings
3. **Parameter Handling**: Parameters are serialized as objects
4. **Content Handling**: Content is serialized as structured JSON
5. **Inheritance Handling**: Inheritance is serialized as objects
6. **Compilation Handling**: Compilation is serialized as objects
7. **Metadata**: Metadata is preserved during serialization

### Deserialization Rules

1. **Validation**: All deserialized templates must pass validation
2. **ID Generation**: Missing IDs are auto-generated
3. **Version Validation**: Versions are validated during deserialization
4. **Parameter Reconstruction**: Parameters are properly reconstructed
5. **Content Validation**: Content is validated during deserialization
6. **Inheritance Resolution**: Inheritance relationships are properly restored
7. **Compilation Restoration**: Compilation state is properly restored

## Metadata

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Last Updated** | 2025-09-15 |
| **Author** | Schema Management Domain Team |
| **Status** | Draft |
| **Dependencies** | TemplateParameter, TemplateContent, TemplateInheritance, TemplateCompilation |
| **Complexity** | High |
| **Testing Priority** | Critical |
| **Review Required** | Yes |
| **Documentation** | Complete |
| **Breaking Changes** | None |