import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { UserAssignment } from '../value-objects/user-assignment.value-object.js'

/**
 * Repository interface for UserAssignment operations
 *
 * This interface defines the contract for persisting and retrieving
 * user assignment data, following the repository pattern.
 */
export interface IUserAssignmentRepository {
  // Assignment operations
  saveAssignment(assignment: UserAssignment): Promise<void>
  getAssignment(experimentId: ID, userId: ID): Promise<UserAssignment | null>
  getAssignmentHistory(experimentId: ID, userId: ID): Promise<UserAssignment[]>
  deleteAssignment(experimentId: ID, userId: ID): Promise<void>

  // Query operations
  getActiveAssignments(experimentId: ID): Promise<UserAssignment[]>
  getUserAssignments(userId: ID): Promise<UserAssignment[]>
  getVariantAssignments(variantId: ID): Promise<UserAssignment[]>

  // Statistics operations
  getAssignmentCount(experimentId: ID): Promise<number>
  getVariantAssignmentCount(variantId: ID): Promise<number>
  getDistributionStats(experimentId: ID): Promise<Record<string, number>>

  // Batch operations
  saveAssignments(assignments: UserAssignment[]): Promise<void>
  deleteAssignments(experimentId: ID, userIds: ID[]): Promise<void>
}
