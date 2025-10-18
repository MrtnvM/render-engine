import { injectable } from 'tsyringe'
import { transpile, type TranspiledScenario } from '@render-engine/admin-sdk'
import type { CompileScenarioDto } from '../dtos/compile-scenario.dto.js'
import type { CompiledScenarioDto } from '../dtos/scenario-response.dto.js'
import type { ValidationErrorDto } from '../dtos/validation-error.dto.js'

/**
 * Use Case для компиляции JSX кода в JSON схему сценария
 *
 * Ответственности:
 * - Валидация входного JSX кода
 * - Транспиляция JSX в JSON через admin-sdk
 * - Обработка ошибок компиляции
 * - Возврат скомпилированного сценария или списка ошибок
 */
@injectable()
export class CompileScenarioUseCase {
  /**
   * Компилирует JSX код в JSON схему
   *
   * @param dto - DTO с JSX кодом
   * @returns Скомпилированный сценарий или выбрасывает ошибку
   * @throws CompilationError если транспиляция не удалась
   */
  async execute(dto: CompileScenarioDto): Promise<CompiledScenarioDto> {
    try {
      // Валидация входных данных
      if (!dto.jsxCode || dto.jsxCode.trim().length === 0) {
        throw new CompilationError('JSX code cannot be empty', [
          {
            code: 'EMPTY_CODE',
            message: 'JSX code cannot be empty',
            severity: 'error',
          },
        ])
      }

      // Транспиляция JSX в JSON
      const result: TranspiledScenario = await transpile(dto.jsxCode)

      // Проверка наличия обязательных полей
      if (!result.key) {
        throw new CompilationError('Scenario must have a key', [
          {
            code: 'MISSING_KEY',
            message: 'Scenario must export SCENARIO_KEY constant or have a key',
            severity: 'error',
          },
        ])
      }

      if (!result.main) {
        throw new CompilationError('Scenario must have a main component', [
          {
            code: 'MISSING_MAIN',
            message: 'Scenario must have a default export (main component)',
            severity: 'error',
          },
        ])
      }

      // Формирование результата
      return {
        key: result.key,
        version: result.version || '1.0.0',
        main: result.main,
        components: result.components || {},
        stores: result.stores?.map((store, index) => ({
          name: `store_${index}`,
          scope: store.scope,
          storage: store.storage,
          initialData: store.initialValue,
        })),
        actions: result.actions?.map((action) => ({
          name: action.id,
          type: action.kind,
          payload: action,
        })),
      }
    } catch (error: any) {
      // Если это уже CompilationError, пробрасываем дальше
      if (error instanceof CompilationError) {
        throw error
      }

      // Обработка ошибок от транспайлера
      throw new CompilationError('Failed to compile JSX code', [
        {
          code: 'TRANSPILATION_ERROR',
          message: error.message || 'Unknown transpilation error',
          severity: 'error',
        },
      ])
    }
  }
}

/**
 * Ошибка компиляции сценария
 */
export class CompilationError extends Error {
  constructor(
    message: string,
    public readonly errors: ValidationErrorDto[],
  ) {
    super(message)
    this.name = 'CompilationError'
  }
}
