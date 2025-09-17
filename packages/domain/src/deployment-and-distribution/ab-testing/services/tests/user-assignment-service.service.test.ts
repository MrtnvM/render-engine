import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserAssignmentService } from '../user-assignment-service.service.js'
import { ID } from '../../../../kernel/value-objects/id.value-object.js'
import { Name } from '../../../../kernel/value-objects/name.value-object.js'
import { Experiment } from '../../entities/experiment.entity.js'
import { ExperimentStatus } from '../../value-objects/experiment-status.enum.js'
import { IUserAssignmentRepository } from '../../repositories/user-assignment.repository.interface.js'

// Mock repository
const mockRepository: IUserAssignmentRepository = {
  saveAssignment: vi.fn(),
  getAssignment: vi.fn(),
  getAssignmentHistory: vi.fn(),
  deleteAssignment: vi.fn(),
  getActiveAssignments: vi.fn(),
  getUserAssignments: vi.fn(),
  getVariantAssignments: vi.fn(),
  getAssignmentCount: vi.fn(),
  getVariantAssignmentCount: vi.fn(),
  getDistributionStats: vi.fn(),
  saveAssignments: vi.fn(),
  deleteAssignments: vi.fn(),
}

describe('UserAssignmentService', () => {
  let service: UserAssignmentService
  let experiment: Experiment
  let userId: ID
  let variantId: ID

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    service = new UserAssignmentService(mockRepository)
    userId = ID.generate()
    variantId = ID.generate()

    // Create a test experiment
    experiment = Experiment.fromExisting({
      id: ID.generate(),
      name: Name.create('Test Experiment'),
      description: undefined,
      status: ExperimentStatus.RUNNING,
      variantIds: [variantId],
      testGroupIds: [],
      startDate: new Date(),
      endDate: undefined,
      createdBy: ID.generate(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  describe('assignUser', () => {
    it('should assign user to variant when experiment is running', async () => {
      // Arrange
      vi.mocked(mockRepository.getAssignment).mockResolvedValue(null)
      vi.mocked(mockRepository.saveAssignment).mockResolvedValue()

      // Act
      const assignedVariantId = await service.assignUser(experiment, userId)

      // Assert
      expect(assignedVariantId).toBe(variantId)
      expect(mockRepository.saveAssignment).toHaveBeenCalled()
    })

    it('should throw error when experiment is not running', async () => {
      // Arrange
      const draftExperiment = Experiment.fromExisting({
        id: ID.generate(),
        name: Name.create('Test Experiment'),
        description: undefined,
        status: ExperimentStatus.DRAFT,
        variantIds: [variantId],
        testGroupIds: [],
        startDate: new Date(),
        endDate: undefined,
        createdBy: ID.generate(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Act & Assert
      await expect(service.assignUser(draftExperiment, userId)).rejects.toThrow('is not in RUNNING status')
    })

    it('should return existing assignment if user already assigned', async () => {
      // Arrange
      const existingAssignment = {
        userId,
        experimentId: experiment.id,
        variantId,
        assignedAt: new Date(),
        isActive: true,
        assignmentMethod: 'consistent_hash',
        metadata: {},
        deactivate: vi.fn(),
      }
      vi.mocked(mockRepository.getAssignment).mockResolvedValue(existingAssignment as any)

      // Act
      const assignedVariantId = await service.assignUser(experiment, userId)

      // Assert
      expect(assignedVariantId).toBe(variantId)
      expect(mockRepository.saveAssignment).not.toHaveBeenCalled()
    })
  })

  describe('reassignUser', () => {
    it('should reassign user to new variant', async () => {
      // Arrange
      const newVariantId = ID.generate()
      const baseAssignment = {
        userId,
        experimentId: experiment.id,
        variantId,
        assignedAt: new Date(),
        isActive: true,
        assignmentMethod: 'consistent_hash',
        metadata: {},
      }
      const existingAssignment = {
        ...baseAssignment,
        deactivate: vi.fn().mockReturnValue({
          ...baseAssignment,
          isActive: false,
        }),
      }
      vi.mocked(mockRepository.getAssignment).mockResolvedValue(existingAssignment as any)
      vi.mocked(mockRepository.saveAssignment).mockResolvedValue()

      // Create experiment with multiple variants
      const multiVariantExperiment = Experiment.fromExisting({
        id: experiment.id,
        name: experiment.name,
        description: experiment.description,
        status: experiment.status,
        variantIds: [variantId, newVariantId],
        testGroupIds: experiment.testGroupIds,
        startDate: experiment.startDate,
        endDate: experiment.endDate,
        createdBy: experiment.createdBy,
        createdAt: experiment.createdAt,
        updatedAt: experiment.updatedAt,
      })

      // Act
      await service.reassignUser(multiVariantExperiment, userId, newVariantId)

      // Assert
      expect(mockRepository.saveAssignment).toHaveBeenCalledTimes(2) // Once to delete old, once to create new
    })

    it('should throw error when user is not currently assigned', async () => {
      // Arrange
      vi.mocked(mockRepository.getAssignment).mockResolvedValue(null)

      // Act & Assert
      await expect(service.reassignUser(experiment, userId, variantId)).rejects.toThrow(
        'is not currently assigned to any variant in experiment',
      )
    })
  })
})
