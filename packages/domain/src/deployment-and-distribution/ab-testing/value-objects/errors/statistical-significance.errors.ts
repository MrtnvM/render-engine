import { DomainError } from '../../../../kernel/errors/domain.error.js'

/**
 * Error thrown when statistical test validation fails
 */
export class InvalidStatisticalTestError extends DomainError {
  constructor(pValue: number, confidence: number, testType: string, sampleSize: number, reason: string) {
    super({
      message: `Invalid statistical test: p-value=${pValue}, confidence=${confidence}, testType='${testType}', sampleSize=${sampleSize} - ${reason}`,
      code: 'INVALID_STATISTICAL_TEST',
      metadata: { pValue, confidence, testType, sampleSize, reason },
    })
  }
}

/**
 * Error thrown when chi-square test parameters are invalid
 */
export class InvalidChiSquareTestError extends DomainError {
  constructor(observed: number[], expected: number[], reason: string) {
    super({
      message: `Invalid chi-square test: observed=[${observed.join(',')}], expected=[${expected.join(',')}] - ${reason}`,
      code: 'INVALID_CHI_SQUARE_TEST',
      metadata: { observed, expected, reason },
    })
  }
}

/**
 * Error thrown when t-test parameters are invalid
 */
export class InvalidTTestError extends DomainError {
  constructor(sample1: number[], sample2: number[], reason: string) {
    super({
      message: `Invalid t-test: sample1Size=${sample1.length}, sample2Size=${sample2.length} - ${reason}`,
      code: 'INVALID_T_TEST',
      metadata: { sample1, sample2, reason },
    })
  }
}
