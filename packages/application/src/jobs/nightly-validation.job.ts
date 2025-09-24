import { ValidationService, BatchValidationRequest } from '../../domain/src/schema-management/schema-validation/validation.service.js'
import { SchemaValidationResult } from '../../domain/src/schema-management/schema-validation/value-objects/validation-result.vo.js'
import { ErrorFormatter } from '../../domain/src/schema-management/schema-validation/error-formatter.js'
import { CustomValidatorsRegistry } from '../../domain/src/schema-management/schema-validation/custom-validators.js'

export interface NightlyValidationConfig {
  batchSize: number
  maxConcurrentJobs: number
  failThreshold: number // Percentage (0-100)
  reportEmailRecipients: string[]
  slackWebhookUrl?: string
  retryAttempts: number
  retryDelay: number // milliseconds
}

export interface ValidationJob {
  id: string
  configId: string
  configVersion: string
  data: unknown
  priority: 'high' | 'normal' | 'low'
  retryCount: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retry'
  result?: SchemaValidationResult
  error?: string
}

export interface NightlyValidationReport {
  jobId: string
  startTime: Date
  endTime: Date
  duration: number
  totalConfigs: number
  validatedConfigs: number
  validConfigs: number
  invalidConfigs: number
  errorRate: number
  failThreshold: number
  exceededThreshold: boolean
  summary: {
    totalErrors: number
    totalWarnings: number
    totalInfo: number
    criticalErrors: number
    averageValidationTime: number
  }
  configResults: Array<{
    configId: string
    configVersion: string
    isValid: boolean
    errorCount: number
    warningCount: number
    infoCount: number
    validationTime: number
    errors: Array<{
      path: string
      message: string
      code: string
    }>
  }>
  recommendations: string[]
}

export class NightlyValidationJob {
  private validationService: ValidationService
  private config: NightlyValidationConfig
  private errorFormatter: ErrorFormatter
  private customValidators: CustomValidatorsRegistry
  private currentJobId: string
  private jobQueue: ValidationJob[] = []
  private activeJobs: Map<string, ValidationJob> = new Map()
  private completedJobs: ValidationJob[] = []
  private isRunning: boolean = false
  private eventListeners: Array<(event: ValidationJobEvent) => void> = []

  constructor(
    validationService: ValidationService,
    config: NightlyValidationConfig,
  ) {
    this.validationService = validationService
    this.config = config
    this.errorFormatter = ErrorFormatter.create({
      includeCode: true,
      includeSeverity: true,
      includeDetails: true,
      sortBy: 'severity',
    })
    this.customValidators = new CustomValidatorsRegistry()
    this.currentJobId = this.generateJobId()
  }

  public async start(configs: Array<{ id: string; version: string; data: unknown }>): Promise<string> {
    if (this.isRunning) {
      throw new Error('Nightly validation job is already running')
    }

    this.isRunning = true
    this.jobQueue = []
    this.activeJobs.clear()
    this.completedJobs = []
    this.currentJobId = this.generateJobId()

    // Create jobs for all configs
    for (const config of configs) {
      this.jobQueue.push({
        id: this.generateJobId(),
        configId: config.id,
        configVersion: config.version,
        data: config.data,
        priority: 'normal',
        retryCount: 0,
        createdAt: new Date(),
        status: 'pending',
      })
    }

    // Sort jobs by priority
    this.jobQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    this.emitEvent({
      type: 'job_started',
      jobId: this.currentJobId,
      message: `Nightly validation started with ${configs.length} configurations`,
    })

    // Start processing jobs
    this.processJobs()

    return this.currentJobId
  }

  public async stop(): Promise<void> {
    this.isRunning = false
    this.jobQueue = []
    this.activeJobs.clear()

    this.emitEvent({
      type: 'job_stopped',
      jobId: this.currentJobId,
      message: 'Nightly validation stopped by user',
    })
  }

  public getStatus(): {
    isRunning: boolean
    jobId: string
    queuedJobs: number
    activeJobs: number
    completedJobs: number
    totalJobs: number
    progress: number
  } {
    const totalJobs = this.jobQueue.length + this.activeJobs.size + this.completedJobs.length
    const completedCount = this.completedJobs.length
    const progress = totalJobs > 0 ? (completedCount / totalJobs) * 100 : 0

    return {
      isRunning: this.isRunning,
      jobId: this.currentJobId,
      queuedJobs: this.jobQueue.length,
      activeJobs: this.activeJobs.size,
      completedJobs: completedCount,
      totalJobs,
      progress: Math.round(progress * 100) / 100,
    }
  }

  public getCurrentReport(): NightlyValidationReport | null {
    if (this.completedJobs.length === 0) {
      return null
    }

    const startTime = this.completedJobs[0]?.createdAt || new Date()
    const endTime = this.completedJobs[this.completedJobs.length - 1]?.completedAt || new Date()
    const duration = endTime.getTime() - startTime.getTime()

    const totalConfigs = this.completedJobs.length
    const validConfigs = this.completedJobs.filter((job) => job.result?.isValid).length
    const invalidConfigs = totalConfigs - validConfigs
    const errorRate = totalConfigs > 0 ? (invalidConfigs / totalConfigs) * 100 : 0

    const totalErrors = this.completedJobs.reduce((sum, job) => sum + (job.result?.errorCount || 0), 0)
    const totalWarnings = this.completedJobs.reduce((sum, job) => sum + (job.result?.warningCount || 0), 0)
    const totalInfo = this.completedJobs.reduce((sum, job) => sum + (job.result?.infoCount || 0), 0)
    const criticalErrors = this.completedJobs.reduce((sum, job) => sum + (job.result?.hasCriticalErrors ? 1 : 0), 0)
    const totalDuration = this.completedJobs.reduce((sum, job) => sum + (job.result?.duration || 0), 0)
    const averageValidationTime = this.completedJobs.length > 0 ? totalDuration / this.completedJobs.length : 0

    const configResults = this.completedJobs.map((job) => ({
      configId: job.configId,
      configVersion: job.configVersion,
      isValid: job.result?.isValid || false,
      errorCount: job.result?.errorCount || 0,
      warningCount: job.result?.warningCount || 0,
      infoCount: job.result?.infoCount || 0,
      validationTime: job.result?.duration || 0,
      errors: this.errorFormatter
        .formatReport(job.result || SchemaValidationResult.success())
        .errors.slice(0, 10) // Limit to first 10 errors
        .map((error) => ({
          path: error.path,
          message: error.message,
          code: error.code || '',
        })),
    }))

    const exceededThreshold = errorRate > this.config.failThreshold
    const recommendations = this.generateRecommendations(errorRate, exceededThreshold, configResults)

    return {
      jobId: this.currentJobId,
      startTime,
      endTime,
      duration,
      totalConfigs,
      validatedConfigs: totalConfigs,
      validConfigs,
      invalidConfigs,
      errorRate,
      failThreshold: this.config.failThreshold,
      exceededThreshold,
      summary: {
        totalErrors,
        totalWarnings,
        totalInfo,
        criticalErrors,
        averageValidationTime,
      },
      configResults,
      recommendations,
    }
  }

  public onEvent(listener: (event: ValidationJobEvent) => void): void {
    this.eventListeners.push(listener)
  }

  public removeEventListener(listener: (event: ValidationJobEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  private async processJobs(): Promise<void> {
    while (this.isRunning && this.jobQueue.length > 0) {
      const activeJobCount = this.activeJobs.size

      if (activeJobCount >= this.config.maxConcurrentJobs) {
        // Wait for some jobs to complete
        await this.waitForJobCompletion()
        continue
      }

      // Start new jobs
      const jobsToStart = Math.min(
        this.config.maxConcurrentJobs - activeJobCount,
        this.jobQueue.length,
      )

      for (let i = 0; i < jobsToStart; i++) {
        const job = this.jobQueue.shift()!
        this.startJob(job)
      }
    }

    // Wait for all active jobs to complete
    while (this.activeJobs.size > 0) {
      await this.waitForJobCompletion()
    }

    // Generate final report
    const report = this.getCurrentReport()
    if (report) {
      this.emitEvent({
        type: 'job_completed',
        jobId: this.currentJobId,
        message: `Nightly validation completed. Valid: ${report.validConfigs}/${report.totalConfigs}, Error rate: ${report.errorRate.toFixed(2)}%`,
      })

      // Send notifications if threshold exceeded
      if (report.exceededThreshold) {
        await this.sendThresholdExceededNotification(report)
      }
    }

    this.isRunning = false
  }

  private async startJob(job: ValidationJob): Promise<void> {
    job.status = 'running'
    job.startedAt = new Date()
    this.activeJobs.set(job.id, job)

    this.emitEvent({
      type: 'job_progress',
      jobId: this.currentJobId,
      configId: job.configId,
      message: `Started validation for config ${job.configId}`,
    })

    try {
      const result = await this.validationService.validate({
        data: job.data,
        options: {
          strict: true,
          includeWarnings: true,
          includeInfo: true,
          customValidators: ['security', 'componentType', 'crossField'],
        },
      })

      job.status = 'completed'
      job.completedAt = new Date()
      job.result = result

      this.emitEvent({
        type: 'job_progress',
        jobId: this.currentJobId,
        configId: job.configId,
        message: `Completed validation for config ${job.configId}. Valid: ${result.isValid}`,
      })
    } catch (error) {
      job.status = 'failed'
      job.completedAt = new Date()
      job.error = error instanceof Error ? error.message : 'Unknown error'

      this.emitEvent({
        type: 'job_error',
        jobId: this.currentJobId,
        configId: job.configId,
        message: `Failed validation for config ${job.configId}: ${job.error}`,
      })
    }

    this.activeJobs.delete(job.id)
    this.completedJobs.push(job)
  }

  private async waitForJobCompletion(): Promise<void> {
    return new Promise((resolve) => {
      const checkCompletion = () => {
        if (this.activeJobs.size === 0 || !this.isRunning) {
          resolve()
        } else {
          setTimeout(checkCompletion, 100)
        }
      }
      checkCompletion()
    })
  }

  private generateRecommendations(
    errorRate: number,
    exceededThreshold: boolean,
    configResults: NightlyValidationReport['configResults'],
  ): string[] {
    const recommendations: string[] = []

    if (exceededThreshold) {
      recommendations.push('Error rate exceeded threshold. Immediate action required.')
    }

    if (errorRate > 50) {
      recommendations.push('Very high error rate detected. Consider reviewing all configurations.')
    } else if (errorRate > 25) {
      recommendations.push('High error rate detected. Review configurations with most errors.')
    } else if (errorRate > 10) {
      recommendations.push('Moderate error rate detected. Monitor trends.')
    }

    // Find most common error patterns
    const errorCounts: Record<string, number> = {}
    for (const result of configResults) {
      for (const error of result.errors) {
        errorCounts[error.code] = (errorCounts[error.code] || 0) + 1
      }
    }

    const topErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    if (topErrors.length > 0) {
      recommendations.push(`Most common error: ${topErrors[0][0]} (${topErrors[0][1]} occurrences)`)
    }

    // Find configurations with most errors
    const configsWithErrors = configResults
      .filter((r) => r.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 5)

    if (configsWithErrors.length > 0) {
      recommendations.push(`Configurations with most errors: ${configsWithErrors.map((c) => c.configId).join(', ')}`)
    }

    return recommendations
  }

  private async sendThresholdExceededNotification(report: NightlyValidationReport): Promise<void> {
    const message = `
🚨 Nightly Validation Alert
Error rate exceeded threshold: ${report.errorRate.toFixed(2)}% (threshold: ${report.failThreshold}%)

Summary:
- Total configs: ${report.totalConfigs}
- Valid: ${report.validConfigs}
- Invalid: ${report.invalidConfigs}
- Critical errors: ${report.summary.criticalErrors}

Top error codes:
${Object.entries(
  report.configResults
    .flatMap((r) => r.errors)
    .reduce((counts: Record<string, number>, error) => {
      counts[error.code] = (counts[error.code] || 0) + 1
      return counts
    }, {}),
)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([code, count]) => `- ${code}: ${count}`)
  .join('\n')}

${report.recommendations.map((rec) => `• ${rec}`).join('\n')}
    `.trim()

    this.emitEvent({
      type: 'threshold_exceeded',
      jobId: this.currentJobId,
      message,
    })

    // Here you would integrate with email service and Slack webhook
    // For now, we'll just emit the event
  }

  private generateJobId(): string {
    return `nightly_validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private emitEvent(event: ValidationJobEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in validation job event listener:', error)
      }
    }
  }

  public static create(
    validationService: ValidationService,
    config: NightlyValidationConfig,
  ): NightlyValidationJob {
    return new NightlyValidationJob(validationService, config)
  }
}

export interface ValidationJobEvent {
  type: 'job_started' | 'job_progress' | 'job_completed' | 'job_stopped' | 'job_error' | 'threshold_exceeded'
  jobId: string
  configId?: string
  message: string
  data?: unknown
}