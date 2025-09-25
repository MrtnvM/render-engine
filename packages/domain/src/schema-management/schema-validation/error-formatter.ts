import { SchemaValidationResult, SchemaValidationError, SchemaValidationReport } from './value-objects/validation-result.vo.js'

export interface FormattedError {
  path: string
  expected: string
  received: unknown
  message: string
  code?: string
  severity: string
  details?: Record<string, unknown>
}

export interface FormattedValidationReport {
  isValid: boolean
  summary: {
    totalErrors: number
    totalWarnings: number
    totalInfo: number
    hasCriticalErrors: boolean
    duration?: number
  }
  errors: FormattedError[]
  warnings: FormattedError[]
  info: FormattedError[]
  recommendations: string[]
}

export interface ErrorFormattingOptions {
  includeCode?: boolean
  includeSeverity?: boolean
  includeDetails?: boolean
  includeStackTrace?: boolean
  maxMessageLength?: number
  groupByPath?: boolean
  sortBy?: 'path' | 'severity' | 'message'
  filterBySeverity?: string[]
}

export class ErrorFormatter {
  private options: Required<ErrorFormattingOptions>

  constructor(options: ErrorFormattingOptions = {}) {
    this.options = {
      includeCode: options.includeCode ?? true,
      includeSeverity: options.includeSeverity ?? true,
      includeDetails: options.includeDetails ?? true,
      includeStackTrace: options.includeStackTrace ?? false,
      maxMessageLength: options.maxMessageLength ?? 200,
      groupByPath: options.groupByPath ?? false,
      sortBy: options.sortBy ?? 'path',
      filterBySeverity: options.filterBySeverity ?? ['error', 'warning', 'info'],
    }
  }

  public formatError(error: SchemaValidationError): FormattedError {
    const formatted: FormattedError = {
      path: error.path || 'unknown',
      expected: this.extractExpectedValue(error),
      received: this.extractReceivedValue(error),
      message: this.truncateMessage(error.message),
      severity: error.severity,
    }

    if (this.options.includeCode && error.code) {
      formatted.code = error.code
    }

    if (this.options.includeDetails && error.details) {
      formatted.details = error.details
    }

    return formatted
  }

  public formatReport(result: SchemaValidationResult): FormattedValidationReport {
    const errors = result.errors.map((error) => this.formatError(error))
    const warnings = result.warnings.map((warning) => this.formatError(warning))
    const info = result.info.map((info) => this.formatError(info))

    // Apply filtering
    const filteredErrors = this.options.filterBySeverity.includes('error') ? errors : []
    const filteredWarnings = this.options.filterBySeverity.includes('warning') ? warnings : []
    const filteredInfo = this.options.filterBySeverity.includes('info') ? info : []

    // Apply sorting
    const allFormatted = [...filteredErrors, ...filteredWarnings, ...filteredInfo]
    const sortedFormatted = this.sortFormattedErrors(allFormatted)

    // Group by path if requested
    let finalErrors: FormattedError[]
    let finalWarnings: FormattedError[]
    let finalInfo: FormattedError[]

    if (this.options.groupByPath) {
      const grouped = this.groupErrorsByPath(sortedFormatted)
      finalErrors = grouped.errors
      finalWarnings = grouped.warnings
      finalInfo = grouped.info
    } else {
      finalErrors = sortedFormatted.filter((e) => e.severity === 'error')
      finalWarnings = sortedFormatted.filter((w) => w.severity === 'warning')
      finalInfo = sortedFormatted.filter((i) => i.severity === 'info')
    }

    const hasCriticalErrors = result.hasCriticalErrors
    const recommendations = this.generateRecommendations(result)

    return {
      isValid: result.isValid,
      summary: {
        totalErrors: finalErrors.length,
        totalWarnings: finalWarnings.length,
        totalInfo: finalInfo.length,
        hasCriticalErrors,
        duration: result.duration || undefined,
      },
      errors: finalErrors,
      warnings: finalWarnings,
      info: finalInfo,
      recommendations,
    }
  }

  public formatForAdminUI(result: SchemaValidationResult): object {
    const formatted = this.formatReport(result)

    return {
      isValid: formatted.isValid,
      hasErrors: formatted.summary.totalErrors > 0,
      hasWarnings: formatted.summary.totalWarnings > 0,
      hasCriticalErrors: formatted.summary.hasCriticalErrors,
      errorCount: formatted.summary.totalErrors,
      warningCount: formatted.summary.totalWarnings,
      infoCount: formatted.summary.totalInfo,
      errors: formatted.errors.map((error) => ({
        path: error.path,
        message: error.message,
        code: error.code,
        severity: error.severity,
        expected: error.expected,
        received: this.formatValue(error.received),
        details: error.details,
      })),
      warnings: formatted.warnings.map((warning) => ({
        path: warning.path,
        message: warning.message,
        code: warning.code,
        severity: warning.severity,
        expected: warning.expected,
        received: this.formatValue(warning.received),
        details: warning.details,
      })),
      recommendations: formatted.recommendations,
    }
  }

  public formatForClientRuntime(result: SchemaValidationResult): object {
    const formatted = this.formatReport(result)

    return {
      valid: formatted.isValid,
      errors: formatted.errors.map((error) => ({
        path: error.path,
        message: error.message,
        type: 'error',
      })),
      warnings: formatted.warnings.map((warning) => ({
        path: warning.path,
        message: warning.message,
        type: 'warning',
      })),
    }
  }

  public formatForLogging(result: SchemaValidationResult): object {
    const formatted = this.formatReport(result)

    return {
      timestamp: new Date().toISOString(),
      isValid: formatted.isValid,
      summary: formatted.summary,
      errorDetails: formatted.errors.map((error) => ({
        path: error.path,
        message: error.message,
        code: error.code,
        stack: error.details?.stack,
      })),
      warningDetails: formatted.warnings.map((warning) => ({
        path: warning.path,
        message: warning.message,
        code: warning.code,
        stack: warning.details?.stack,
      })),
    }
  }

  public generateJSONReport(result: SchemaValidationResult): string {
    const formatted = this.formatReport(result)
    return JSON.stringify(formatted, null, 2)
  }

  public generateHTMLReport(result: SchemaValidationResult): string {
    const formatted = this.formatReport(result)

    const errorRows = formatted.errors
      .map(
        (error) => `
      <tr class="error-row">
        <td class="path">${this.escapeHtml(error.path)}</td>
        <td class="expected">${this.escapeHtml(error.expected)}</td>
        <td class="received">${this.escapeHtml(this.formatValue(error.received))}</td>
        <td class="message">${this.escapeHtml(error.message)}</td>
        <td class="code">${this.escapeHtml(error.code || '')}</td>
      </tr>`,
      )
      .join('')

    const warningRows = formatted.warnings
      .map(
        (warning) => `
      <tr class="warning-row">
        <td class="path">${this.escapeHtml(warning.path)}</td>
        <td class="expected">${this.escapeHtml(warning.expected)}</td>
        <td class="received">${this.escapeHtml(this.formatValue(warning.received))}</td>
        <td class="message">${this.escapeHtml(warning.message)}</td>
        <td class="code">${this.escapeHtml(warning.code || '')}</td>
      </tr>`,
      )
      .join('')

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
        .error-row { background: #ffebee; }
        .warning-row { background: #fff3e0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
        .error { color: #c62828; }
        .warning { color: #ef6c00; }
        .recommendations { background: #e8f5e8; padding: 15px; margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Validation Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Valid:</strong> ${formatted.isValid ? 'Yes' : 'No'}</p>
        <p><strong>Errors:</strong> ${formatted.summary.totalErrors}</p>
        <p><strong>Warnings:</strong> ${formatted.summary.totalWarnings}</p>
        <p><strong>Info:</strong> ${formatted.summary.totalInfo}</p>
        <p><strong>Critical Errors:</strong> ${formatted.summary.hasCriticalErrors ? 'Yes' : 'No'}</p>
        ${formatted.summary.duration ? `<p><strong>Duration:</strong> ${formatted.summary.duration}ms</p>` : ''}
    </div>

    ${formatted.errors.length > 0 ? `
    <h2>Errors</h2>
    <table>
        <thead>
            <tr>
                <th>Path</th>
                <th>Expected</th>
                <th>Received</th>
                <th>Message</th>
                <th>Code</th>
            </tr>
        </thead>
        <tbody>
            ${errorRows}
        </tbody>
    </table>
    ` : ''}

    ${formatted.warnings.length > 0 ? `
    <h2>Warnings</h2>
    <table>
        <thead>
            <tr>
                <th>Path</th>
                <th>Expected</th>
                <th>Received</th>
                <th>Message</th>
                <th>Code</th>
            </tr>
        </thead>
        <tbody>
            ${warningRows}
        </tbody>
    </table>
    ` : ''}

    ${formatted.recommendations.length > 0 ? `
    <div class="recommendations">
        <h2>Recommendations</h2>
        <ul>
            ${formatted.recommendations.map((rec) => `<li>${this.escapeHtml(rec)}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
</body>
</html>`
  }

  private extractExpectedValue(error: SchemaValidationError): string {
    if (error.details?.expected !== undefined) {
      return String(error.details.expected)
    }

    // Try to extract from message
    const expectedMatch = error.message.match(/expected?:?\s*([^,\n]+)/i)
    if (expectedMatch) {
      return expectedMatch[1].trim()
    }

    return 'valid value'
  }

  private extractReceivedValue(error: SchemaValidationError): unknown {
    return error.details?.received ?? 'unknown'
  }

  private truncateMessage(message: string): string {
    if (message.length <= this.options.maxMessageLength) {
      return message
    }

    return message.substring(0, this.options.maxMessageLength - 3) + '...'
  }

  private sortFormattedErrors(errors: FormattedError[]): FormattedError[] {
    const sorted = [...errors]

    switch (this.options.sortBy) {
      case 'path':
        sorted.sort((a, b) => a.path.localeCompare(b.path))
        break
      case 'severity':
        const severityOrder = { error: 0, warning: 1, info: 2 }
        sorted.sort((a, b) => severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder])
        break
      case 'message':
        sorted.sort((a, b) => a.message.localeCompare(b.message))
        break
    }

    return sorted
  }

  private groupErrorsByPath(errors: FormattedError[]): {
    errors: FormattedError[]
    warnings: FormattedError[]
    info: FormattedError[]
  } {
    const groups = new Map<string, FormattedError[]>()

    for (const error of errors) {
      const path = error.path
      if (!groups.has(path)) {
        groups.set(path, [])
      }
      groups.get(path)!.push(error)
    }

    const result = {
      errors: [] as FormattedError[],
      warnings: [] as FormattedError[],
      info: [] as FormattedError[],
    }

    for (const [path, pathErrors] of groups) {
      // Merge errors with the same path
      const mergedError: FormattedError = {
        path,
        expected: pathErrors.map((e) => e.expected).join(' | '),
        received: pathErrors[0].received, // Take the first received value
        message: pathErrors.map((e) => e.message).join(' | '),
        severity: pathErrors[0].severity,
        code: pathErrors.map((e) => e.code || '').join(', '),
        details: Object.assign({}, ...pathErrors.map((e) => e.details || {})),
      }

      switch (mergedError.severity) {
        case 'error':
          result.errors.push(mergedError)
          break
        case 'warning':
          result.warnings.push(mergedError)
          break
        case 'info':
          result.info.push(mergedError)
          break
      }
    }

    return result
  }

  private generateRecommendations(result: SchemaValidationResult): string[] {
    const recommendations: string[] = []

    if (!result.isValid) {
      recommendations.push('Fix all validation errors before proceeding')

      if (result.errorCount > 10) {
        recommendations.push('Consider breaking down the configuration into smaller, manageable pieces')
      }

      if (result.errorCount > 50) {
        recommendations.push('This configuration has a high number of errors. Consider reviewing the overall structure')
      }
    }

    if (result.warningCount > 0) {
      recommendations.push('Review warnings for potential improvements to the configuration')
    }

    if (result.hasCriticalErrors) {
      recommendations.push('Critical errors detected. Immediate attention required.')
    }

    if (result.duration && result.duration > 5000) {
      recommendations.push('Validation took longer than expected. Consider optimizing the configuration structure.')
    }

    // Component-specific recommendations
    if (result.errors.some((e) => e.path?.includes('Button'))) {
      recommendations.push('Check Button component configurations for missing required properties')
    }

    if (result.errors.some((e) => e.path?.includes('Image'))) {
      recommendations.push('Check Image component configurations for valid URLs and required properties')
    }

    if (result.errors.some((e) => e.path?.includes('scenarioData'))) {
      recommendations.push('Review scenario data structure and value types')
    }

    return recommendations
  }

  private formatValue(value: unknown): string {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  public static create(options?: ErrorFormattingOptions): ErrorFormatter {
    return new ErrorFormatter(options)
  }
}