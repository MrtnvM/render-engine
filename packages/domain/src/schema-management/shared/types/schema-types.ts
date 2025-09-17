import { SchemaStatus } from '../enums/index.js'
import { Name } from '../../../kernel/value-objects/name.value-object.js'
import { Description } from '../../../kernel/value-objects/description.value-object.js'

export interface SchemaValidationRuleInterface {
  name: Name
  toJSON(): any
}

export interface SchemaJSON {
  id: string
  name: string
  version: string
  description?: string
  components: any[]
  globalProperties?: any[]
  validationRules?: any[]
  metadata: {
    createdAt: string
    updatedAt: string
    createdBy?: string
    tags?: string[]
    [key: string]: unknown
  }
  status: SchemaStatus
  compatibility?: {
    backwardCompatible: boolean
    breakingChanges?: string[]
  }
}

export interface CompatibilityStatus {
  backwardCompatible: boolean
  breakingChanges: string[]
}

export interface CompatibilityResult {
  isCompatible: boolean
  issues: string[]
  breakingChanges: string[]
}

export interface SchemaChange {
  type: 'add' | 'remove' | 'update' | 'rename'
  target: 'component' | 'property' | 'validation'
  targetId: string
  description: Description
  impact: 'low' | 'medium' | 'high'
}
