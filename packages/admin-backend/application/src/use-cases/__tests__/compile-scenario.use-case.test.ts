import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CompileScenarioUseCase, CompilationError } from '../compile-scenario.use-case.js'

// Mock the transpile function
vi.mock('@render-engine/admin-sdk', () => ({
  transpile: vi.fn(),
}))

import { transpile } from '@render-engine/admin-sdk'

describe('CompileScenarioUseCase', () => {
  let useCase: CompileScenarioUseCase

  beforeEach(() => {
    useCase = new CompileScenarioUseCase()
    vi.clearAllMocks()
  })

  describe('execute', () => {
    it('should successfully compile valid JSX code', async () => {
      const jsxCode = 'export const SCENARIO_KEY = "test"; export default function Main() { return <View /> }'
      const mockResult = {
        key: 'test',
        version: '1.0.0',
        main: { type: 'View', children: [] },
        components: {},
      }

      vi.mocked(transpile).mockResolvedValue(mockResult as any)

      const result = await useCase.execute({ jsxCode })

      expect(result).toEqual({
        key: 'test',
        version: '1.0.0',
        main: { type: 'View', children: [] },
        components: {},
        stores: undefined,
        actions: undefined,
      })
      expect(transpile).toHaveBeenCalledWith(jsxCode)
    })

    it('should throw CompilationError for empty JSX code', async () => {
      await expect(useCase.execute({ jsxCode: '' })).rejects.toThrow(CompilationError)
      await expect(useCase.execute({ jsxCode: '   ' })).rejects.toThrow(CompilationError)
    })

    it('should throw CompilationError when scenario has no key', async () => {
      const jsxCode = 'export default function Main() { return <View /> }'
      const mockResult = {
        key: '',
        main: { type: 'View' },
        components: {},
      }

      vi.mocked(transpile).mockResolvedValue(mockResult as any)

      await expect(useCase.execute({ jsxCode })).rejects.toThrow(CompilationError)
    })

    it('should throw CompilationError when scenario has no main component', async () => {
      const jsxCode = 'export const SCENARIO_KEY = "test"'
      const mockResult = {
        key: 'test',
        main: null,
        components: {},
      }

      vi.mocked(transpile).mockResolvedValue(mockResult as any)

      await expect(useCase.execute({ jsxCode })).rejects.toThrow(CompilationError)
    })

    it('should handle transpilation errors', async () => {
      const jsxCode = 'invalid jsx code'
      vi.mocked(transpile).mockRejectedValue(new Error('Syntax error'))

      await expect(useCase.execute({ jsxCode })).rejects.toThrow(CompilationError)
    })

    it('should include stores and actions in result', async () => {
      const jsxCode = 'export const SCENARIO_KEY = "test"; export default function Main() { return <View /> }'
      const mockResult = {
        key: 'test',
        version: '1.0.0',
        main: { type: 'View' },
        components: {},
        stores: [{ scope: 'app', storage: 'memory', initialValue: { count: { type: 'integer', value: 0 } } }],
        actions: [{ id: 'updateUser', kind: 'store.set', storeRef: { scope: 'app', storage: 'memory' }, keyPath: 'user', value: { kind: 'literal', type: 'string', value: 'test' } }],
      }

      vi.mocked(transpile).mockResolvedValue(mockResult as any)

      const result = await useCase.execute({ jsxCode })

      expect(result.stores).toEqual([{
        name: 'store_0',
        scope: 'app',
        storage: 'memory',
        initialData: { count: { type: 'integer', value: 0 } }
      }])
      expect(result.actions).toEqual([{
        name: 'updateUser',
        type: 'store.set',
        payload: mockResult.actions[0]
      }])
    })

    it('should use default version if not provided', async () => {
      const jsxCode = 'export const SCENARIO_KEY = "test"; export default function Main() { return <View /> }'
      const mockResult = {
        key: 'test',
        main: { type: 'View' },
        components: {},
      }

      vi.mocked(transpile).mockResolvedValue(mockResult as any)

      const result = await useCase.execute({ jsxCode })

      expect(result.version).toBe('1.0.0')
    })
  })

  describe('CompilationError', () => {
    it('should contain error details', () => {
      const errors = [
        { code: 'TEST_ERROR', message: 'Test error message', severity: 'error' as const },
      ]
      const error = new CompilationError('Compilation failed', errors)

      expect(error.message).toBe('Compilation failed')
      expect(error.errors).toEqual(errors)
      expect(error.name).toBe('CompilationError')
    })
  })
})
