import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'

export interface DescriptionProps {
  value: string
}

export class Description extends ValueObject<string> {
  public static readonly MAX_LENGTH = 500

  private constructor(value: string) {
    super(value)
  }

  get value(): string {
    return this._value
  }

  public static create(value?: string): Description {
    if (!value || value.trim() === '') {
      return new Description('')
    }

    const trimmed = value.trim()
    if (trimmed.length > Description.MAX_LENGTH) {
      throw new Error(`Description must be less than ${Description.MAX_LENGTH} characters`)
    }

    return new Description(trimmed)
  }

  public toJSON(): object {
    return { value: this._value }
  }

  public toPrimitive(): string {
    return this._value
  }

  public toString(): string {
    return this._value
  }
}
