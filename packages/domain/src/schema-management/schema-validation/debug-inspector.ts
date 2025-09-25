import { SchemaValidationResult, SchemaValidationContext } from './value-objects/validation-result.vo.js'
import { ValidationService } from './validation.service.js'
import { ValidationEngine } from './validation-engine.js'
import { CustomValidatorsRegistry } from './custom-validators.js'

export interface DebugInspectionData {
  keyPaths: string[]
  activeSubscriptions: Array<{
    id: string
    keyPaths: string[]
    subscriber: string
  }>
  patchLog: Array<{
    timestamp: Date
    keyPath: string
    operation: string
    oldValue?: unknown
    newValue?: unknown
  }>
  failedValidations: Array<{
    timestamp: Date
    keyPath: string
    value: unknown
    error: string
    context: SchemaValidationContext
  }>
  validationMetrics: {
    totalValidations: number
    successfulValidations: number
    failedValidations: number
    averageValidationTime: number
    validationErrors: Record<string, number>
  }
}

export interface InspectorConfig {
  maxHistorySize: number
  enableMetrics: boolean
  enablePatchLogging: boolean
  enableValidationLogging: boolean
  debugMode: boolean
}

export interface ValidationTestCase {
  name: string
  input: unknown
  expectedResult: boolean
  expectedErrors?: string[]
  description?: string
}

export interface ValidationTestSuite {
  name: string
  testCases: ValidationTestCase[]
  schema?: any
}

export interface ValidationDebugInfo {
  executionTime: number
  steps: Array<{
    step: string
    duration: number
    result: 'pass' | 'fail'
    message?: string
  }>
  intermediateResults: Array<{
    stage: string
    result: SchemaValidationResult
  }>
}

export class DebugInspector {
  private validationService: ValidationService
  private engine: ValidationEngine
  private customValidators: CustomValidatorsRegistry
  private config: InspectorConfig
  private inspectionData: DebugInspectionData
  private isEnabled: boolean

  constructor(
    validationService: ValidationService,
    config: InspectorConfig = {
      maxHistorySize: 1000,
      enableMetrics: true,
      enablePatchLogging: true,
      enableValidationLogging: true,
      debugMode: false,
    },
  ) {
    this.validationService = validationService
    this.engine = ValidationEngine.create(validationService.getSchema())
    this.customValidators = new CustomValidatorsRegistry()
    this.config = config
    this.isEnabled = config.debugMode

    this.inspectionData = {
      keyPaths: [],
      activeSubscriptions: [],
      patchLog: [],
      failedValidations: [],
      validationMetrics: {
        totalValidations: 0,
        successfulValidations: 0,
        failedValidations: 0,
        averageValidationTime: 0,
        validationErrors: {},
      },
    }
  }

  public enable(): void {
    this.isEnabled = true
  }

  public disable(): void {
    this.isEnabled = false
  }

  public isDebugEnabled(): boolean {
    return this.isEnabled
  }

  public async inspectValidation(
    data: unknown,
    context?: SchemaValidationContext,
    debugName?: string,
  ): Promise<{
    result: SchemaValidationResult
    debugInfo: ValidationDebugInfo
  }> {
    if (!this.isEnabled) {
      const result = await this.validationService.validate({ data, context })
      return { result, debugInfo: { executionTime: 0, steps: [], intermediateResults: [] } }
    }

    const startTime = Date.now()
    const steps: ValidationDebugInfo['steps'] = []
    const intermediateResults: ValidationDebugInfo['intermediateResults'] = []

    this.recordStep(steps, 'Validation started', startTime)

    // Step 1: Basic schema validation
    const schemaValidationStart = Date.now()
    const schemaResult = await this.engine.validate(data, context)
    this.recordStep(steps, 'Schema validation', schemaValidationStart, schemaResult.isValid ? 'pass' : 'fail')
    intermediateResults.push({ stage: 'schema_validation', result: schemaResult })

    // Step 2: Custom validators
    let finalResult = schemaResult
    if (schemaResult.isValid) {
      const customValidationStart = Date.now()
      const customValidators = this.customValidators.getAll()

      for (const [name, validator] of customValidators) {
        try {
          const customResult = await validator.validate(data, context)
          finalResult = finalResult.merge(customResult)

          if (!customResult.isValid) {
            this.recordStep(steps, `Custom validator: ${name}`, customValidationStart, 'fail', customResult.errors[0]?.message)
          } else {
            this.recordStep(steps, `Custom validator: ${name}`, customValidationStart, 'pass')
          }
        } catch (error) {
          this.recordStep(steps, `Custom validator: ${name}`, customValidationStart, 'fail', error instanceof Error ? error.message : 'Unknown error')
        }
      }
    }

    const executionTime = Date.now() - startTime
    this.recordStep(steps, 'Validation completed', startTime, finalResult.isValid ? 'pass' : 'fail')

    // Update metrics
    if (this.config.enableMetrics) {
      this.updateValidationMetrics(finalResult, executionTime)
    }

    // Log failed validation if enabled
    if (this.config.enableValidationLogging && !finalResult.isValid) {
      this.logFailedValidation(data, finalResult, context, debugName)
    }

    return {
      result: finalResult,
      debugInfo: {
        executionTime,
        steps,
        intermediateResults,
      },
    }
  }

  public runTestSuite(testSuite: ValidationTestSuite): {
    passed: number
    failed: number
    results: Array<{
      testCase: ValidationTestCase
      result: boolean
      errors: string[]
      executionTime: number
    }>
  } {
    if (!this.isEnabled) {
      return { passed: 0, failed: 0, results: [] }
    }

    const results = []
    let passed = 0
    let failed = 0

    for (const testCase of testSuite.testCases) {
      const startTime = Date.now()
      const validationEngine = testSuite.schema
        ? ValidationEngine.create(testSuite.schema)
        : this.engine

      const result = validationEngine.validateSync({
        data: testCase.input,
        options: { strict: true },
      })

      const executionTime = Date.now() - startTime
      const testPassed = result.isValid === testCase.expectedResult

      if (testPassed) {
        passed++
      } else {
        failed++
      }

      results.push({
        testCase,
        result: testPassed,
        errors: result.errors.map((e) => e.message),
        executionTime,
      })
    }

    return { passed, failed, results }
  }

  public getInspectionData(): DebugInspectionData {
    return { ...this.inspectionData }
  }

  public getKeyPaths(): string[] {
    return [...this.inspectionData.keyPaths]
  }

  public getActiveSubscriptions(): Array<{
    id: string
    keyPaths: string[]
    subscriber: string
  }> {
    return [...this.inspectionData.activeSubscriptions]
  }

  public getPatchLog(limit?: number): Array<{
    timestamp: Date
    keyPath: string
    operation: string
    oldValue?: unknown
    newValue?: unknown
  }> {
    const log = [...this.inspectionData.patchLog]
    return limit ? log.slice(-limit) : log
  }

  public getFailedValidations(limit?: number): Array<{
    timestamp: Date
    keyPath: string
    value: unknown
    error: string
    context: SchemaValidationContext
  }> {
    const log = [...this.inspectionData.failedValidations]
    return limit ? log.slice(-limit) : log
  }

  public getValidationMetrics(): DebugInspectionData['validationMetrics'] {
    return { ...this.inspectionData.validationMetrics }
  }

  public clearInspectionData(): void {
    this.inspectionData = {
      keyPaths: [],
      activeSubscriptions: [],
      patchLog: [],
      failedValidations: [],
      validationMetrics: {
        totalValidations: 0,
        successfulValidations: 0,
        failedValidations: 0,
        averageValidationTime: 0,
        validationErrors: {},
      },
    }
  }

  public recordKeyPath(keyPath: string): void {
    if (!this.inspectionData.keyPaths.includes(keyPath)) {
      this.inspectionData.keyPaths.push(keyPath)
    }
  }

  public recordSubscription(
    id: string,
    keyPaths: string[],
    subscriber: string,
  ): void {
    const subscription = {
      id,
      keyPaths: [...keyPaths],
      subscriber,
    }

    this.inspectionData.activeSubscriptions.push(subscription)
  }

  public removeSubscription(id: string): void {
    this.inspectionData.activeSubscriptions = this.inspectionData.activeSubscriptions.filter(
      (sub) => sub.id !== id,
    )
  }

  public recordPatch(
    keyPath: string,
    operation: string,
    oldValue?: unknown,
    newValue?: unknown,
  ): void {
    if (!this.config.enablePatchLogging) return

    const patch = {
      timestamp: new Date(),
      keyPath,
      operation,
      oldValue,
      newValue,
    }

    this.inspectionData.patchLog.push(patch)

    // Trim to max history size
    if (this.inspectionData.patchLog.length > this.config.maxHistorySize) {
      this.inspectionData.patchLog = this.inspectionData.patchLog.slice(-this.config.maxHistorySize)
    }
  }

  public generateTestSuiteFromSchema(schema: any): ValidationTestSuite {
    const testCases: ValidationTestCase[] = []

    // Generate test cases based on schema structure
    if (schema.type === 'object' && schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        testCases.push({
          name: `Valid ${propName}`,
          input: this.generateValidValueForSchema(propSchema),
          expectedResult: true,
          description: `Valid value for property ${propName}`,
        })

        testCases.push({
          name: `Invalid ${propName}`,
          input: this.generateInvalidValueForSchema(propSchema),
          expectedResult: false,
          description: `Invalid value for property ${propName}`,
        })
      }
    }

    return {
      name: `Auto-generated from schema (${Date.now()})`,
      testCases,
      schema,
    }
  }

  public exportDebugData(): string {
    return JSON.stringify(this.inspectionData, null, 2)
  }

  public importDebugData(data: string): void {
    try {
      const parsed = JSON.parse(data)
      this.inspectionData = { ...parsed }
    } catch (error) {
      throw new Error(`Failed to import debug data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  public generateHTMLReport(): string {
    const data = this.inspectionData

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Validation Debug Inspector</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { border-bottom: 2px solid #333; padding-bottom: 5px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .metric { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .metric h3 { margin: 0 0 10px 0; }
        .metric .value { font-size: 24px; font-weight: bold; }
        .error-list { max-height: 400px; overflow-y: auto; }
        .error-item { border: 1px solid #ddd; margin: 5px 0; padding: 10px; }
        .error-code { font-weight: bold; color: #c62828; }
        .error-message { margin: 5px 0; }
        .error-path { font-family: monospace; background: #f0f0f0; padding: 2px 4px; }
        pre { background: #f8f8f8; padding: 10px; border: 1px solid #ddd; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Validation Debug Inspector</h1>

    <div class="section">
        <h2>Validation Metrics</h2>
        <div class="metrics">
            <div class="metric">
                <h3>Total Validations</h3>
                <div class="value">${data.validationMetrics.totalValidations}</div>
            </div>
            <div class="metric">
                <h3>Successful</h3>
                <div class="value">${data.validationMetrics.successfulValidations}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value">${data.validationMetrics.failedValidations}</div>
            </div>
            <div class="metric">
                <h3>Average Time</h3>
                <div class="value">${data.validationMetrics.averageValidationTime.toFixed(2)}ms</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Active Key Paths (${data.keyPaths.length})</h2>
        <pre>${data.keyPaths.join('\n')}</pre>
    </div>

    <div class="section">
        <h2>Active Subscriptions (${data.activeSubscriptions.length})</h2>
        <div class="error-list">
            ${data.activeSubscriptions
              .map(
                (sub) => `
                <div class="error-item">
                    <div class="error-code">ID: ${sub.id}</div>
                    <div class="error-message">Subscriber: ${sub.subscriber}</div>
                    <div class="error-path">Paths: ${sub.keyPaths.join(', ')}</div>
                </div>
            `,
              )
              .join('')}
        </div>
    </div>

    <div class="section">
        <h2>Recent Patches (${data.patchLog.length})</h2>
        <div class="error-list">
            ${data.patchLog
              .slice(-10)
              .map(
                (patch) => `
                <div class="error-item">
                    <div class="error-code">${patch.timestamp.toISOString()}</div>
                    <div class="error-message">${patch.operation}: ${patch.keyPath}</div>
                    <div class="error-path">Old: ${JSON.stringify(patch.oldValue)}</div>
                    <div class="error-path">New: ${JSON.stringify(patch.newValue)}</div>
                </div>
            `,
              )
              .join('')}
        </div>
    </div>

    <div class="section">
        <h2>Failed Validations (${data.failedValidations.length})</h2>
        <div class="error-list">
            ${data.failedValidations
              .slice(-5)
              .map(
                (failure) => `
                <div class="error-item">
                    <div class="error-code">${failure.timestamp.toISOString()}</div>
                    <div class="error-message">${failure.error}</div>
                    <div class="error-path">Path: ${failure.keyPath}</div>
                    <div class="error-path">Value: ${JSON.stringify(failure.value)}</div>
                </div>
            `,
              )
              .join('')}
        </div>
    </div>

    <div class="section">
        <h2>Error Distribution</h2>
        <pre>${JSON.stringify(data.validationMetrics.validationErrors, null, 2)}</pre>
    </div>
</body>
</html>`
  }

  private recordStep(
    steps: ValidationDebugInfo['steps'],
    step: string,
    startTime: number,
    result: 'pass' | 'fail',
    message?: string,
  ): void {
    const duration = Date.now() - startTime
    steps.push({
      step,
      duration,
      result,
      message,
    })
  }

  private updateValidationMetrics(result: SchemaValidationResult, executionTime: number): void {
    this.inspectionData.validationMetrics.totalValidations++

    if (result.isValid) {
      this.inspectionData.validationMetrics.successfulValidations++
    } else {
      this.inspectionData.validationMetrics.failedValidations++
    }

    // Update average validation time
    const totalTime = this.inspectionData.validationMetrics.averageValidationTime *
      (this.inspectionData.validationMetrics.totalValidations - 1) + executionTime
    this.inspectionData.validationMetrics.averageValidationTime = totalTime / this.inspectionData.validationMetrics.totalValidations

    // Update error counts
    for (const error of result.errors) {
      this.inspectionData.validationMetrics.validationErrors[error.code] =
        (this.inspectionData.validationMetrics.validationErrors[error.code] || 0) + 1
    }
  }

  private logFailedValidation(
    data: unknown,
    result: SchemaValidationResult,
    context?: SchemaValidationContext,
    debugName?: string,
  ): void {
    for (const error of result.errors) {
      this.inspectionData.failedValidations.push({
        timestamp: new Date(),
        keyPath: error.path || '',
        value: data,
        error: error.message,
        context: context || { timestamp: new Date() },
      })

      // Trim to max history size
      if (this.inspectionData.failedValidations.length > this.config.maxHistorySize) {
        this.inspectionData.failedValidations = this.inspectionData.failedValidations.slice(-this.config.maxHistorySize)
      }
    }
  }

  private generateValidValueForSchema(schema: any): unknown {
    switch (schema.type) {
      case 'string':
        return 'test_value'
      case 'number':
        return 42
      case 'integer':
        return 42
      case 'boolean':
        return true
      case 'array':
        return [this.generateValidValueForSchema(schema.items || { type: 'string' })]
      case 'object':
        const obj: Record<string, unknown> = {}
        if (schema.properties) {
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            obj[key] = this.generateValidValueForSchema(propSchema)
          }
        }
        return obj
      default:
        return 'test_value'
    }
  }

  private generateInvalidValueForSchema(schema: any): unknown {
    switch (schema.type) {
      case 'string':
        return 123 // Invalid: number instead of string
      case 'number':
        return 'not_a_number' // Invalid: string instead of number
      case 'boolean':
        return 'true' // Invalid: string instead of boolean
      case 'array':
        return 'not_an_array' // Invalid: string instead of array
      case 'object':
        return [] // Invalid: array instead of object
      default:
        return null
    }
  }

  public static create(
    validationService: ValidationService,
    config?: InspectorConfig,
  ): DebugInspector {
    return new DebugInspector(validationService, config)
  }
}