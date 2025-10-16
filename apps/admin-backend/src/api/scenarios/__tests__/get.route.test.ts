import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import getRoute from '../get.route.js'

vi.mock('../../../di-container.js', () => ({
  container: {
    resolve: vi.fn(),
  },
}))

import { container } from '../../../di-container.js'

describe('GET /api/scenarios', () => {
  let app: Hono
  const mockScenario = {
    id: 'uuid-123',
    key: 'test-scenario',
    version: '1.0.0',
    buildNumber: 1,
    mainComponent: { type: 'View' },
    components: {},
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  beforeEach(() => {
    app = new Hono()
    app.route('/', getRoute)
    vi.clearAllMocks()
  })

  describe('GET /:key', () => {
    it('should return scenario by key', async () => {
      const mockGetUseCase = {
        getByKey: vi.fn().mockResolvedValue(mockScenario),
      }

      vi.mocked(container.resolve).mockReturnValue(mockGetUseCase)

      const response = await app.request('/test-scenario')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.key).toBe('test-scenario')
      expect(mockGetUseCase.getByKey).toHaveBeenCalledWith('test-scenario')
    })

    it('should return 404 when scenario not found', async () => {
      const mockGetUseCase = {
        getByKey: vi.fn().mockResolvedValue(null),
      }

      vi.mocked(container.resolve).mockReturnValue(mockGetUseCase)

      const response = await app.request('/non-existent')

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toContain('not found')
    })

    it('should handle internal server errors', async () => {
      const mockGetUseCase = {
        getByKey: vi.fn().mockRejectedValue(new Error('Database error')),
      }

      vi.mocked(container.resolve).mockReturnValue(mockGetUseCase)

      const response = await app.request('/test-scenario')

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('GET /:key/versions', () => {
    it('should return all versions of scenario', async () => {
      const mockVersions = [
        { ...mockScenario, version: '1.0.0', buildNumber: 1 },
        { ...mockScenario, version: '1.0.0', buildNumber: 2 },
        { ...mockScenario, version: '1.1.0', buildNumber: 1 },
      ]

      const mockGetUseCase = {
        getVersions: vi.fn().mockResolvedValue(mockVersions),
      }

      vi.mocked(container.resolve).mockReturnValue(mockGetUseCase)

      const response = await app.request('/test-scenario/versions')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveLength(3)
      expect(mockGetUseCase.getVersions).toHaveBeenCalledWith('test-scenario')
    })

    it('should return empty array when no versions found', async () => {
      const mockGetUseCase = {
        getVersions: vi.fn().mockResolvedValue([]),
      }

      vi.mocked(container.resolve).mockReturnValue(mockGetUseCase)

      const response = await app.request('/test-scenario/versions')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual([])
    })
  })

  describe('GET /:key/version/:version', () => {
    it('should return specific version of scenario', async () => {
      const mockGetUseCase = {
        getByKeyAndVersion: vi.fn().mockResolvedValue(mockScenario),
      }

      vi.mocked(container.resolve).mockReturnValue(mockGetUseCase)

      const response = await app.request('/test-scenario/version/1.0.0')

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.key).toBe('test-scenario')
      expect(data.version).toBe('1.0.0')
      expect(mockGetUseCase.getByKeyAndVersion).toHaveBeenCalledWith('test-scenario', '1.0.0')
    })

    it('should return 404 when version not found', async () => {
      const mockGetUseCase = {
        getByKeyAndVersion: vi.fn().mockResolvedValue(null),
      }

      vi.mocked(container.resolve).mockReturnValue(mockGetUseCase)

      const response = await app.request('/test-scenario/version/2.0.0')

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toContain('not found')
    })
  })
})
