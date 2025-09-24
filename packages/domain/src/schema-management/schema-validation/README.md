# Backend-Driven UI Schema Validation System

A comprehensive validation system for backend-driven UI configurations, providing schema validation, security checks, business logic enforcement, and integration with the Store API.

## Features

- ✅ **Master JSON Schema** with comprehensive component definitions
- ✅ **Backend Validation Engine** with JSON Schema support and custom validators
- ✅ **Client-side Validation** for runtime safety
- ✅ **Structured Error Reporting** with path-based error tracking
- ✅ **Store API Integration** for scenario data validation
- ✅ **Nightly Validation Job** for batch re-validation
- ✅ **Debug Inspector** for development and troubleshooting
- ✅ **Schema Versioning** with migration support
- ✅ **Security Validation** with XSS, SQL injection, and URL sanitization
- ✅ **Custom Validators** for business logic and security constraints

## Quick Start

### Basic Validation

```typescript
import { ValidationService } from './schema-validation'

const validationService = ValidationService.create()

const config = {
  version: '1.0.0',
  components: [
    {
      type: 'Button',
      props: { text: 'Click me' },
    },
  ],
  scenarioData: {
    user: { name: 'John', age: 30 },
  },
}

const result = await validationService.validate({ data: config })

if (result.isValid) {
  console.log('Configuration is valid!')
} else {
  console.log('Validation errors:', result.errors)
}
```

### With Custom Validators

```typescript
import { ValidationService } from './schema-validation'
import { SecurityValidator } from './schema-validation'

const validationService = ValidationService.create()

// Add security validation
validationService.addCustomValidator('security', SecurityValidator.createStrict())

const result = await validationService.validate({
  data: config,
  options: {
    customValidators: ['security'],
  },
})
```

### Store API Integration

```typescript
import { ValidationService, StoreValidationAdapter } from './schema-validation'

const validationService = ValidationService.create()
const storeAdapter = StoreValidationAdapter.create(validationService, {
  mode: 'strict',
  schema: {
    'user.name': { kind: 'string', required: true },
    'user.age': { kind: 'number', required: true, min: 0, max: 150 },
  },
})

// Validate store write
const validation = storeAdapter.validateWrite('user.name', { type: 'string', value: 'John' })
if (!validation.isValid) {
  console.log('Store validation failed:', validation.reason)
}
```

### Nightly Validation Job

```typescript
import { NightlyValidationJob, ValidationService } from './schema-validation'

const validationService = ValidationService.create()
const nightlyJob = NightlyValidationJob.create(validationService, {
  batchSize: 10,
  maxConcurrentJobs: 5,
  failThreshold: 5, // 5% error rate
  reportEmailRecipients: ['admin@example.com'],
})

const configs = [
  { id: 'config1', version: '1.0.0', data: config1 },
  { id: 'config2', version: '1.0.0', data: config2 },
]

const jobId = await nightlyJob.start(configs)
console.log('Nightly validation started:', jobId)

// Monitor progress
const status = nightlyJob.getStatus()
console.log('Progress:', status.progress, '%')

// Get final report
const report = nightlyJob.getCurrentReport()
if (report && report.exceededThreshold) {
  console.log('Error rate exceeded threshold!')
}
```

## API Reference

### ValidationService

Main service for validating configurations.

#### Methods

- `validate(request: ValidationRequest)` - Validate a single configuration
- `validateSync(request: ValidationRequest)` - Synchronous validation
- `batchValidate(request: BatchValidationRequest)` - Validate multiple configurations
- `validateWithSchema(data, schema, context)` - Validate against a specific schema
- `formatErrors(result)` - Format validation results
- `generateReport(result)` - Generate JSON report
- `generateHTMLReport(result)` - Generate HTML report

#### Options

```typescript
interface ValidationServiceOptions {
  schemaPath?: string          // Path to custom schema
  customValidators?: Map<string, any>
  strict?: boolean            // Strict validation mode
  maxDepth?: number          // Maximum validation depth
  maxErrors?: number         // Maximum error count
}
```

### ValidationEngine

Core validation engine supporting JSON Schema.

```typescript
import { ValidationEngine } from './schema-validation'

const engine = ValidationEngine.create(schema, {
  customValidators: new Map(),
  maxDepth: 10,
  maxErrors: 100,
})

const result = await engine.validate(data, context)
```

### SecurityValidator

Comprehensive security validation.

```typescript
import { SecurityValidator } from './schema-validation'

const securityValidator = SecurityValidator.createStrict()

// Validate URLs
const urlResult = securityValidator.validateURL('https://example.com/image.jpg')

// Validate image URLs
const imageResult = securityValidator.validateImageURL('https://cdn.example.com/image.png')

// Sanitize input
const sanitized = securityValidator.sanitizeInput('<script>alert("xss")</script>')
```

### DebugInspector

Development debugging and inspection tools.

```typescript
import { DebugInspector } from './schema-validation'

const inspector = DebugInspector.create(validationService, { debugMode: true })

// Inspect validation with debug info
const { result, debugInfo } = await inspector.inspectValidation(data)
console.log('Validation took:', debugInfo.executionTime, 'ms')
console.log('Steps:', debugInfo.steps)

// Run test suite
const testSuite = inspector.generateTestSuiteFromSchema(schema)
const results = inspector.runTestSuite(testSuite)
console.log('Test results:', results)

// Export debug data
const debugData = inspector.exportDebugData()
```

### ErrorFormatter

Format validation results for different consumers.

```typescript
import { ErrorFormatter } from './schema-validation'

const formatter = ErrorFormatter.create({
  includeCode: true,
  includeSeverity: true,
  includeDetails: true,
  sortBy: 'severity',
  filterBySeverity: ['error', 'warning'],
})

// Format for admin UI
const adminUI = formatter.formatForAdminUI(result)

// Format for client runtime
const client = formatter.formatForClientRuntime(result)

// Generate HTML report
const htmlReport = formatter.generateHTMLReport(result)
```

## Schema Format

The system uses a comprehensive JSON Schema for validation:

### Basic Structure

```json
{
  "version": "1.0.0",
  "components": [
    {
      "type": "Button",
      "props": {
        "text": "Click me",
        "onClick": "action:submit"
      }
    }
  ],
  "scenarioData": {
    "user": {
      "name": "John",
      "age": 30
    }
  }
}
```

### Supported Component Types

- **Button** - Interactive buttons with text and actions
- **Label** - Text labels with styling options
- **Text** - Rich text content
- **Image** - Image display with URL validation
- **List** - Lists of components
- **Banner** - Banner components with images
- **Container** - Layout containers
- **Card** - Card components
- **Form** - Form containers
- **Input** - Input fields
- **Select** - Dropdown selects
- **Modal** - Modal dialogs
- **Alert** - Alert messages
- **Progress** - Progress indicators

### Security Considerations

The system includes comprehensive security validation:

- **XSS Prevention** - Blocks script injection attempts
- **SQL Injection Protection** - Detects SQL injection patterns
- **URL Validation** - Validates and sanitizes URLs
- **Protocol Whitelisting** - Only allows safe protocols
- **Domain Blacklisting** - Blocks dangerous domains
- **Component Type Validation** - Whitelists allowed component types
- **Input Sanitization** - Removes dangerous content

## Configuration

### Validation Modes

- **Strict Mode** - Rejects all invalid data
- **Lenient Mode** - Attempts to coerce or use defaults

### Custom Validators

Register custom validators for business logic:

```typescript
const customValidator = {
  validate: async (value, context) => {
    // Custom validation logic
    return SchemaValidationResult.success(context)
  }
}

validationService.addCustomValidator('custom', customValidator)
```

### Schema Versioning

The system supports schema versioning with migrations:

```typescript
import { SchemaVersionManager, SchemaMigrationUtils } from './schema-validation'

const versionManager = SchemaVersionManager.create(defaultVersionHistory)

// Migrate data between versions
const migratedData = await versionManager.migrateData(
  oldData,
  { major: 1, minor: 0, patch: 0 },
  { major: 1, minor: 0, patch: 1 }
)
```

## Integration Examples

### Admin Backend Integration

```typescript
// In your admin backend API
app.post('/api/configs', async (req, res) => {
  const validationService = ValidationService.create()
  const result = await validationService.validate({ data: req.body })

  if (!result.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: result.errors,
    })
  }

  // Save validated config
  const config = await saveConfig(req.body)
  res.json(config)
})
```

### Client-side Runtime Validation

```typescript
// In your client application
import { ClientValidator } from './schema-validation'

const clientValidator = ClientValidator.createFromJSONSchema(masterSchema)

const result = clientValidator.validateSync(config)

if (!result.isValid) {
  // Show validation errors to user
  displayErrors(result.errors)
} else {
  // Render validated config
  renderConfig(config)
}
```

### Store API Integration

```typescript
// Integrate with Store API
const storeAdapter = StoreValidationAdapter.create(validationService, {
  mode: 'strict',
  schema: {
    'cart.total': { kind: 'number', required: true, min: 0 },
    'user.email': { kind: 'string', required: true, pattern: '.+@.+\..+' },
  },
})

store.configureValidation(storeAdapter.getValidationOptions())
```

## Monitoring and Reporting

### Nightly Validation Reports

The nightly validation job generates comprehensive reports:

```typescript
const report = nightlyJob.getCurrentReport()

console.log('Validation Summary:', {
  totalConfigs: report.totalConfigs,
  validConfigs: report.validConfigs,
  errorRate: report.errorRate,
  exceededThreshold: report.exceededThreshold,
})
```

### Debug Inspector

Use the debug inspector for troubleshooting:

```typescript
const inspector = DebugInspector.create(validationService, { debugMode: true })

const { result, debugInfo } = await inspector.inspectValidation(config)

console.log('Validation Steps:', debugInfo.steps)
console.log('Execution Time:', debugInfo.executionTime, 'ms')

// Export debug data for analysis
const debugData = inspector.exportDebugData()
```

## Performance

The validation system is optimized for performance:

- **JSON Schema Caching** - Schemas are cached for reuse
- **Incremental Validation** - Only validates changed parts
- **Batch Processing** - Efficient batch validation
- **Memory Management** - Automatic cleanup of validation state
- **Async Processing** - Non-blocking validation operations

## Error Handling

The system provides comprehensive error handling:

- **Structured Errors** - Consistent error format with paths and codes
- **Error Classification** - Errors, warnings, and info levels
- **Context Preservation** - Maintains validation context throughout
- **Recovery Mechanisms** - Graceful handling of validation failures

## Testing

The system includes comprehensive testing utilities:

```typescript
// Generate test cases from schema
const testSuite = inspector.generateTestSuiteFromSchema(schema)

// Run automated tests
const results = inspector.runTestSuite(testSuite)

// Validate test results
results.passed // Number of passed tests
results.failed // Number of failed tests
results.results // Detailed test results
```

## Contributing

To extend the validation system:

1. **Add New Component Types** - Update the master schema
2. **Create Custom Validators** - Implement business logic validators
3. **Add Security Rules** - Enhance security validation
4. **Extend Error Formatting** - Add new report formats
5. **Schema Migrations** - Add version migration support

## License

This validation system is part of the Backend-Driven UI project.