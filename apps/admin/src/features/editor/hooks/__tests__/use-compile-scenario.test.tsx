import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCompileScenario } from '../use-compile-scenario'

global.fetch = vi.fn()

describe('useCompileScenario', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should successfully compile JSX code', async () => {
    const mockResponse = {
      key: 'test-scenario',
      version: '1.0.0',
      main: { type: 'View' },
      components: {},
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const { result } = renderHook(() => useCompileScenario(), { wrapper })

    result.current.mutate({ jsxCode: 'test code' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith('http://localhost:3050/api/scenarios/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsxCode: 'test code' }),
    })
  })

  it('should handle compilation errors', async () => {
    const mockError = {
      error: 'Compilation failed',
      errors: [
        { code: 'SYNTAX_ERROR', message: 'Invalid JSX', severity: 'error' },
      ],
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => mockError,
    } as Response)

    const { result } = renderHook(() => useCompileScenario(), { wrapper })

    result.current.mutate({ jsxCode: 'invalid code' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(mockError)
  })

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCompileScenario(), { wrapper })

    result.current.mutate({ jsxCode: 'test code' })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('should be in pending state while compiling', async () => {
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ key: 'test', version: '1.0.0', main: {}, components: {} }),
              } as Response),
            100,
          )
        }),
    )

    const { result } = renderHook(() => useCompileScenario(), { wrapper })

    result.current.mutate({ jsxCode: 'test code' })

    expect(result.current.isPending).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
