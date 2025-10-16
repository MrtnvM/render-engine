import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePublishScenario } from '../use-publish-scenario'

global.fetch = vi.fn()

describe('usePublishScenario', () => {
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

  it('should successfully publish scenario', async () => {
    const mockResponse = {
      id: 'uuid-123',
      key: 'test-scenario',
      version: '1.0.0',
      buildNumber: 1,
      mainComponent: { type: 'View' },
      components: {},
      metadata: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const { result } = renderHook(() => usePublishScenario(), { wrapper })

    const publishData = {
      key: 'test-scenario',
      version: '1.0.0',
      mainComponent: { type: 'View' },
      components: {},
    }

    result.current.mutate(publishData)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith('http://localhost:3050/api/scenarios/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(publishData),
    })
  })

  it('should handle publish errors', async () => {
    const mockError = {
      error: 'Invalid version format',
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => mockError,
    } as Response)

    const { result } = renderHook(() => usePublishScenario(), { wrapper })

    result.current.mutate({
      key: 'test',
      version: 'invalid',
      mainComponent: {},
      components: {},
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(mockError)
  })

  it('should invalidate scenarios query on success', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const mockResponse = {
      id: 'uuid-123',
      key: 'test',
      version: '1.0.0',
      buildNumber: 1,
      mainComponent: {},
      components: {},
      metadata: {},
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const { result } = renderHook(() => usePublishScenario(), { wrapper })

    result.current.mutate({
      key: 'test',
      mainComponent: {},
      components: {},
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['scenarios'] })
  })

  it('should include stores and actions in request', async () => {
    const mockResponse = {
      id: 'uuid-123',
      key: 'test',
      version: '1.0.0',
      buildNumber: 1,
      mainComponent: {},
      components: {},
      metadata: { stores: [], actions: [] },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const { result } = renderHook(() => usePublishScenario(), { wrapper })

    const publishData = {
      key: 'test',
      mainComponent: {},
      components: {},
      stores: [{ name: 'userStore' }],
      actions: [{ name: 'updateUser' }],
    }

    result.current.mutate(publishData)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3050/api/scenarios/publish',
      expect.objectContaining({
        body: JSON.stringify(publishData),
      }),
    )
  })
})
