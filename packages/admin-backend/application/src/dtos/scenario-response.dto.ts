/**
 * DTO для ответа с данными сценария
 */
export interface ScenarioResponseDto {
  id: string
  key: string
  version: string
  buildNumber: number
  mainComponent: Record<string, any>
  components: Record<string, any>
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

/**
 * DTO для скомпилированного сценария (до сохранения в БД)
 */
export interface CompiledScenarioDto {
  key: string
  version: string
  main: Record<string, any>
  components: Record<string, any>
  stores?: Array<{
    name: string
    scope: string
    storage: string
    initialData?: any
  }>
  actions?: Array<{
    name: string
    type: string
    payload?: any
  }>
}
