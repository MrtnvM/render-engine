/**
 * Value Descriptors for Declarative Actions
 *
 * These descriptors represent values that can be resolved at runtime,
 * including literals, store references, computed values, and event data.
 */

export type ValueDescriptor = LiteralValue | StoreValueRef | ComputedValue | EventDataRef

/**
 * Literal value (known at transpile time)
 */
export interface LiteralValue {
  kind: 'literal'
  type: 'string' | 'number' | 'integer' | 'bool' | 'null' | 'array' | 'object'
  value: string | number | boolean | null | LiteralValue[] | Record<string, LiteralValue>
}

/**
 * Reference to a value in a store
 */
export interface StoreValueRef {
  kind: 'storeValue'
  storeRef: StoreReference
  keyPath: string
  defaultValue?: LiteralValue
}

/**
 * Computed value from multiple operands
 */
export interface ComputedValue {
  kind: 'computed'
  operation: ComputedOperation
  operands: ValueDescriptor[]
  template?: string // For template operation: "Hello, {0}!"
}

export type ComputedOperation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'modulo'
  | 'concat'
  | 'template'
  | 'negate'
  | 'not'

/**
 * Reference to event data (e.g., from button press, text input)
 */
export interface EventDataRef {
  kind: 'eventData'
  path: string // e.g., "value", "checked", "selectedIndex"
}

/**
 * Store reference for identifying a specific store
 */
export interface StoreReference {
  scope: 'app' | 'scenario'
  storage: 'memory' | 'userPrefs' | 'file' | 'backend'
}

/**
 * Condition descriptor for conditional actions
 */
export interface ConditionDescriptor {
  type: ConditionType
  left?: ValueDescriptor
  right?: ValueDescriptor
  conditions?: ConditionDescriptor[] // For 'and', 'or', 'not'
}

export type ConditionType =
  // Comparison
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  // String operations
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  // Nullability checks
  | 'isEmpty'
  | 'isNull'
  | 'isNotNull'
  // Logical operations
  | 'and'
  | 'or'
  | 'not'

/**
 * Helper to create literal values
 */
export const literal = {
  string: (value: string): LiteralValue => ({ kind: 'literal', type: 'string', value }),
  number: (value: number): LiteralValue => ({ kind: 'literal', type: 'number', value }),
  integer: (value: number): LiteralValue => ({ kind: 'literal', type: 'integer', value: Math.floor(value) }),
  bool: (value: boolean): LiteralValue => ({ kind: 'literal', type: 'bool', value }),
  null: (): LiteralValue => ({ kind: 'literal', type: 'null', value: null }),
  array: (value: LiteralValue[]): LiteralValue => ({ kind: 'literal', type: 'array', value }),
  object: (value: Record<string, LiteralValue>): LiteralValue => ({ kind: 'literal', type: 'object', value }),
}

/**
 * Helper to create store references
 */
export function storeValue(
  keyPath: string,
  storeRef: StoreReference,
  defaultValue?: LiteralValue,
): StoreValueRef {
  return { kind: 'storeValue', keyPath, storeRef, defaultValue }
}

/**
 * Helper to create computed values
 */
export function computed(operation: ComputedOperation, ...operands: ValueDescriptor[]): ComputedValue {
  return { kind: 'computed', operation, operands }
}

/**
 * Helper to create event data references
 */
export function eventData(path: string): EventDataRef {
  return { kind: 'eventData', path }
}
