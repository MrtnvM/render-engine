import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { DomainError } from '../../../kernel/errors/domain.error.js'
import { Experiment } from '../entities/experiment.entity.js'
import { UserAssignment } from '../value-objects/user-assignment.value-object.js'
import { ExperimentStatus } from '../value-objects/experiment-status.enum.js'
import { IUserAssignmentRepository } from '../repositories/user-assignment.repository.interface.js'

// Domain Events
import { UserAssignedEvent, UserReassignedEvent, AssignmentValidationErrorEvent } from '../events/assignment.events.js'

// Domain Errors
import {
  ExperimentNotStartedError,
  UserNotEligibleError,
  InvalidAssignmentError,
  UserNotInExperimentError,
  InvalidVariantError,
  ReassignmentNotAllowedError,
  AssignmentPersistenceError,
} from '../errors/assignment.errors.js'

/**
 * UserAssignmentService Domain Service
 *
 * A stateless domain service responsible for managing consistent user assignment
 * to variants within A/B testing experiments. This service encapsulates the complex
 * business logic of user eligibility validation, consistent hashing for assignment
 * stability, and assignment persistence.
 */
export class UserAssignmentService {
  /**
   * Creates a new UserAssignmentService instance
   */
  constructor(private readonly assignmentRepository: IUserAssignmentRepository) {}

  /**
   * Assigns a user to a variant within the specified experiment using consistent hashing
   */
  async assignUser(experiment: Experiment, userId: ID): Promise<ID> {
    try {
      // Validate experiment status
      if (experiment.status !== ExperimentStatus.RUNNING) {
        throw new ExperimentNotStartedError(experiment.id.toString())
      }

      // Validate user eligibility
      if (!(await this.validateUserEligibility(experiment, userId))) {
        throw new UserNotEligibleError(
          userId.toString(),
          experiment.id.toString(),
          'User does not meet eligibility criteria',
        )
      }

      // Check if user is already assigned
      const existingAssignment = await this.getUserAssignment(experiment.id, userId)
      if (existingAssignment && existingAssignment.isActive) {
        // Return existing assignment for consistency
        return existingAssignment.variantId
      }

      // Calculate consistent hash and determine variant
      const hashValue = this.calculateConsistentHash(experiment, userId)
      const variantId = this.determineVariantFromHash(experiment, hashValue)

      // Validate assignment stability
      if (!(await this.validateAssignmentStability(experiment, userId, variantId))) {
        throw new InvalidAssignmentError(
          userId.toString(),
          experiment.id.toString(),
          'Assignment stability validation failed',
        )
      }

      // Create and persist assignment
      const assignment = UserAssignment.create({
        experimentId: experiment.id,
        userId,
        variantId,
        assignmentMethod: 'consistent_hash',
        metadata: {
          hashValue,
          algorithm: 'consistent_hashing',
        },
      })

      await this.assignmentRepository.saveAssignment(assignment)

      // Emit domain event
      const event = new UserAssignedEvent(
        experiment.id,
        userId,
        variantId,
        assignment.assignedAt,
        assignment.assignmentMethod,
        experiment.getVariantDistribution(variantId),
        ['location', 'device_type', 'user_segment'], // Simplified criteria
      )

      // In a real implementation, this would use an event bus
      this.emitEvent(event)

      return variantId
    } catch (error) {
      if (error instanceof DomainError) {
        // Emit validation error event
        const errorEvent = new AssignmentValidationErrorEvent(
          experiment.id,
          userId,
          undefined,
          error.constructor.name,
          error.message,
          { stack: error.stack },
          new Date(),
        )
        this.emitEvent(errorEvent)
      }
      throw error
    }
  }

  /**
   * Reassigns a user to a specific variant within an experiment
   */
  async reassignUser(experiment: Experiment, userId: ID, newVariantId: ID): Promise<void> {
    try {
      // Validate experiment status
      if (experiment.status !== ExperimentStatus.RUNNING) {
        throw new ExperimentNotStartedError(experiment.id.toString())
      }

      // Check if user is currently assigned
      const currentAssignment = await this.getUserAssignment(experiment.id, userId)
      if (!currentAssignment || !currentAssignment.isActive) {
        throw new UserNotInExperimentError(userId.toString(), experiment.id.toString())
      }

      // Validate new variant
      if (!experiment.hasVariant(newVariantId)) {
        throw new InvalidVariantError(newVariantId.toString(), experiment.id.toString())
      }

      // Check if reassignment is to the same variant
      if (currentAssignment.variantId.equals(newVariantId)) {
        return // No change needed
      }

      // Validate reassignment rules
      if (!(await this.validateReassignmentRules(experiment, userId, newVariantId))) {
        throw new ReassignmentNotAllowedError(
          userId.toString(),
          experiment.id.toString(),
          'Reassignment violates business rules',
        )
      }

      // Calculate assignment duration
      const assignmentDuration = Date.now() - currentAssignment.assignedAt.getTime()

      // Deactivate current assignment
      const deactivatedAssignment = currentAssignment.deactivate()
      await this.assignmentRepository.saveAssignment(deactivatedAssignment)

      // Create new assignment
      const newAssignment = UserAssignment.create({
        experimentId: experiment.id,
        userId,
        variantId: newVariantId,
        assignmentMethod: 'reassignment',
        metadata: {
          previousVariantId: currentAssignment.variantId.toString(),
          reassignmentReason: 'manual_reassignment',
          previousAssignmentDuration: assignmentDuration,
        },
      })

      await this.assignmentRepository.saveAssignment(newAssignment)

      // Emit domain event
      const event = new UserReassignedEvent(
        experiment.id,
        userId,
        currentAssignment.variantId,
        newVariantId,
        newAssignment.assignedAt,
        'manual_reassignment',
        assignmentDuration,
      )

      this.emitEvent(event)
    } catch (error) {
      if (error instanceof DomainError) {
        const errorEvent = new AssignmentValidationErrorEvent(
          experiment.id,
          userId,
          newVariantId,
          error.constructor.name,
          error.message,
          { stack: error.stack },
          new Date(),
        )
        this.emitEvent(errorEvent)
      }
      throw error
    }
  }

  /**
   * Retrieves the current variant assignment for a user in an experiment
   */
  async getUserAssignment(experimentId: ID, userId: ID): Promise<UserAssignment | null> {
    return await this.assignmentRepository.getAssignment(experimentId, userId)
  }

  /**
   * Retrieves the complete assignment history for a user in an experiment
   */
  async getUserAssignmentHistory(experimentId: ID, userId: ID): Promise<UserAssignment[]> {
    return await this.assignmentRepository.getAssignmentHistory(experimentId, userId)
  }

  /**
   * Validates whether a user is eligible to participate in an experiment
   */
  async validateUserEligibility(experiment: Experiment, userId: ID): Promise<boolean> {
    // In a real implementation, this would check:
    // - Target audience criteria (location, device type, user segments, etc.)
    // - User consent and privacy preferences
    // - Participation limits
    // - Exclusion criteria

    // Simplified implementation - always return true for now
    // In production, this would integrate with user profile and consent systems
    return true
  }

  /**
   * Validates that an assignment maintains stability consistency
   */
  async validateAssignmentStability(experiment: Experiment, userId: ID, variantId: ID): Promise<boolean> {
    // Calculate expected hash
    const expectedHash = this.calculateConsistentHash(experiment, userId)
    const expectedVariantId = this.determineVariantFromHash(experiment, expectedHash)

    // Check if the assignment matches the expected variant
    return variantId.equals(expectedVariantId)
  }

  /**
   * Calculates a consistent hash value for user assignment
   */
  calculateConsistentHash(experiment: Experiment, userId: ID): number {
    // Combine experiment ID and user ID for unique hashing
    const hashInput = `${experiment.id.toString()}-${userId.toString()}`

    // Use a simple hash function (in production, use a more robust algorithm like xxHash or MurmurHash)
    let hash = 0
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    // Normalize to 0-1 range
    return Math.abs(hash) / 2147483647 // Max 32-bit signed integer
  }

  /**
   * Determines the appropriate variant based on hash value and distribution percentages
   */
  determineVariantFromHash(experiment: Experiment, hashValue: number): ID {
    const variants = experiment.variantIds
    if (variants.length === 0) {
      throw new Error('No variants available for assignment')
    }

    // Simple equal distribution implementation
    // In production, this would use actual distribution percentages
    const variantIndex = Math.floor(hashValue * variants.length)
    return variants[Math.min(variantIndex, variants.length - 1)]
  }

  /**
   * Calculates the current actual distribution of users across variants
   */
  async calculateAssignmentDistribution(experiment: Experiment): Promise<Record<string, number>> {
    const distribution: Record<string, number> = {}

    try {
      const stats = await this.assignmentRepository.getDistributionStats(experiment.id)

      // Convert string keys back to ID objects
      for (const [variantIdStr, count] of Object.entries(stats)) {
        const variantId = ID.create(variantIdStr)
        distribution[variantId.toString()] = count
      }

      return distribution
    } catch (error) {
      throw new AssignmentPersistenceError(
        'unknown',
        experiment.id.toString(),
        'unknown',
        `Failed to calculate distribution: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Validates reassignment rules
   */
  private async validateReassignmentRules(experiment: Experiment, userId: ID, newVariantId: ID): Promise<boolean> {
    // In a real implementation, this would check:
    // - Reassignment frequency limits
    // - Business rule validation
    // - Experiment-specific constraints

    // Simplified implementation - allow reassignment
    return true
  }

  /**
   * Emits a domain event (simplified implementation)
   */
  private emitEvent(event: unknown): void {
    // In a real implementation, this would use an event bus
    console.log('Domain Event:', event)
  }
}
