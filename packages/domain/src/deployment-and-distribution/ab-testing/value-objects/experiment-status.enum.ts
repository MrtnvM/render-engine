/**
 * Experiment Status Enum
 *
 * Represents the current status of an A/B testing experiment
 */
export enum ExperimentStatus {
  /** Experiment is being configured and is not yet active */
  DRAFT = 'DRAFT',

  /** Experiment is currently running and collecting data */
  RUNNING = 'RUNNING',

  /** Experiment has been stopped and data is being analyzed */
  STOPPED = 'STOPPED',

  /** Experiment has been completed and results are final */
  COMPLETED = 'COMPLETED',

  /** Experiment has been archived and is no longer accessible */
  ARCHIVED = 'ARCHIVED',
}

/**
 * Type guard for ExperimentStatus
 */
export function isExperimentStatus(value: string): value is ExperimentStatus {
  return Object.values(ExperimentStatus).includes(value as ExperimentStatus)
}

/**
 * Validates if an experiment status transition is allowed
 */
export function isValidStatusTransition(from: ExperimentStatus, to: ExperimentStatus): boolean {
  const validTransitions: Record<ExperimentStatus, ExperimentStatus[]> = {
    [ExperimentStatus.DRAFT]: [ExperimentStatus.RUNNING, ExperimentStatus.ARCHIVED],
    [ExperimentStatus.RUNNING]: [ExperimentStatus.STOPPED, ExperimentStatus.COMPLETED],
    [ExperimentStatus.STOPPED]: [ExperimentStatus.RUNNING, ExperimentStatus.COMPLETED, ExperimentStatus.ARCHIVED],
    [ExperimentStatus.COMPLETED]: [ExperimentStatus.ARCHIVED],
    [ExperimentStatus.ARCHIVED]: [],
  }

  return validTransitions[from].includes(to)
}
