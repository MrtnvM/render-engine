import { TranspilerConfig } from './types'
import { File } from '@babel/types'

export type TranspilerPluginContext = {
  config: TranspilerConfig
  jsxCode: string
}

export abstract class TranspilerPlugin {
  abstract transpile<T>(ast: File, context: TranspilerPluginContext): T
}
