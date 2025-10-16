import { describe, it, expect } from 'vitest'
import { CompileScenarioDtoSchema } from '../compile-scenario.dto.js'

describe('CompileScenarioDto', () => {
  describe('validation', () => {
    it('should validate valid JSX code', () => {
      const validData = {
        jsxCode: 'export default function Main() { return <View /> }',
      }

      const result = CompileScenarioDtoSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.jsxCode).toBe(validData.jsxCode)
      }
    })

    it('should reject empty JSX code', () => {
      const invalidData = {
        jsxCode: '',
      }

      const result = CompileScenarioDtoSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('JSX code cannot be empty')
      }
    })

    it('should reject missing jsxCode field', () => {
      const invalidData = {}

      const result = CompileScenarioDtoSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
    })

    it('should accept multiline JSX code', () => {
      const validData = {
        jsxCode: `
          export const SCENARIO_KEY = "test-scenario"

          export default function Main() {
            return (
              <View>
                <Text>Hello World</Text>
              </View>
            )
          }
        `,
      }

      const result = CompileScenarioDtoSchema.safeParse(validData)

      expect(result.success).toBe(true)
    })
  })
})
