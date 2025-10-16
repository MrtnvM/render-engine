import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PublishScenarioUseCase, PublishError } from '../publish-scenario.use-case.js'
import type { IScenarioRepository } from '@render-engine/admin-backend-domain'

describe('PublishScenarioUseCase', () => {
  let useCase: PublishScenarioUseCase
  let mockRepository: IScenarioRepository

  beforeEach(() => {
    mockRepository = {
      create: vi.fn(),
      getLatestBuildNumber: vi.fn(),
      findByKey: vi.fn(),
      findByKeyAndVersion: vi.fn(),
      findVersionsByKey: vi.fn(),
      existsByKey: vi.fn(),
      findById: vi.fn(),
      exists: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as any

    useCase = new PublishScenarioUseCase(mockRepository)
  })

  describe('execute', () => {
    it('should successfully publish a valid scenario', async () => {
      const publishDto = {
        key: 'test-scenario',
        version: '1.0.0',
        mainComponent: { type: 'View' },
        components: { Button: { type: 'Button' } },
        metadata: { description: 'Test' },
      }

      const mockCreatedScenario = {
        id: 'uuid-123',
        key: 'test-scenario',
        version: '1.0.0',
        buildNumber: 1,
        mainComponent: { type: 'View' },
        components: { Button: { type: 'Button' } },
        metadata: { description: 'Test', publishedAt: expect.any(String) },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockRepository.create).mockResolvedValue(mockCreatedScenario)

      const result = await useCase.execute(publishDto)

      expect(result.id).toBe('uuid-123')
      expect(result.key).toBe('test-scenario')
      expect(result.version).toBe('1.0.0')
      expect(result.buildNumber).toBe(1)
      expect(mockRepository.create).toHaveBeenCalledWith({
        key: 'test-scenario',
        version: '1.0.0',
        mainComponent: { type: 'View' },
        components: { Button: { type: 'Button' } },
        metadata: expect.objectContaining({
          description: 'Test',
          publishedAt: expect.any(String),
        }),
      })
    })

    it('should throw PublishError for empty key', async () => {
      const invalidDto = {
        key: '',
        version: '1.0.0',
        mainComponent: { type: 'View' },
        components: {},
        metadata: {},
      }

      await expect(useCase.execute(invalidDto)).rejects.toThrow(PublishError)
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Scenario key is required')
    })

    it('should throw PublishError for missing main component', async () => {
      const invalidDto = {
        key: 'test',
        version: '1.0.0',
        mainComponent: {},
        components: {},
        metadata: {},
      }

      await expect(useCase.execute(invalidDto)).rejects.toThrow(PublishError)
      await expect(useCase.execute(invalidDto)).rejects.toThrow('Main component is required')
    })

    it('should throw PublishError for invalid version format', async () => {
      const invalidDto = {
        key: 'test',
        version: 'invalid',
        mainComponent: { type: 'View' },
        components: {},
        metadata: {},
      }

      await expect(useCase.execute(invalidDto)).rejects.toThrow(PublishError)
      await expect(useCase.execute(invalidDto)).rejects.toThrow('semantic versioning')
    })

    it('should accept valid semver versions', async () => {
      const validVersions = ['1.0.0', '2.5.3', '10.20.30']

      for (const version of validVersions) {
        const dto = {
          key: 'test',
          version,
          mainComponent: { type: 'View' },
          components: {},
          metadata: {},
        }

        vi.mocked(mockRepository.create).mockResolvedValue({
          id: 'uuid',
          ...dto,
          buildNumber: 1,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        await expect(useCase.execute(dto)).resolves.toBeDefined()
      }
    })

    it('should include stores and actions in metadata', async () => {
      const publishDto = {
        key: 'test-scenario',
        version: '1.0.0',
        mainComponent: { type: 'View' },
        components: {},
        metadata: {},
        stores: [{ name: 'userStore' }],
        actions: [{ name: 'updateUser' }],
      }

      const mockCreatedScenario = {
        id: 'uuid-123',
        ...publishDto,
        buildNumber: 1,
        metadata: {
          stores: [{ name: 'userStore' }],
          actions: [{ name: 'updateUser' }],
          publishedAt: new Date().toISOString(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockRepository.create).mockResolvedValue(mockCreatedScenario)

      const result = await useCase.execute(publishDto)

      expect(result.id).toBe('uuid-123')
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            stores: [{ name: 'userStore' }],
            actions: [{ name: 'updateUser' }],
          }),
        }),
      )
    })

    it('should handle repository errors', async () => {
      const publishDto = {
        key: 'test',
        version: '1.0.0',
        mainComponent: { type: 'View' },
        components: {},
        metadata: {},
      }

      vi.mocked(mockRepository.create).mockRejectedValue(new Error('Database error'))

      await expect(useCase.execute(publishDto)).rejects.toThrow(PublishError)
    })
  })
})
