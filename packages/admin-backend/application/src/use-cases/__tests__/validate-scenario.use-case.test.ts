import { describe, it, expect, beforeEach } from 'vitest'
import { ValidateScenarioUseCase } from '../validate-scenario.use-case.js'
import type { CompiledScenarioDto } from '../../dtos/scenario-response.dto.js'

describe('ValidateScenarioUseCase', () => {
  let useCase: ValidateScenarioUseCase

  beforeEach(() => {
    useCase = new ValidateScenarioUseCase()
  })

  describe('execute', () => {
    it('should validate a complete valid scenario', async () => {
      const validScenario: CompiledScenarioDto = {
        key: 'test-scenario',
        version: '1.0.0',
        main: { type: 'View', children: [] },
        components: {
          Button: { type: 'Button', props: {} },
          Input: { type: 'Input', props: {} },
        },
      }

      const result = await useCase.execute(validScenario)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.info).toHaveLength(1)
      expect(result.info[0].message).toContain('test-scenario')
      expect(result.info[0].message).toContain('1.0.0')
      expect(result.info[0].message).toContain('2 components')
    })

    it('should detect missing key', async () => {
      const invalidScenario = {
        key: '',
        version: '1.0.0',
        main: { type: 'View' },
        components: {},
      }

      const result = await useCase.execute(invalidScenario as any)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].code).toBe('MISSING_KEY')
    })

    it('should detect missing version', async () => {
      const invalidScenario = {
        key: 'test',
        version: '',
        main: { type: 'View' },
        components: {},
      }

      const result = await useCase.execute(invalidScenario as any)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.code === 'MISSING_VERSION')).toBe(true)
    })

    it('should detect missing main component', async () => {
      const invalidScenario = {
        key: 'test',
        version: '1.0.0',
        main: null,
        components: {},
      }

      const result = await useCase.execute(invalidScenario as any)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.code === 'MISSING_MAIN')).toBe(true)
    })

    it('should detect empty main component', async () => {
      const invalidScenario = {
        key: 'test',
        version: '1.0.0',
        main: {},
        components: {},
      }

      const result = await useCase.execute(invalidScenario as any)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.code === 'EMPTY_MAIN')).toBe(true)
    })

    it('should detect missing component type', async () => {
      const invalidScenario = {
        key: 'test',
        version: '1.0.0',
        main: { type: 'View' },
        components: {
          Button: { props: {} }, // Missing type
        },
      }

      const result = await useCase.execute(invalidScenario as any)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.code === 'MISSING_COMPONENT_TYPE')).toBe(true)
    })

    it('should validate stores', async () => {
      const scenarioWithStores = {
        key: 'test',
        version: '1.0.0',
        main: { type: 'View' },
        components: {},
        stores: [
          { name: 'userStore', scope: 'scenario', storage: 'memory' },
          { scope: 'global' }, // Missing name
        ],
      }

      const result = await useCase.execute(scenarioWithStores as any)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.code === 'MISSING_STORE_NAME')).toBe(true)
    })

    it('should warn about missing store scope', async () => {
      const scenarioWithStores = {
        key: 'test',
        version: '1.0.0',
        main: { type: 'View' },
        components: {},
        stores: [{ name: 'userStore', storage: 'memory' }],
      }

      const result = await useCase.execute(scenarioWithStores as any)

      expect(result.warnings.some((w) => w.code === 'MISSING_STORE_SCOPE')).toBe(true)
    })

    it('should validate actions', async () => {
      const scenarioWithActions = {
        key: 'test',
        version: '1.0.0',
        main: { type: 'View' },
        components: {},
        actions: [
          { name: 'updateUser', type: 'StoreSet' },
          { type: 'StoreRemove' }, // Missing name
          { name: 'deleteUser' }, // Missing type
        ],
      }

      const result = await useCase.execute(scenarioWithActions as any)

      expect(result.isValid).toBe(false)
      expect(result.errors.some((e) => e.code === 'MISSING_ACTION_NAME')).toBe(true)
      expect(result.errors.some((e) => e.code === 'MISSING_ACTION_TYPE')).toBe(true)
    })

    it('should provide info about scenario composition', async () => {
      const scenario: CompiledScenarioDto = {
        key: 'complex-scenario',
        version: '2.5.1',
        main: { type: 'View' },
        components: {
          Header: { type: 'View' },
          Footer: { type: 'View' },
          Sidebar: { type: 'View' },
        },
      }

      const result = await useCase.execute(scenario)

      expect(result.info[0].message).toContain('complex-scenario')
      expect(result.info[0].message).toContain('2.5.1')
      expect(result.info[0].message).toContain('3 components')
    })
  })
})
