import { PropertyJSON, Component } from '../../../schema-management/index.js'
import { ComponentType, PlatformSupport } from '../enums/index.js'

export interface ComponentId {
  value: string
}

export interface ComponentMetadata {
  createdAt: Date
  updatedAt: Date
  version: string
  platform?: PlatformSupport[]
  [key: string]: unknown
}

export interface ComponentProps {
  id?: ComponentId
  name: string
  type: ComponentType
  description?: string
  properties: PropertyJSON[]
  children?: Component[]
  parentId?: ComponentId | null
  validationRules?: any[]
  events?: ComponentEvent[]
  styles?: ComponentStyle[]
  metadata: ComponentMetadata
}

export interface ComponentJSON {
  id: string
  name: string
  type: string
  description?: string
  properties: PropertyJSON[]
  children?: ComponentJSON[]
  parentId?: string
  validationRules?: any[]
  events?: ComponentEvent[]
  styles?: ComponentStyle[]
  metadata: {
    createdAt: string
    updatedAt: string
    version: string
    platform?: string[]
    [key: string]: unknown
  }
}

export interface ComponentEvent {
  name: string
  type: string
  handler: string
  parameters?: PropertyJSON[]
}

export interface ComponentStyle {
  property: string
  value: string | number
  platform?: PlatformSupport[]
}
