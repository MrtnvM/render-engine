// API request/response types for the scenarios API

export interface CreateScenarioRequest {
  key: string
  mainComponent: Record<string, any>
  components?: Record<string, any>
  version?: string
  metadata?: Record<string, any>
}

export interface UpdateScenarioRequest {
  key?: string
  mainComponent?: Record<string, any>
  components?: Record<string, any>
  version?: string
  metadata?: Record<string, any>
}

export interface ScenarioResponse {
  id: string
  key: string
  mainComponent: Record<string, any>
  components: Record<string, any>
  version: string
  buildNumber: number
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface PaginatedScenariosResponse {
  data: ScenarioResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface AnalyticsViewRequest {
  platform?: string
  userAgent?: string
  sessionId?: string
}

export interface AnalyticsInteractionRequest {
  componentId: string
  interactionType: string
  platform?: string
  userAgent?: string
  sessionId?: string
  metadata?: Record<string, any>
}

export interface ScenarioAnalyticsResponse {
  scenarioId: string
  totalViews: number
  totalInteractions: number
  platforms: {
    android: number
    ios: number
    web: number
  }
  topComponents: Array<{
    componentId: string
    interactions: number
  }>
  timeRange: {
    start: string
    end: string
  }
}

export interface DashboardAnalyticsResponse {
  totalScenarios: number
  totalViews: number
  totalInteractions: number
  recentScenarios: Array<{
    id: string
    key: string
    version: string
    updatedAt: string
  }>
  platformStats: {
    android: number
    ios: number
    web: number
  }
  timeRange: {
    start: string
    end: string
  }
}

export interface ApiError {
  error: string
  message?: string
  details?: string[]
  timestamp: string
}

export interface CompileRequest {
  jsxCode: string
}

export interface PublishRequest {
  key: string
  main: Record<string, any>
  components: Record<string, any>
  version?: string
  metadata?: Record<string, any>
}