import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'

export interface NameProps {
  value: string
}

export class Name extends ValueObject<string> {
  public static readonly MIN_LENGTH = 3
  public static readonly MAX_LENGTH = 100

  private constructor(value: string) {
    super(value)
  }

  get value(): string {
    return this._value
  }

  public static create(value: string): Name {
    const trimmed = value.trim()
    if (trimmed.length < Name.MIN_LENGTH || trimmed.length > Name.MAX_LENGTH) {
      throw new Error(`Name must be between ${Name.MIN_LENGTH} and ${Name.MAX_LENGTH} characters`)
    }
    return new Name(trimmed)
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