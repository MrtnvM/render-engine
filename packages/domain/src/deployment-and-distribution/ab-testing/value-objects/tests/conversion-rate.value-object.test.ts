import { describe, it, expect } from 'vitest'
import { ConversionRate } from '../conversion-rate.value-object.js'
import { InvalidConversionRateError, InvalidConfidenceLevelError } from '../errors/conversion-rate.errors.js'

describe('ConversionRate', () => {
  describe('create with valid inputs', () => {
    it('should create conversion rate with basic values', () => {
      const rate = ConversionRate.calculate(45, 100)

      expect(rate.conversions).toBe(45)
      expect(rate.totalUsers).toBe(100)
      expect(rate.rate).toBe(0.45)
      expect(rate.percentage).toBe(45)
      expect(rate.formattedPercentage).toBe('45.000000%')
    })

    it('should handle zero conversions', () => {
      const rate = ConversionRate.calculate(0, 100)

      expect(rate.conversions).toBe(0)
      expect(rate.totalUsers).toBe(100)
      expect(rate.rate).toBe(0)
      expect(rate.percentage).toBe(0)
    })

    it('should handle perfect conversion', () => {
      const rate = ConversionRate.calculate(100, 100)

      expect(rate.conversions).toBe(100)
      expect(rate.totalUsers).toBe(100)
      expect(rate.rate).toBe(1)
      expect(rate.percentage).toBe(100)
    })

    it('should round rate to 6 decimal places', () => {
      const rate = ConversionRate.calculate(1, 3)

      expect(rate.rate).toBe(0.333333)
      expect(rate.percentage).toBe(33.3333)
    })
  })

  describe('validation', () => {
    it('should throw error for negative conversions', () => {
      expect(() => ConversionRate.calculate(-1, 100)).toThrow(InvalidConversionRateError)
    })

    it('should throw error for non-integer conversions', () => {
      expect(() => ConversionRate.calculate(45.5, 100)).toThrow(InvalidConversionRateError)
    })

    it('should throw error for zero total users', () => {
      expect(() => ConversionRate.calculate(45, 0)).toThrow(InvalidConversionRateError)
    })

    it('should throw error for negative total users', () => {
      expect(() => ConversionRate.calculate(45, -100)).toThrow(InvalidConversionRateError)
    })

    it('should throw error for non-integer total users', () => {
      expect(() => ConversionRate.calculate(45, 100.5)).toThrow(InvalidConversionRateError)
    })

    it('should throw error when conversions exceed total users', () => {
      expect(() => ConversionRate.calculate(150, 100)).toThrow(InvalidConversionRateError)
    })
  })

  describe('confidence interval', () => {
    it('should calculate 95% confidence interval for large sample', () => {
      const rate = ConversionRate.calculate(450, 1000)
      const [lower, upper] = rate.getConfidenceInterval(0.95)

      expect(lower).toBeGreaterThan(0)
      expect(upper).toBeLessThan(1)
      expect(lower).toBeLessThan(rate.rate)
      expect(upper).toBeGreaterThan(rate.rate)
    })

    it('should calculate confidence interval for small sample using Wilson score', () => {
      const rate = ConversionRate.calculate(5, 20)
      const [lower, upper] = rate.getConfidenceInterval(0.95)

      expect(lower).toBeGreaterThan(0)
      expect(upper).toBeLessThan(1)
    })

    it('should throw error for invalid confidence level', () => {
      const rate = ConversionRate.calculate(45, 100)

      expect(() => rate.getConfidenceInterval(0)).toThrow(InvalidConfidenceLevelError)
      expect(() => rate.getConfidenceInterval(1)).toThrow(InvalidConfidenceLevelError)
      expect(() => rate.getConfidenceInterval(-0.1)).toThrow(InvalidConfidenceLevelError)
    })

    it('should handle different confidence levels', () => {
      const rate = ConversionRate.calculate(45, 100)
      const ci90 = rate.getConfidenceInterval(0.9)
      const ci95 = rate.getConfidenceInterval(0.95)
      const ci99 = rate.getConfidenceInterval(0.99)

      // 99% CI should be wider than 95% CI
      expect(ci99[1] - ci99[0]).toBeGreaterThan(ci95[1] - ci95[0])
      // 95% CI should be wider than 90% CI
      expect(ci95[1] - ci95[0]).toBeGreaterThan(ci90[1] - ci90[0])
    })
  })

  describe('immutability methods', () => {
    it('should create new instance with updated conversions', () => {
      const original = ConversionRate.calculate(45, 100)
      const updated = original.withConversions(50)

      expect(updated.conversions).toBe(50)
      expect(updated.totalUsers).toBe(100)
      expect(updated.rate).toBe(0.5)

      // Original should remain unchanged
      expect(original.conversions).toBe(45)
    })

    it('should create new instance with updated total users', () => {
      const original = ConversionRate.calculate(45, 100)
      const updated = original.withTotalUsers(200)

      expect(updated.conversions).toBe(45)
      expect(updated.totalUsers).toBe(200)
      expect(updated.rate).toBe(0.225)

      // Original should remain unchanged
      expect(original.totalUsers).toBe(100)
    })
  })

  describe('statistical significance', () => {
    it('should detect significant difference between different rates', () => {
      const rateA = ConversionRate.calculate(45, 1000) // 4.5%
      const rateB = ConversionRate.calculate(85, 1000) // 8.5%

      const isSignificant = rateA.isStatisticallySignificant(rateB)
      expect(isSignificant).toBe(true)
    })

    it('should not detect significant difference for similar rates', () => {
      const rateA = ConversionRate.calculate(450, 10000) // 4.5%
      const rateB = ConversionRate.calculate(460, 10000) // 4.6%

      const isSignificant = rateA.isStatisticallySignificant(rateB)
      expect(isSignificant).toBe(false)
    })

    it('should handle different sample sizes', () => {
      const rateA = ConversionRate.calculate(9, 100) // 9%
      const rateB = ConversionRate.calculate(90, 1000) // 9%

      const isSignificant = rateA.isStatisticallySignificant(rateB)
      expect(isSignificant).toBe(false)
    })

    it('should return false for non-ConversionRate input', () => {
      const rateA = ConversionRate.calculate(45, 100)
      const isSignificant = rateA.isStatisticallySignificant({} as any)
      expect(isSignificant).toBe(false)
    })
  })

  describe('equality', () => {
    it('should return true for identical rates', () => {
      const rateA = ConversionRate.calculate(45, 100)
      const rateB = ConversionRate.calculate(45, 100)

      expect(rateA.equals(rateB)).toBe(true)
    })

    it('should return false for different rates', () => {
      const rateA = ConversionRate.calculate(45, 100)
      const rateB = ConversionRate.calculate(50, 100)

      expect(rateA.equals(rateB)).toBe(false)
    })

    it('should return false for null or undefined', () => {
      const rate = ConversionRate.calculate(45, 100)

      expect(rate.equals(null)).toBe(false)
      expect(rate.equals(undefined)).toBe(false)
    })

    it('should return false for different types', () => {
      const rate = ConversionRate.calculate(45, 100)

      expect(rate.equals({} as any)).toBe(false)
    })
  })

  describe('serialization', () => {
    it('should convert to JSON', () => {
      const rate = ConversionRate.calculate(45, 100)
      const json = rate.toJSON()

      expect(json).toEqual({
        conversions: 45,
        totalUsers: 100,
        rate: 0.45,
        percentage: 45,
        formattedPercentage: '45.000000%',
      })
    })

    it('should convert to string', () => {
      const rate = ConversionRate.calculate(45, 100)
      const str = rate.toString()

      expect(str).toBe('45/100 (45.000000%)')
    })
  })

  describe('edge cases', () => {
    it('should handle very small sample sizes', () => {
      const rate = ConversionRate.calculate(1, 2)
      const [lower, upper] = rate.getConfidenceInterval(0.95)

      expect(lower).toBeGreaterThanOrEqual(0)
      expect(upper).toBeLessThanOrEqual(1)
    })

    it('should handle very large sample sizes', () => {
      const rate = ConversionRate.calculate(500000, 1000000)
      expect(rate.rate).toBe(0.5)
    })

    it('should handle boundary confidence levels', () => {
      const rate = ConversionRate.calculate(45, 100)

      // Should not throw for values close to boundaries
      expect(() => rate.getConfidenceInterval(0.001)).not.toThrow()
      expect(() => rate.getConfidenceInterval(0.999)).not.toThrow()
    })

    it('should handle very small rates', () => {
      const rate = ConversionRate.calculate(1, 10000)
      const [lower, upper] = rate.getConfidenceInterval(0.95)

      expect(lower).toBeGreaterThanOrEqual(0)
      expect(upper).toBeGreaterThan(0)
    })
  })
})
