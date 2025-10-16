import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetScenarioUseCase } from '../get-scenario.use-case.js'
import type { IScenarioRepository, IScenario } from '@render-engine/admin-backend-domain'

describe('GetScenarioUseCase', () => {
  let useCase: GetScenarioUseCase
  let mockRepository: IScenarioRepository

  const mockScenario: IScenario = {
    id: 'uuid-123',
    key: 'test-scenario',
    version: '1.0.0',
    buildNumber: 1,
    mainComponent: { type: 'View' },
    components: { Button: { type: 'Button' } },
    metadata: { description: 'Test' },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  }

  beforeEach(() => {
    mockRepository = {
      findByKey: vi.fn(),
      findByKeyAndVersion: vi.fn(),
      findVersionsByKey: vi.fn(),
      create: vi.fn(),
      getLatestBuildNumber: vi.fn(),
      existsByKey: vi.fn(),
      findById: vi.fn(),
      exists: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as any

    useCase = new GetScenarioUseCase(mockRepository)
  })

  describe('getByKey', () => {
    it('should return scenario when found', async () => {
      vi.mocked(mockRepository.findByKey).mockResolvedValue(mockScenario)

      const result = await useCase.getByKey('test-scenario')

      expect(result).toBeDefined()
      expect(result?.key).toBe('test-scenario')
      expect(result?.version).toBe('1.0.0')
      expect(result?.buildNumber).toBe(1)
      expect(mockRepository.findByKey).toHaveBeenCalledWith('test-scenario')
    })

    it('should return null when scenario not found', async () => {
      vi.mocked(mockRepository.findByKey).mockResolvedValue(null)

      const result = await useCase.getByKey('non-existent')

      expect(result).toBeNull()
      expect(mockRepository.findByKey).toHaveBeenCalledWith('non-existent')
    })

    it('should map all scenario fields correctly', async () => {
      vi.mocked(mockRepository.findByKey).mockResolvedValue(mockScenario)

      const result = await useCase.getByKey('test-scenario')

      expect(result).toEqual({
        id: 'uuid-123',
        key: 'test-scenario',
        version: '1.0.0',
        buildNumber: 1,
        mainComponent: { type: 'View' },
        components: { Button: { type: 'Button' } },
        metadata: { description: 'Test' },
        createdAt: mockScenario.createdAt,
        updatedAt: mockScenario.updatedAt,
      })
    })
  })

  describe('getByKeyAndVersion', () => {
    it('should return specific version when found', async () => {
      vi.mocked(mockRepository.findByKeyAndVersion).mockResolvedValue(mockScenario)

      const result = await useCase.getByKeyAndVersion('test-scenario', '1.0.0')

      expect(result).toBeDefined()
      expect(result?.key).toBe('test-scenario')
      expect(result?.version).toBe('1.0.0')
      expect(mockRepository.findByKeyAndVersion).toHaveBeenCalledWith('test-scenario', '1.0.0')
    })

    it('should return null when version not found', async () => {
      vi.mocked(mockRepository.findByKeyAndVersion).mockResolvedValue(null)

      const result = await useCase.getByKeyAndVersion('test-scenario', '2.0.0')

      expect(result).toBeNull()
    })
  })

  describe('getVersions', () => {
    it('should return all versions of a scenario', async () => {
      const mockVersions: IScenario[] = [
        { ...mockScenario, version: '1.0.0', buildNumber: 1 },
        { ...mockScenario, version: '1.0.0', buildNumber: 2 },
        { ...mockScenario, version: '1.1.0', buildNumber: 1 },
      ]

      vi.mocked(mockRepository.findVersionsByKey).mockResolvedValue(mockVersions)

      const result = await useCase.getVersions('test-scenario')

      expect(result).toHaveLength(3)
      expect(result[0].version).toBe('1.0.0')
      expect(result[0].buildNumber).toBe(1)
      expect(result[1].version).toBe('1.0.0')
      expect(result[1].buildNumber).toBe(2)
      expect(result[2].version).toBe('1.1.0')
      expect(mockRepository.findVersionsByKey).toHaveBeenCalledWith('test-scenario')
    })

    it('should return empty array when no versions found', async () => {
      vi.mocked(mockRepository.findVersionsByKey).mockResolvedValue([])

      const result = await useCase.getVersions('non-existent')

      expect(result).toEqual([])
    })

    it('should map all fields for each version', async () => {
      const mockVersions: IScenario[] = [mockScenario]
      vi.mocked(mockRepository.findVersionsByKey).mockResolvedValue(mockVersions)

      const result = await useCase.getVersions('test-scenario')

      expect(result[0]).toEqual({
        id: 'uuid-123',
        key: 'test-scenario',
        version: '1.0.0',
        buildNumber: 1,
        mainComponent: { type: 'View' },
        components: { Button: { type: 'Button' } },
        metadata: { description: 'Test' },
        createdAt: mockScenario.createdAt,
        updatedAt: mockScenario.updatedAt,
      })
    })
  })
})
