/**
 * Integration tests for TranspilerService
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createTranspilerService, consoleLogger, silentLogger } from '@/sdk/transpiler/transpiler-service.js'
import { transpile } from '@/sdk/transpiler/index.js'
import { createDefaultRegistry } from '@/sdk/transpiler/core/component-registry.js'
import type { TranspilerService } from '@/sdk/transpiler/transpiler-service.js'
import type { TranspilerConfig } from '@/sdk/transpiler/types.js'
import { SIMPLE_COMPONENT_JSX, COMPONENT_WITH_PROPS_JSX } from '../test-utils.js'

describe('TranspilerService Integration', () => {
  let service: TranspilerService

  beforeEach(async () => {
    service = await createTranspilerService({
      logger: silentLogger, // Keep tests quiet
    })
  })

  describe('transpile()', () => {
    it('should transpile simple component', async () => {
      const jsx = `
        export default function SimpleApp() {
          return <View><Text>Hello World</Text></View>
        }
      `

      const result = await service.transpile(jsx)

      expect(result).toMatchObject({
        key: expect.any(String),
        version: '1.0.0',
        main: {
          type: 'View',
          children: [
            {
              type: 'Text',
              properties: {
                text: 'Hello World',
              },
            },
          ],
        },
        components: {},
      })
    })

    it('should extract SCENARIO_KEY', async () => {
      const jsx = `
        export const SCENARIO_KEY = 'my-test-scenario'

        export default function App() {
          return <View />
        }
      `

      const result = await service.transpile(jsx)
      expect(result.key).toBe('my-test-scenario')
    })

    it('should handle component with props', async () => {
      const jsx = `
        export default function App({ title }: { title: string }) {
          return <Text>{title}</Text>
        }
      `

      const result = await service.transpile(jsx)

      expect(result.main).toMatchObject({
        type: 'Text',
        properties: {
          text: {
            type: 'prop',
            key: 'title',
          },
        },
      })
    })

    it('should handle component with styles', async () => {
      const jsx = `
        export default function StyledApp() {
          return (
            <View style={{ backgroundColor: 'blue', padding: 16 }}>
              <Text style={{ color: 'white', fontSize: 18 }}>
                Styled Text
              </Text>
            </View>
          )
        }
      `

      const result = await service.transpile(jsx)

      expect(result.main).toMatchObject({
        type: 'View',
        style: {
          backgroundColor: 'blue',
          padding: 16,
        },
        children: [
          {
            type: 'Text',
            style: {
              color: 'white',
              fontSize: 18,
            },
            properties: {
              text: 'Styled Text',
            },
          },
        ],
      })
    })

    it('should collect named exports', async () => {
      const jsx = `
        export const Header = () => <Text>Header Title</Text>

        export default function App() {
          return <View />
        }
      `

      const result = await service.transpile(jsx)

      expect(result.components).toHaveProperty('Header')
      expect(result.components.Header).toMatchObject({
        type: 'Text',
        properties: {
          text: 'Header Title',
        },
      })
    })

    it('should apply default styles for Row component', async () => {
      const jsx = `
        export default function App() {
          return <Row />
        }
      `

      const result = await service.transpile(jsx)

      expect(result.main).toMatchObject({
        type: 'Row',
        style: {
          flexDirection: 'row',
        },
      })
    })

    it('should apply default styles for Column component', async () => {
      const jsx = `
        export default function App() {
          return <Column />
        }
      `

      const result = await service.transpile(jsx)

      expect(result.main).toMatchObject({
        type: 'Column',
        style: {
          flexDirection: 'column',
        },
      })
    })
  })

  describe('validateJsx()', () => {
    it('should validate correct JSX', async () => {
      const jsx = `
        export default function App() {
          return <View><Text>Valid JSX</Text></View>
        }
      `

      const result = await service.validateJsx(jsx)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect parse errors', async () => {
      const jsx = `
        export default function App() {
          return <View><Text>Unclosed tag
        }
      `

      const result = await service.validateJsx(jsx)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should warn about missing default export', async () => {
      const jsx = `
        export const Header = () => <Text>Header</Text>
      `

      const result = await service.validateJsx(jsx)

      expect(result.isValid).toBe(true) // No errors, just warnings
      expect(result.warnings).toContain('No default export found - this may not render properly')
    })
  })

  describe('getInfo()', () => {
    it('should return transpiler information', () => {
      const info = service.getInfo()

      expect(info).toMatchObject({
        version: '2.0.0',
        registeredComponents: expect.arrayContaining(['View', 'Text', 'Button']),
        config: {
          strictMode: false,
          allowUnknownComponents: true,
        },
      })
    })
  })

  describe('test()', () => {
    it('should run self-test successfully', async () => {
      const result = await service.test()

      expect(result.success).toBe(true)
      expect(result.result).toMatchObject({
        key: expect.any(String),
        version: '1.0.0',
        main: {
          type: 'View',
          children: [
            {
              type: 'Text',
              properties: {
                text: 'Hello World',
              },
            },
          ],
        },
      })
    })
  })

  describe('configuration', () => {
    it('should work with custom component registry', async () => {
      const registry = createDefaultRegistry()
      registry.registerComponent({
        name: 'CustomButton',
        defaultStyles: { backgroundColor: 'blue' },
        supportedProps: ['onClick'],
        childrenAllowed: true,
        textChildrenAllowed: false,
      })

      const customService = await createTranspilerService({
        componentRegistry: registry,
        logger: silentLogger,
      })

      const jsx = `
        export default function App() {
          return <CustomButton />
        }
      `

      const result = await customService.transpile(jsx)

      expect(result.main).toMatchObject({
        type: 'CustomButton',
        style: {
          backgroundColor: 'blue',
        },
      })
    })

    it('should work with logging enabled', async () => {
      const mockLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      }

      const serviceWithLogging = await createTranspilerService({
        logger: mockLogger,
      })

      const jsx = `
        export default function App() {
          return <View />
        }
      `

      await serviceWithLogging.transpile(jsx)

      expect(mockLogger.info).toHaveBeenCalledWith('Starting transpilation process')
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Transpilation completed in'))
    })
  })

  describe('error handling', () => {
    it('should handle component not found error', async () => {
      const jsx = `
        export default function App() {
          return <UnknownComponent />
        }
      `

      await expect(service.transpile(jsx)).rejects.toThrow('not found in registry')
    })

    it('should handle invalid JSX syntax', async () => {
      const jsx = `
        export default function App() {
          return <View><Text>Unclosed
        }
      `

      await expect(service.transpile(jsx)).rejects.toThrow('Parse error')
    })

    it('should handle missing default export', async () => {
      const jsx = `
        export const Header = () => <Text>Header</Text>
      `

      await expect(service.transpile(jsx)).rejects.toThrow('No default export found')
    })
  })
})

describe('Public transpile() function', () => {
  it('should work with basic JSX', async () => {
    const jsx = `
      export default function App() {
        return <View><Text>Public API Test</Text></View>
      }
    `

    const result = await transpile(jsx)

    expect(result).toMatchObject({
      key: expect.any(String),
      version: '1.0.0',
      main: {
        type: 'View',
        children: [
          {
            type: 'Text',
            properties: {
              text: 'Public API Test',
            },
          },
        ],
      },
    })
  })

  it('should work with custom configuration', async () => {
    const registry = createDefaultRegistry()
    const jsx = `
      export default function App() {
        return <View />
      `

    const result = await transpile(jsx, {
      componentRegistry: registry,
      strictMode: false,
    })

    expect(result.main.type).toBe('View')
  })
})