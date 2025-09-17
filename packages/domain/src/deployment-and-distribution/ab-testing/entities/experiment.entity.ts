import { Entity, EntityData } from '../../../kernel/entities/base.entity.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { Name } from '../../../kernel/value-objects/name.value-object.js'
import { Description } from '../../../kernel/value-objects/description.value-object.js'
import { ExperimentStatus } from '../value-objects/experiment-status.enum.js'

interface ExperimentData extends EntityData {
  name: Name
  description?: Description
  status: ExperimentStatus
  variantIds: ID[]
  testGroupIds: ID[]
  startDate?: Date
  endDate?: Date
  createdBy: ID
}

/**
 * Experiment Entity
 *
 * Represents an A/B testing experiment.
 */
export class Experiment extends Entity<ExperimentData> {
  private constructor(
    data: Omit<ExperimentData, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID; createdAt?: Date; updatedAt?: Date },
  ) {
    super(data)
  }

  /**
   * Creates a new experiment instance from existing data
   */
  static fromExisting(data: ExperimentData): Experiment {
    return new Experiment(data)
  }

  /**
   * Gets the experiment name
   */
  get name(): Name {
    return this.data.name
  }

  /**
   * Gets the experiment description
   */
  get description(): Description | undefined {
    return this.data.description
  }

  /**
   * Gets the experiment status
   */
  get status(): ExperimentStatus {
    return this.data.status
  }

  /**
   * Gets the variant IDs
   */
  get variantIds(): ID[] {
    return [...this.data.variantIds]
  }

  /**
   * Gets the test group IDs
   */
  get testGroupIds(): ID[] {
    return [...this.data.testGroupIds]
  }

  /**
   * Gets the start date
   */
  get startDate(): Date | undefined {
    return this.data.startDate
  }

  /**
   * Gets the end date
   */
  get endDate(): Date | undefined {
    return this.data.endDate
  }

  /**
   * Gets the creator ID
   */
  get createdBy(): ID {
    return this.data.createdBy
  }

  /**
   * Checks if the experiment is currently running
   */
  get isRunning(): boolean {
    return this.data.status === ExperimentStatus.RUNNING
  }

  /**
   * Checks if the experiment has a specific variant
   */
  hasVariant(variantId: ID): boolean {
    return this.data.variantIds.some((vid: ID) => vid.equals(variantId))
  }

  /**
   * Gets the distribution percentages for variants
   * Note: In a real implementation, this would come from variant entities
   */
  getVariantDistribution(variantId: ID): number {
    // Simplified: equal distribution among variants
    // In reality, this would be stored with each variant
    const variantCount = this.data.variantIds.length
    return variantCount > 0 ? 1 / variantCount : 0
  }

  /**
   * Validates that the experiment is in a valid state for user assignment
   */
  validateForAssignment(): void {
    if (!this.isRunning) {
      throw new Error(`Experiment ${this.id} is not running. Current status: ${this.status}`)
    }

    if (this.data.variantIds.length === 0) {
      throw new Error(`Experiment ${this.id} has no variants`)
    }
  }
}
