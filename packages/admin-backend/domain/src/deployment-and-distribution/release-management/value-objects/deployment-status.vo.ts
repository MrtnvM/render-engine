/**
 * DeploymentStatus Value Object
 *
 * Represents the current state of a deployment operation with proper state transitions
 * and validation for deployment lifecycle management.
 */

import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'
import { ValidationError } from '../../../kernel/errors/validation.error.js'
import { BusinessRuleViolationError } from '../../../kernel/errors/business-rule-violation.error.js'

export enum DeploymentStatusEnum {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  ROLLING_BACK = 'ROLLING_BACK',
  ROLLED_BACK = 'ROLLED_BACK',
}

interface DeploymentStatusProps {
  status: DeploymentStatusEnum
  timestamp: Date
  message?: string
  details?: Record<string, unknown>
}

export class DeploymentStatus extends ValueObject<DeploymentStatusProps> {
  private constructor(props: DeploymentStatusProps) {
    super(props)
  }

  /**
   * Create a new DeploymentStatus instance
   */
  static create(status: DeploymentStatusEnum, message?: string, details?: Record<string, unknown>): DeploymentStatus {
    // Business Rule: Status message must be non-empty when provided
    if (message && message.trim() === '') {
      throw ValidationError.emptyValue('message')
    }

    // Business Rule: Details must be serializable
    if (details && typeof details !== 'object') {
      throw ValidationError.invalidType('details', details, 'object')
    }

    return new DeploymentStatus({
      status,
      timestamp: new Date(),
      message: message?.trim(),
      details,
    })
  }

  /**
   * Check if a transition to the new status is allowed
   */
  canTransitionTo(newStatus: DeploymentStatusEnum): boolean {
    const current = this.value.status
    const transitions: Record<DeploymentStatusEnum, DeploymentStatusEnum[]> = {
      [DeploymentStatusEnum.DRAFT]: [DeploymentStatusEnum.PENDING, DeploymentStatusEnum.CANCELLED],
      [DeploymentStatusEnum.PENDING]: [DeploymentStatusEnum.IN_PROGRESS, DeploymentStatusEnum.CANCELLED],
      [DeploymentStatusEnum.IN_PROGRESS]: [
        DeploymentStatusEnum.SUCCESS,
        DeploymentStatusEnum.FAILED,
        DeploymentStatusEnum.CANCELLED,
      ],
      [DeploymentStatusEnum.SUCCESS]: [DeploymentStatusEnum.ROLLING_BACK],
      [DeploymentStatusEnum.FAILED]: [DeploymentStatusEnum.PENDING], // Retry
      [DeploymentStatusEnum.CANCELLED]: [], // Terminal state
      [DeploymentStatusEnum.ROLLING_BACK]: [DeploymentStatusEnum.ROLLED_BACK, DeploymentStatusEnum.FAILED],
      [DeploymentStatusEnum.ROLLED_BACK]: [DeploymentStatusEnum.PENDING], // Redeploy
    }

    return transitions[current].includes(newStatus)
  }

  /**
   * Creates a new DeploymentStatus instance with the updated status
   */
  transitionTo(newStatus: DeploymentStatusEnum, message?: string, details?: Record<string, unknown>): DeploymentStatus {
    // Business Rule: Status transitions must follow the defined workflow
    if (!this.canTransitionTo(newStatus)) {
      throw BusinessRuleViolationError.forRule('STATUS_TRANSITION', {
        from: this.value.status,
        to: newStatus,
      })
    }

    return DeploymentStatus.create(newStatus, message, details)
  }

  /**
   * Check if the current status is a terminal state
   */
  isTerminal(): boolean {
    return this.value.status === DeploymentStatusEnum.CANCELLED
  }

  /**
   * Check if the current status indicates an active deployment
   */
  isActive(): boolean {
    return [DeploymentStatusEnum.PENDING, DeploymentStatusEnum.IN_PROGRESS, DeploymentStatusEnum.ROLLING_BACK].includes(
      this.value.status,
    )
  }

  /**
   * Check if the current status indicates a failed deployment
   */
  isFailed(): boolean {
    return this.value.status === DeploymentStatusEnum.FAILED
  }

  /**
   * Check if the current status indicates a successful deployment
   */
  isSuccess(): boolean {
    return this.value.status === DeploymentStatusEnum.SUCCESS
  }

  /**
   * Compare this status with another status for equality
   */
  equals(other: DeploymentStatus): boolean {
    if (!(other instanceof DeploymentStatus)) {
      return false
    }
    return (
      this.value.status === other.value.status && this.value.timestamp.getTime() === other.value.timestamp.getTime()
    )
  }

  // Factory Methods

  /**
   * Returns a draft status for new deployments
   */
  static draft(): DeploymentStatus {
    return DeploymentStatus.create(DeploymentStatusEnum.DRAFT)
  }

  /**
   * Returns a pending status for deployments waiting to start
   */
  static pending(): DeploymentStatus {
    return DeploymentStatus.create(DeploymentStatusEnum.PENDING)
  }

  /**
   * Returns an in-progress status for active deployments
   */
  static inProgress(): DeploymentStatus {
    return DeploymentStatus.create(DeploymentStatusEnum.IN_PROGRESS)
  }

  /**
   * Returns a success status for completed deployments
   */
  static success(message?: string): DeploymentStatus {
    return DeploymentStatus.create(DeploymentStatusEnum.SUCCESS, message)
  }

  /**
   * Returns a failed status for failed deployments
   */
  static failed(message: string, details?: Record<string, unknown>): DeploymentStatus {
    return DeploymentStatus.create(DeploymentStatusEnum.FAILED, message, details)
  }

  /**
   * Returns a cancelled status for cancelled deployments
   */
  static cancelled(message?: string): DeploymentStatus {
    return DeploymentStatus.create(DeploymentStatusEnum.CANCELLED, message)
  }

  /**
   * Returns a rolling-back status for deployments being rolled back
   */
  static rollingBack(message?: string): DeploymentStatus {
    return DeploymentStatus.create(DeploymentStatusEnum.ROLLING_BACK, message)
  }

  /**
   * Returns a rolled-back status for completed rollbacks
   */
  static rolledBack(message?: string): DeploymentStatus {
    return DeploymentStatus.create(DeploymentStatusEnum.ROLLED_BACK, message)
  }

  // Getters

  get status(): DeploymentStatusEnum {
    return this.value.status
  }

  get timestamp(): Date {
    return this.value.timestamp
  }

  get message(): string | undefined {
    return this.value.message
  }

  get details(): Record<string, unknown> | undefined {
    return this.value.details
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `DeploymentStatus(${this.value.status})`
  }

  /**
   * Convert to JSON-serializable object
   */
  toJSON(): {
    status: DeploymentStatusEnum
    timestamp: string
    message?: string
    details?: Record<string, unknown>
  } {
    return {
      status: this.value.status,
      timestamp: this.value.timestamp.toISOString(),
      message: this.value.message,
      details: this.value.details,
    }
  }
}
