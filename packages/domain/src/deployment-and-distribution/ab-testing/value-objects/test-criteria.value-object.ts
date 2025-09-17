import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'
import { ValidationError } from '../../../kernel/errors/validation.error.js'
import { InvalidValueError } from '../../../kernel/errors/invalid-value.error.js'

export interface TestCriteriaData {
  platform?: string
  region?: string
  deviceType?: string
  browser?: string
  signupDate?: {
    after?: Date
    before?: Date
  }
  lastActiveDate?: {
    after?: Date
    before?: Date
  }
  customAttributes?: Record<string, string | number | boolean>
}

/**
 * TestCriteria Value Object
 *
 * Defines user segmentation criteria for A/B testing groups.
 * Encapsulates rules for determining which users belong to a specific test group
 * based on various attributes like platform, region, device, and custom attributes.
 */
export class TestCriteria extends ValueObject<TestCriteriaData> {
  private static readonly VALID_PLATFORMS = ['web', 'mobile', 'desktop']
  private static readonly VALID_REGIONS = ['us', 'eu', 'asia', 'latam']
  private static readonly VALID_DEVICE_TYPES = ['phone', 'tablet', 'desktop']
  private static readonly MAX_CUSTOM_ATTRIBUTES = 10

  private constructor(value: TestCriteriaData) {
    super(value)
  }

  get value(): TestCriteriaData {
    return this._value
  }

  public static create(criteria: TestCriteriaData): TestCriteria {
    const normalized = this.normalizeCriteria(criteria)

    // Validate criteria structure
    this.validateCriteria(normalized)

    return new TestCriteria(normalized)
  }

  private static normalizeCriteria(criteria: TestCriteriaData): TestCriteriaData {
    const normalized: TestCriteriaData = {}

    // Normalize platform
    if (criteria.platform) {
      normalized.platform = criteria.platform.toLowerCase().trim()
    }

    // Normalize region
    if (criteria.region) {
      normalized.region = criteria.region.toLowerCase().trim()
    }

    // Normalize device type
    if (criteria.deviceType) {
      normalized.deviceType = criteria.deviceType.toLowerCase().trim()
    }

    // Normalize browser
    if (criteria.browser) {
      normalized.browser = criteria.browser.toLowerCase().trim()
    }

    // Normalize dates
    if (criteria.signupDate) {
      normalized.signupDate = {}
      if (criteria.signupDate.after) {
        normalized.signupDate.after = new Date(criteria.signupDate.after)
      }
      if (criteria.signupDate.before) {
        normalized.signupDate.before = new Date(criteria.signupDate.before)
      }
    }

    if (criteria.lastActiveDate) {
      normalized.lastActiveDate = {}
      if (criteria.lastActiveDate.after) {
        normalized.lastActiveDate.after = new Date(criteria.lastActiveDate.after)
      }
      if (criteria.lastActiveDate.before) {
        normalized.lastActiveDate.before = new Date(criteria.lastActiveDate.before)
      }
    }

    // Normalize custom attributes
    if (criteria.customAttributes) {
      normalized.customAttributes = { ...criteria.customAttributes }
    }

    return normalized
  }

  private static validateCriteria(criteria: TestCriteriaData): void {
    // Validate platform
    if (criteria.platform && !this.VALID_PLATFORMS.includes(criteria.platform)) {
      throw InvalidValueError.forField(
        'platform',
        criteria.platform,
        `must be one of: ${this.VALID_PLATFORMS.join(', ')}`,
      )
    }

    // Validate region
    if (criteria.region && !this.VALID_REGIONS.includes(criteria.region)) {
      throw InvalidValueError.forField('region', criteria.region, `must be one of: ${this.VALID_REGIONS.join(', ')}`)
    }

    // Validate device type
    if (criteria.deviceType && !this.VALID_DEVICE_TYPES.includes(criteria.deviceType)) {
      throw InvalidValueError.forField(
        'deviceType',
        criteria.deviceType,
        `must be one of: ${this.VALID_DEVICE_TYPES.join(', ')}`,
      )
    }

    // Validate date ranges
    if (criteria.signupDate) {
      this.validateDateRange('signupDate', criteria.signupDate)
    }

    if (criteria.lastActiveDate) {
      this.validateDateRange('lastActiveDate', criteria.lastActiveDate)
    }

    // Validate custom attributes
    if (criteria.customAttributes) {
      this.validateCustomAttributes(criteria.customAttributes)
    }

    // Ensure at least one criterion is specified
    const hasCriteria = Object.keys(criteria).some((key) => {
      const value = criteria[key as keyof TestCriteriaData]
      return value !== undefined && value !== null && value !== ''
    })

    if (!hasCriteria) {
      throw ValidationError.forField('criteria', criteria, 'at least one segmentation criterion must be specified')
    }
  }

  private static validateDateRange(fieldName: string, dateRange: { after?: Date; before?: Date }): void {
    if (dateRange.after && dateRange.before) {
      if (dateRange.after > dateRange.before) {
        throw ValidationError.forField(fieldName, dateRange, 'after date must be before before date')
      }
    }

    // Validate dates are not in the future for signupDate
    if (fieldName === 'signupDate') {
      const now = new Date()
      if (dateRange.after && dateRange.after > now) {
        throw ValidationError.forField(fieldName, dateRange, 'signup after date cannot be in the future')
      }
      if (dateRange.before && dateRange.before > now) {
        throw ValidationError.forField(fieldName, dateRange, 'signup before date cannot be in the future')
      }
    }
  }

  private static validateCustomAttributes(attributes: Record<string, string | number | boolean>): void {
    const keys = Object.keys(attributes)

    if (keys.length > this.MAX_CUSTOM_ATTRIBUTES) {
      throw ValidationError.forField(
        'customAttributes',
        attributes,
        `maximum ${this.MAX_CUSTOM_ATTRIBUTES} custom attributes allowed`,
      )
    }

    // Validate attribute keys are valid
    for (const key of keys) {
      if (typeof key !== 'string' || !key.match(/^[a-z_]\w*$/i)) {
        throw ValidationError.forField(
          'customAttributes',
          attributes,
          `invalid attribute key: ${key}. Keys must be valid identifiers`,
        )
      }
    }

    // Validate attribute values
    for (const [key, value] of Object.entries(attributes)) {
      if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
        throw ValidationError.forField(
          'customAttributes',
          attributes,
          `invalid value type for attribute ${key}. Must be string, number, or boolean`,
        )
      }
    }
  }

  public matchesUser(userAttributes: Record<string, unknown>): boolean {
    // Check platform
    if (this._value.platform && userAttributes.platform !== this._value.platform) {
      return false
    }

    // Check region
    if (this._value.region && userAttributes.region !== this._value.region) {
      return false
    }

    // Check device type
    if (this._value.deviceType && userAttributes.deviceType !== this._value.deviceType) {
      return false
    }

    // Check browser
    if (this._value.browser && userAttributes.browser !== this._value.browser) {
      return false
    }

    // Check signup date range
    if (this._value.signupDate) {
      const userSignupDate = userAttributes.signupDate as Date | undefined
      if (!userSignupDate) {
        return false
      }

      if (this._value.signupDate.after && userSignupDate < this._value.signupDate.after) {
        return false
      }

      if (this._value.signupDate.before && userSignupDate > this._value.signupDate.before) {
        return false
      }
    }

    // Check last active date range
    if (this._value.lastActiveDate) {
      const userLastActiveDate = userAttributes.lastActiveDate as Date | undefined
      if (!userLastActiveDate) {
        return false
      }

      if (this._value.lastActiveDate.after && userLastActiveDate < this._value.lastActiveDate.after) {
        return false
      }

      if (this._value.lastActiveDate.before && userLastActiveDate > this._value.lastActiveDate.before) {
        return false
      }
    }

    // Check custom attributes
    if (this._value.customAttributes) {
      for (const [key, expectedValue] of Object.entries(this._value.customAttributes)) {
        const userValue = userAttributes[key]
        if (userValue !== expectedValue) {
          return false
        }
      }
    }

    return true
  }

  public isEmpty(): boolean {
    return Object.keys(this._value).length === 0
  }

  public toJSON(): Record<string, unknown> {
    return {
      ...this._value,
      // Convert Date objects to ISO strings for serialization
      signupDate: this._value.signupDate
        ? {
            after: this._value.signupDate.after?.toISOString(),
            before: this._value.signupDate.before?.toISOString(),
          }
        : undefined,
      lastActiveDate: this._value.lastActiveDate
        ? {
            after: this._value.lastActiveDate.after?.toISOString(),
            before: this._value.lastActiveDate.before?.toISOString(),
          }
        : undefined,
    }
  }

  public toPrimitive(): TestCriteriaData {
    return {
      ...this._value,
      // Keep Date objects as Date objects for primitive representation
      signupDate: this._value.signupDate
        ? {
            after: this._value.signupDate.after,
            before: this._value.signupDate.before,
          }
        : undefined,
      lastActiveDate: this._value.lastActiveDate
        ? {
            after: this._value.lastActiveDate.after,
            before: this._value.lastActiveDate.before,
          }
        : undefined,
    }
  }

  public toString(): string {
    const criteria = []

    if (this._value.platform) criteria.push(`platform:${this._value.platform}`)
    if (this._value.region) criteria.push(`region:${this._value.region}`)
    if (this._value.deviceType) criteria.push(`deviceType:${this._value.deviceType}`)
    if (this._value.browser) criteria.push(`browser:${this._value.browser}`)

    if (this._value.customAttributes) {
      const customAttrs = Object.entries(this._value.customAttributes)
        .map(([key, value]) => `${key}:${value}`)
        .join(',')
      if (customAttrs) criteria.push(`custom:${customAttrs}`)
    }

    return criteria.length > 0 ? criteria.join(';') : 'no-criteria'
  }
}
