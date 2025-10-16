import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DrizzleScenarioRepository } from '../drizzle-scenario.repository.js'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { ICreateScenarioData } from '@render-engine/admin-backend-domain'

// Mock Drizzle functions
const mockSelect = vi.fn()
const mockFrom = vi.fn()
const mockWhere = vi.fn()
const mockLimit = vi.fn()
const mockOrderBy = vi.fn()
const mockOffset = vi.fn()
const mockInsert = vi.fn()
const mockValues = vi.fn()
const mockReturning = vi.fn()
const mockUpdate = vi.fn()
const mockSet = vi.fn()
const mockDelete = vi.fn()

describe('DrizzleScenarioRepository', () => {
  let repository: DrizzleScenarioRepository
  let mockDb: PostgresJsDatabase<any>

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock chain - need to use a function to return fresh chainable objects
    const createChainableMock = () => ({
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      offset: mockOffset,
      returning: mockReturning,
      select: vi.fn().mockResolvedValue([]),
    })

    mockSelect.mockReturnValue({ from: mockFrom })
    // Use mockImplementation to return a fresh chainable mock on each call
    mockFrom.mockImplementation(createChainableMock)
    mockWhere.mockImplementation(createChainableMock)
    mockLimit.mockImplementation(createChainableMock)
    mockOrderBy.mockImplementation(createChainableMock)
    mockOffset.mockResolvedValue([])
    mockReturning.mockResolvedValue([])

    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockReturnValue({ returning: mockReturning })

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })

    mockDelete.mockReturnValue({ where: mockWhere })

    mockDb = {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    } as any

    repository = new DrizzleScenarioRepository(mockDb)
  })

  describe('findById', () => {
    it('should return scenario when found', async () => {
      const mockScenario = {
        id: 'uuid-123',
        key: 'test-scenario',
        version: '1.0.0',
        buildNumber: 1,
        mainComponent: { type: 'View' },
        components: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockLimit.mockResolvedValue([mockScenario])

      const result = await repository.findById('uuid-123')

      expect(result).toBeDefined()
      expect(result?.id).toBe('uuid-123')
      expect(result?.key).toBe('test-scenario')
    })

    it('should return null when not found', async () => {
      mockLimit.mockResolvedValue([])

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('exists', () => {
    it('should return true when scenario exists', async () => {
      mockLimit.mockResolvedValue([{ id: 'uuid-123' }])

      const result = await repository.exists('uuid-123')

      expect(result).toBe(true)
    })

    it('should return false when scenario does not exist', async () => {
      mockLimit.mockResolvedValue([])

      const result = await repository.exists('non-existent')

      expect(result).toBe(false)
    })
  })

  describe('findByKey', () => {
    it('should return latest version of scenario', async () => {
      const mockScenario = {
        id: 'uuid-123',
        key: 'test-scenario',
        version: '2.0.0',
        buildNumber: 3,
        mainComponent: { type: 'View' },
        components: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockLimit.mockResolvedValue([mockScenario])

      const result = await repository.findByKey('test-scenario')

      expect(result).toBeDefined()
      expect(result?.version).toBe('2.0.0')
      expect(result?.buildNumber).toBe(3)
    })

    it('should return null when key not found', async () => {
      mockLimit.mockResolvedValue([])

      const result = await repository.findByKey('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('findByKeyAndVersion', () => {
    it('should return specific version', async () => {
      const mockScenario = {
        id: 'uuid-123',
        key: 'test-scenario',
        version: '1.0.0',
        buildNumber: 2,
        mainComponent: { type: 'View' },
        components: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockLimit.mockResolvedValue([mockScenario])

      const result = await repository.findByKeyAndVersion('test-scenario', '1.0.0')

      expect(result).toBeDefined()
      expect(result?.version).toBe('1.0.0')
    })
  })

  describe('create', () => {
    it('should create new scenario with build number 1', async () => {
      const createData: ICreateScenarioData = {
        key: 'test-scenario',
        version: '1.0.0',
        mainComponent: { type: 'View' },
        components: {},
        metadata: {},
      }

      const mockCreatedScenario = {
        id: 'new-uuid',
        ...createData,
        buildNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Mock getLatestBuildNumber to return 0 (no previous builds)
      mockLimit.mockResolvedValueOnce([])
      // Mock insert returning
      mockReturning.mockResolvedValue([mockCreatedScenario])

      const result = await repository.create(createData)

      expect(result.buildNumber).toBe(1)
      expect(result.key).toBe('test-scenario')
    })

    it('should increment build number for existing version', async () => {
      const createData: ICreateScenarioData = {
        key: 'test-scenario',
        version: '1.0.0',
        mainComponent: { type: 'View' },
        components: {},
      }

      // Mock getLatestBuildNumber to return 5
      mockLimit.mockResolvedValueOnce([{ buildNumber: 5 }])

      const mockCreatedScenario = {
        id: 'new-uuid',
        ...createData,
        buildNumber: 6,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockReturning.mockResolvedValue([mockCreatedScenario])

      const result = await repository.create(createData)

      expect(result.buildNumber).toBe(6)
    })

    it('should use default version if not provided', async () => {
      const createData: ICreateScenarioData = {
        key: 'test-scenario',
        mainComponent: { type: 'View' },
        components: {},
      }

      mockLimit.mockResolvedValueOnce([])
      mockReturning.mockResolvedValue([
        {
          id: 'new-uuid',
          key: 'test-scenario',
          version: '1.0.0',
          buildNumber: 1,
          mainComponent: { type: 'View' },
          components: {},
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const result = await repository.create(createData)

      expect(result.version).toBe('1.0.0')
    })
  })

  describe('getLatestBuildNumber', () => {
    it('should return latest build number for version', async () => {
      mockLimit.mockResolvedValue([{ buildNumber: 10 }])

      const result = await repository.getLatestBuildNumber('test-scenario', '1.0.0')

      expect(result).toBe(10)
    })

    it('should return 0 when no builds exist', async () => {
      mockLimit.mockResolvedValue([])

      const result = await repository.getLatestBuildNumber('test-scenario', '1.0.0')

      expect(result).toBe(0)
    })
  })

  describe('existsByKey', () => {
    it('should return true when key exists', async () => {
      mockLimit.mockResolvedValue([{ key: 'test-scenario' }])

      const result = await repository.existsByKey('test-scenario')

      expect(result).toBe(true)
    })

    it('should return false when key does not exist', async () => {
      mockLimit.mockResolvedValue([])

      const result = await repository.existsByKey('non-existent')

      expect(result).toBe(false)
    })
  })

  describe('save', () => {
    it('should update existing scenario', async () => {
      const updatedScenario = {
        id: 'uuid-123',
        key: 'test-scenario',
        version: '1.0.0',
        buildNumber: 2,
        mainComponent: { type: 'Container' },
        components: { Button: { type: 'Button' } },
        metadata: { updated: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockReturning.mockResolvedValue([updatedScenario])

      const result = await repository.save(updatedScenario)

      expect(result.mainComponent).toEqual({ type: 'Container' })
      expect(result.metadata).toEqual({ updated: true })
    })

    it('should throw error when scenario not found', async () => {
      const scenario = {
        id: 'non-existent',
        key: 'test',
        version: '1.0.0',
        buildNumber: 1,
        mainComponent: {},
        components: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockReturning.mockResolvedValue([])

      await expect(repository.save(scenario)).rejects.toThrow('not found')
    })
  })

  describe('delete', () => {
    it('should delete scenario by id', async () => {
      mockWhere.mockResolvedValue(undefined)

      await repository.delete('uuid-123')

      expect(mockDelete).toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const mockScenarios = [
        {
          id: 'uuid-1',
          key: 'scenario-1',
          version: '1.0.0',
          buildNumber: 1,
          mainComponent: {},
          components: {},
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid-2',
          key: 'scenario-2',
          version: '1.0.0',
          buildNumber: 1,
          mainComponent: {},
          components: {},
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      // Mock for first query (get items) - return chainable mock first
      // Mock for second query (get count) - return resolved promise with count result
      mockFrom
        .mockImplementationOnce(() => ({
          where: mockWhere,
          orderBy: mockOrderBy,
          limit: mockLimit,
          offset: mockOffset,
          returning: mockReturning,
          select: vi.fn().mockResolvedValue([]),
        }))
        .mockResolvedValueOnce([{}, {}])

      mockOffset.mockResolvedValueOnce(mockScenarios)

      const result = await repository.findAll({ page: 1, limit: 10 })

      expect(result.items).toHaveLength(2)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
      expect(result.total).toBe(2)
    })

    it('should use default pagination values', async () => {
      // Mock for first query (get items)
      // Mock for second query (get count)
      mockFrom
        .mockImplementationOnce(() => ({
          where: mockWhere,
          orderBy: mockOrderBy,
          limit: mockLimit,
          offset: mockOffset,
          returning: mockReturning,
          select: vi.fn().mockResolvedValue([]),
        }))
        .mockResolvedValueOnce([])

      mockOffset.mockResolvedValueOnce([])

      const result = await repository.findAll()

      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })
  })

  describe('findVersionsByKey', () => {
    it('should return all versions ordered correctly', async () => {
      const mockVersions = [
        {
          id: 'uuid-1',
          key: 'test',
          version: '2.0.0',
          buildNumber: 1,
          mainComponent: {},
          components: {},
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'uuid-2',
          key: 'test',
          version: '1.0.0',
          buildNumber: 2,
          mainComponent: {},
          components: {},
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockOrderBy.mockResolvedValue(mockVersions)

      const result = await repository.findVersionsByKey('test')

      expect(result).toHaveLength(2)
    })
  })
})
