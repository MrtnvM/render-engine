import { CompilationError } from '@render-engine/admin-backend-application';
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Hono } from 'hono'
import compileRoute from '../compile.route.js'

// Mock the DI container
vi.mock('../../../di-container.js', () => ({
  container: {
    resolve: vi.fn(),
  },
}))

import { container } from '../../../di-container.js'

describe('POST /api/scenarios/compile', () => {
  let app: Hono

  beforeEach(() => {
    app = new Hono()
    app.route('/', compileRoute)
    vi.clearAllMocks()
  })

  it('should compile valid JSX code', async () => {
    const mockCompileUseCase = {
      execute: vi.fn().mockResolvedValue({
        key: 'test-scenario',
        version: '1.0.0',
        main: { type: 'View' },
        components: {},
      }),
    }

    vi.mocked(container.resolve).mockReturnValue(mockCompileUseCase)

    const response = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsxCode: 'export default function Main() { return <View /> }',
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.key).toBe('test-scenario')
    expect(data.version).toBe('1.0.0')
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

  it('should return 400 for empty JSX code', async () => {
    const response = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsxCode: '' }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })

  it('should handle compilation errors', async () => {
    const mockCompileUseCase = {
      execute: vi.fn().mockRejectedValue(new CompilationError('Syntax error', [{ code: 'SYNTAX_ERROR', message: 'Unexpected token', severity: 'error' }])),
    }

    vi.mocked(container.resolve).mockReturnValue(mockCompileUseCase)

    const response = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsxCode: 'invalid code' }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Syntax error')
    expect(data.errors).toHaveLength(1)
  })

  it('should handle internal server errors', async () => {
    const mockCompileUseCase = {
      execute: vi.fn().mockRejectedValue(new Error('Unexpected error')),
    }

    vi.mocked(container.resolve).mockReturnValue(mockCompileUseCase)

    const response = await app.request('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsxCode: 'test code' }),
    })

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Internal server error during compilation')
  })
})
