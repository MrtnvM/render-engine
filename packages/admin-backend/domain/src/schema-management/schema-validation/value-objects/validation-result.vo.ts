import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'
import { SchemaValidationSeverity } from '../../shared/enums/index.js'

export interface SchemaValidationError {
  id: string
  code: string
  message: string
  path?: string
  severity: SchemaValidationSeverity.ERROR
  details?: Record<string, unknown>
  timestamp: Date
}

export interface SchemaValidationWarning {
  id: string
  code: string
  message: string
  path?: string
  severity: SchemaValidationSeverity.WARNING
  details?: Record<string, unknown>
  timestamp: Date
}

export interface SchemaValidationInfo {
  id: string
  code: string
  message: string
  path?: string
  severity: SchemaValidationSeverity.INFO
  details?: Record<string, unknown>
  timestamp: Date
}

export interface SchemaValidationContext {
  path?: string
  target?: any
  validator?: string
  timestamp: Date
  [key: string]: unknown
}

export interface SchemaValidationResultMetadata {
  timestamp: Date
  validator: string
  version: string
  duration?: number
  [key: string]: unknown
}

export interface SchemaValidationResultProps {
  isValid: boolean
  errors: SchemaValidationError[]
  warnings: SchemaValidationWarning[]
  info: SchemaValidationInfo[]
  context?: SchemaValidationContext | null
  duration?: number | null
  metadata: SchemaValidationResultMetadata
}

export interface SchemaValidationResultJSON {
  isValid: boolean
  errors: SchemaValidationError[]
  warnings: SchemaValidationWarning[]
  info: SchemaValidationInfo[]
  context?: SchemaValidationContext
  duration?: number
  metadata: {
    timestamp: string
    validator: string
    version: string
    duration?: number
    [key: string]: unknown
  }
}

export interface SchemaValidationSummary {
  isValid: boolean
  errorCount: number
  warningCount: number
  infoCount: number
  totalMessageCount: number
  severity: SchemaValidationSeverity
  duration?: number
}

export interface SchemaValidationReport {
  summary: SchemaValidationSummary
  errors: SchemaValidationError[]
  warnings: SchemaValidationWarning[]
  info: SchemaValidationInfo[]
  context?: SchemaValidationContext
  recommendations: string[]
}

export interface ParameterUsage {
  parameterName: string
  usageCount: number
  locations: string[]
  isRequired: boolean
  hasDefault: boolean
}

export interface TemplateDependency {
  templateId: string
  templateName: string
  dependencyType: 'parent' | 'child' | 'reference'
  strength: 'strong' | 'weak'
}

export class SchemaValidationResult extends ValueObject<SchemaValidationResultProps> {
  private constructor(props: SchemaValidationResultProps) {
    super(props)
  }

  get isValid(): boolean {
    return this.value.isValid
  }

  get errors(): SchemaValidationError[] {
    return this.value.errors
  }

  get warnings(): SchemaValidationWarning[] {
    return this.value.warnings
  }

  get info(): SchemaValidationInfo[] {
    return this.value.info
  }

  get context(): SchemaValidationContext | null {
    return this.value.context || null
  }

  get duration(): number | null {
    return this.value.duration || null
  }

  get metadata(): SchemaValidationResultMetadata {
    return this.value.metadata
  }

  get hasErrors(): boolean {
    return this.errors.length > 0
  }

  get hasWarnings(): boolean {
    return this.warnings.length > 0
  }

  get hasInfo(): boolean {
    return this.info.length > 0
  }

  get errorCount(): number {
    return this.errors.length
  }

  get warningCount(): number {
    return this.warnings.length
  }

  get infoCount(): number {
    return this.info.length
  }

  get totalMessageCount(): number {
    return this.errorCount + this.warningCount + this.infoCount
  }

  get severityLevel(): SchemaValidationSeverity {
    if (this.hasErrors) return SchemaValidationSeverity.ERROR
    if (this.hasWarnings) return SchemaValidationSeverity.WARNING
    return SchemaValidationSeverity.INFO
  }

  get hasCriticalErrors(): boolean {
    return this.errors.some((error) => error.code.includes('critical') || error.code.includes('fatal'))
  }

  public static success(
    context?: SchemaValidationContext,
    metadata?: Partial<SchemaValidationResultMetadata>,
  ): SchemaValidationResult {
    const completeMetadata: SchemaValidationResultMetadata = {
      timestamp: new Date(),
      validator: 'unknown',
      version: '1.0.0',
      ...metadata,
    }

    return new SchemaValidationResult({
      isValid: true,
      errors: [],
      warnings: [],
      info: [],
      context,
      metadata: completeMetadata,
    })
  }

  public static failure(
    errors: SchemaValidationError[],
    context?: SchemaValidationContext,
    metadata?: Partial<SchemaValidationResultMetadata>,
  ): SchemaValidationResult {
    if (errors.length === 0) {
      throw new Error('At least one error is required for a failed validation result')
    }

    const completeMetadata: SchemaValidationResultMetadata = {
      timestamp: new Date(),
      validator: 'unknown',
      version: '1.0.0',
      ...metadata,
    }

    return new SchemaValidationResult({
      isValid: false,
      errors,
      warnings: [],
      info: [],
      context,
      metadata: completeMetadata,
    })
  }

  public static withErrors(
    errors: SchemaValidationError[],
    baseResult?: SchemaValidationResult,
  ): SchemaValidationResult {
    const base = baseResult || SchemaValidationResult.success()

    const newErrors = [...base.errors, ...errors]
    const isValid = newErrors.length === 0

    return new SchemaValidationResult({
      ...base.value,
      isValid,
      errors: newErrors,
    })
  }

  public static withWarnings(
    warnings: SchemaValidationWarning[],
    baseResult?: SchemaValidationResult,
  ): SchemaValidationResult {
    const base = baseResult || SchemaValidationResult.success()

    const newWarnings = [...base.warnings, ...warnings]

    return new SchemaValidationResult({
      ...base.value,
      warnings: newWarnings,
    })
  }

  public static withInfo(info: SchemaValidationInfo[], baseResult?: SchemaValidationResult): SchemaValidationResult {
    const base = baseResult || SchemaValidationResult.success()

    const newInfo = [...base.info, ...info]

    return new SchemaValidationResult({
      ...base.value,
      info: newInfo,
    })
  }

  public addError(error: SchemaValidationError): SchemaValidationResult {
    const newErrors = [...this.errors, error]
    const newMetadata = {
      ...this.metadata,
      timestamp: new Date(),
    }

    return new SchemaValidationResult({
      ...this.value,
      isValid: false,
      errors: newErrors,
      metadata: newMetadata,
    })
  }

  public addWarning(warning: SchemaValidationWarning): SchemaValidationResult {
    const newWarnings = [...this.warnings, warning]
    const newMetadata = {
      ...this.metadata,
      timestamp: new Date(),
    }

    return new SchemaValidationResult({
      ...this.value,
      warnings: newWarnings,
      metadata: newMetadata,
    })
  }

  public addInfo(info: SchemaValidationInfo): SchemaValidationResult {
    const newInfo = [...this.info, info]
    const newMetadata = {
      ...this.metadata,
      timestamp: new Date(),
    }

    return new SchemaValidationResult({
      ...this.value,
      info: newInfo,
      metadata: newMetadata,
    })
  }

  public removeMessage(messageId: string): SchemaValidationResult {
    const allMessages = [
      ...this.errors.map((e) => ({ ...e, type: 'error' as const })),
      ...this.warnings.map((w) => ({ ...w, type: 'warning' as const })),
      ...this.info.map((i) => ({ ...i, type: 'info' as const })),
    ]

    const filteredMessages = allMessages.filter((msg) => msg.id !== messageId)

    const newErrors = filteredMessages.filter((m) => m.type === 'error') as SchemaValidationError[]
    const newWarnings = filteredMessages.filter((m) => m.type === 'warning') as SchemaValidationWarning[]
    const newInfo = filteredMessages.filter((m) => m.type === 'info') as SchemaValidationInfo[]
    const isValid = newErrors.length === 0

    const newMetadata = {
      ...this.metadata,
      timestamp: new Date(),
    }

    return new SchemaValidationResult({
      ...this.value,
      isValid,
      errors: newErrors,
      warnings: newWarnings,
      info: newInfo,
      metadata: newMetadata,
    })
  }

  public getMessageById(
    messageId: string,
  ): SchemaValidationError | SchemaValidationWarning | SchemaValidationInfo | null {
    const allMessages = [...this.errors, ...this.warnings, ...this.info]

    return allMessages.find((msg) => msg.id === messageId) || null
  }

  public getMessagesBySeverity(
    severity: SchemaValidationSeverity,
  ): (SchemaValidationError | SchemaValidationWarning | SchemaValidationInfo)[] {
    const allMessages = [...this.errors, ...this.warnings, ...this.info]

    return allMessages.filter((msg) => msg.severity === severity)
  }

  public getMessagesByPath(path: string): (SchemaValidationError | SchemaValidationWarning | SchemaValidationInfo)[] {
    const allMessages = [...this.errors, ...this.warnings, ...this.info]

    return allMessages.filter((msg) => msg.path === path)
  }

  public getErrorMessages(): string[] {
    return this.errors.map((error) => error.message)
  }

  public getWarningMessages(): string[] {
    return this.warnings.map((warning) => warning.message)
  }

  public getInfoMessages(): string[] {
    return this.info.map((info) => info.message)
  }

  public getAllMessages(): string[] {
    return [...this.getErrorMessages(), ...this.getWarningMessages(), ...this.getInfoMessages()]
  }

  public merge(other: SchemaValidationResult): SchemaValidationResult {
    const mergedErrors = [...this.errors, ...other.errors]
    const mergedWarnings = [...this.warnings, ...other.warnings]
    const mergedInfo = [...this.info, ...other.info]
    const isValid = mergedErrors.length === 0

    const mergedDuration =
      this.duration && other.duration ? this.duration + other.duration : this.duration || other.duration

    const mergedMetadata: SchemaValidationResultMetadata = {
      ...this.metadata,
      timestamp: new Date(),
      duration: mergedDuration || undefined,
      validator: `${this.metadata.validator} + ${other.metadata.validator}`,
    }

    return new SchemaValidationResult({
      isValid,
      errors: mergedErrors,
      warnings: mergedWarnings,
      info: mergedInfo,
      duration: mergedDuration,
      metadata: mergedMetadata,
    })
  }

  public filter(
    predicate: (message: SchemaValidationError | SchemaValidationWarning | SchemaValidationInfo) => boolean,
  ): SchemaValidationResult {
    const allMessages = [
      ...this.errors.map((e) => ({ ...e, type: 'error' as const })),
      ...this.warnings.map((w) => ({ ...w, type: 'warning' as const })),
      ...this.info.map((i) => ({ ...i, type: 'info' as const })),
    ]

    const filteredMessages = allMessages.filter(predicate)

    const newErrors = filteredMessages.filter((m) => m.type === 'error') as SchemaValidationError[]
    const newWarnings = filteredMessages.filter((m) => m.type === 'warning') as SchemaValidationWarning[]
    const newInfo = filteredMessages.filter((m) => m.type === 'info') as SchemaValidationInfo[]
    const isValid = newErrors.length === 0

    const newMetadata = {
      ...this.metadata,
      timestamp: new Date(),
    }

    return new SchemaValidationResult({
      ...this.value,
      isValid,
      errors: newErrors,
      warnings: newWarnings,
      info: newInfo,
      metadata: newMetadata,
    })
  }

  public groupByPath(): Record<string, SchemaValidationResult> {
    const groups: Record<string, SchemaValidationResult> = {}

    // Messages without path
    const noPathMessages = [
      ...this.errors.filter((e) => !e.path),
      ...this.warnings.filter((w) => !w.path),
      ...this.info.filter((i) => !i.path),
    ]

    if (noPathMessages.length > 0) {
      groups['no-path'] = new SchemaValidationResult({
        ...this.value,
        errors: noPathMessages.filter((m) => m.severity === SchemaValidationSeverity.ERROR) as SchemaValidationError[],
        warnings: noPathMessages.filter(
          (m) => m.severity === SchemaValidationSeverity.WARNING,
        ) as SchemaValidationWarning[],
        info: noPathMessages.filter((m) => m.severity === SchemaValidationSeverity.INFO) as SchemaValidationInfo[],
        isValid: noPathMessages.every((m) => m.severity !== SchemaValidationSeverity.ERROR),
      })
    }

    // Group by path
    const paths = new Set([
      ...this.errors.map((e) => e.path).filter((p): p is string => p !== undefined),
      ...this.warnings.map((w) => w.path).filter((p): p is string => p !== undefined),
      ...this.info.map((i) => i.path).filter((p): p is string => p !== undefined),
    ])

    paths.forEach((path) => {
      const pathErrors = this.errors.filter((e) => e.path === path)
      const pathWarnings = this.warnings.filter((w) => w.path === path)
      const pathInfo = this.info.filter((i) => i.path === path)

      groups[path] = new SchemaValidationResult({
        ...this.value,
        errors: pathErrors,
        warnings: pathWarnings,
        info: pathInfo,
        isValid: pathErrors.length === 0,
      })
    })

    return groups
  }

  public sortBySeverity(): SchemaValidationResult {
    const allMessages = [
      ...this.errors.map((e) => ({ ...e, type: 'error' as const, order: 0 })),
      ...this.warnings.map((w) => ({ ...w, type: 'warning' as const, order: 1 })),
      ...this.info.map((i) => ({ ...i, type: 'info' as const, order: 2 })),
    ]

    allMessages.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.timestamp.getTime() - b.timestamp.getTime()
    })

    const newErrors = allMessages.filter((m) => m.type === 'error') as SchemaValidationError[]
    const newWarnings = allMessages.filter((m) => m.type === 'warning') as SchemaValidationWarning[]
    const newInfo = allMessages.filter((m) => m.type === 'info') as SchemaValidationInfo[]
    const isValid = newErrors.length === 0

    const newMetadata = {
      ...this.metadata,
      timestamp: new Date(),
    }

    return new SchemaValidationResult({
      ...this.value,
      isValid,
      errors: newErrors,
      warnings: newWarnings,
      info: newInfo,
      metadata: newMetadata,
    })
  }

  public hasMessageWithCode(code: string): boolean {
    const allMessages = [...this.errors, ...this.warnings, ...this.info]

    return allMessages.some((msg) => msg.code === code)
  }

  public getMessagesWithCode(code: string): (SchemaValidationError | SchemaValidationWarning | SchemaValidationInfo)[] {
    const allMessages = [...this.errors, ...this.warnings, ...this.info]

    return allMessages.filter((msg) => msg.code === code)
  }

  public toSummary(): SchemaValidationSummary {
    return {
      isValid: this.isValid,
      errorCount: this.errorCount,
      warningCount: this.warningCount,
      infoCount: this.infoCount,
      totalMessageCount: this.totalMessageCount,
      severity: this.severityLevel,
      duration: this.duration || undefined,
    }
  }

  public toReport(): SchemaValidationReport {
    const recommendations = this.generateRecommendations()

    return {
      summary: this.toSummary(),
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
      context: this.context || undefined,
      recommendations,
    }
  }

  public toPrimitive(): SchemaValidationResultProps {
    return this.value
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    if (this.hasErrors) {
      recommendations.push('Fix all errors before proceeding')

      if (this.errorCount > 5) {
        recommendations.push('Consider breaking down validation into smaller chunks')
      }
    }

    if (this.hasWarnings) {
      recommendations.push('Review warnings for potential improvements')
    }

    if (this.duration && this.duration > 5000) {
      recommendations.push('Validation took longer than expected. Consider optimization.')
    }

    if (this.hasCriticalErrors) {
      recommendations.push('Critical errors detected. Immediate attention required.')
    }

    return recommendations
  }
}
