import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import publishRoute from '../publish.route.js'

vi.mock('../../../di-container.js', () => ({
  container: {
    resolve: vi.fn(),
  },
}))

import { container } from '../../../di-container.js'

describe('POST /api/scenarios/publish', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.route('/', publishRoute)
    vi.clearAllMocks()
  })

  it('should publish valid scenario', async () => {
    const mockPublishUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: 'uuid-123',
        key: 'test-scenario',
        version: '1.0.0',
        buildNumber: 1,
        mainComponent: { type: 'View' },
        components: {},
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }

    vi.mocked(container.resolve).mockReturnValue(mockPublishUseCase)

    const response = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'test-scenario',
        version: '1.0.0',
        mainComponent: { type: 'View' },
        components: {},
      }),
    })

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.id).toBe('uuid-123')
    expect(data.key).toBe('test-scenario')
    expect(data.buildNumber).toBe(1)
  })

  it('should return 400 for invalid request body', async () => {
    const response = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })

  it('should return 400 for missing key', async () => {
    const response = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mainComponent: { type: 'View' },
        components: {},
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })

  it('should handle publish errors', async () => {
    const mockPublishUseCase = {
      execute: vi.fn().mockRejectedValue({
        name: 'PublishError',
        message: 'Invalid version format',
      }),
    }

    vi.mocked(container.resolve).mockReturnValue(mockPublishUseCase)

    const response = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'test',
        version: 'invalid',
        mainComponent: { type: 'View' },
        components: {},
      }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid version format')
  })

  it('should handle internal server errors', async () => {
    const mockPublishUseCase = {
      execute: vi.fn().mockRejectedValue(new Error('Database error')),
    }

    vi.mocked(container.resolve).mockReturnValue(mockPublishUseCase)

    const response = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'test',
        mainComponent: { type: 'View' },
        components: {},
      }),
    })

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Internal server error during publishing')
  })

  it('should accept stores and actions in request', async () => {
    const mockPublishUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: 'uuid-123',
        key: 'test',
        version: '1.0.0',
        buildNumber: 1,
        mainComponent: { type: 'View' },
        components: {},
        metadata: {
          stores: [{ name: 'userStore' }],
          actions: [{ name: 'updateUser' }],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }

    vi.mocked(container.resolve).mockReturnValue(mockPublishUseCase)

    const response = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'test',
        mainComponent: { type: 'View' },
        components: {},
        stores: [{ name: 'userStore' }],
        actions: [{ name: 'updateUser' }],
      }),
    })

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.metadata.stores).toHaveLength(1)
    expect(data.metadata.actions).toHaveLength(1)
  })
})
