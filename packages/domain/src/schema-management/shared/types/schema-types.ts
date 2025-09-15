import { SchemaStatus } from '../enums/index.js'

export interface SemanticVersion {
  major: number
  minor: number
  patch: number
}

export interface SchemaMetadata {
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  tags?: string[]
  [key: string]: unknown
}

// Forward declarations to avoid circular dependencies
export interface Component {
  id: { value: string }
  name: string
  toJSON(): any
}

export interface PropertyType {
  name: string
  toJSON(): any
}

export interface SchemaValidationRuleInterface {
  name: string
  toJSON(): any
}

export interface SchemaProps {
  name: string
  version: SemanticVersion
  description?: string
  components: Component[]
  globalProperties?: PropertyType[]
  validationRules?: SchemaValidationRuleInterface[]
  metadata: SchemaMetadata
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
  description: string
  impact: 'low' | 'medium' | 'high'
}
