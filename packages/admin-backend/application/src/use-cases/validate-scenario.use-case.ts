import { injectable } from 'tsyringe'
import type { CompiledScenarioDto } from '../dtos/scenario-response.dto.js'
import type { ValidationResultDto, ValidationErrorDto } from '../dtos/validation-error.dto.js'

/**
 * Use Case для валидации скомпилированного сценария
 *
 * Ответственности:
 * - Проверка структуры сценария
 * - Валидация компонентов
 * - Проверка ссылок между компонентами
 * - Возврат результата валидации с ошибками и предупреждениями
 */
@injectable()
export class ValidateScenarioUseCase {
  /**
   * Валидирует скомпилированный сценарий
   *
   * @param scenario - Скомпилированный сценарий
   * @returns Результат валидации с ошибками, предупреждениями и информацией
   */
  async execute(scenario: CompiledScenarioDto): Promise<ValidationResultDto> {
    const errors: ValidationErrorDto[] = []
    const warnings: ValidationErrorDto[] = []
    const info: ValidationErrorDto[] = []

    // Валидация обязательных полей
    this.validateRequiredFields(scenario, errors)

    // Валидация структуры main компонента
    this.validateMainComponent(scenario.main, errors, warnings)

    // Валидация именованных компонентов
    this.validateComponents(scenario.components, errors, warnings)

    // Валидация stores (если есть)
    if (scenario.stores) {
      this.validateStores(scenario.stores, errors, warnings)
    }

    // Валидация actions (если есть)
    if (scenario.actions) {
      this.validateActions(scenario.actions, errors, warnings)
    }

    // Информация о сценарии
    info.push({
      code: 'SCENARIO_INFO',
      message: `Scenario '${scenario.key}' v${scenario.version} with ${Object.keys(scenario.components).length} components`,
      severity: 'info',
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info,
    }
  }

  /**
   * Валидация обязательных полей
   */
  private validateRequiredFields(scenario: CompiledScenarioDto, errors: ValidationErrorDto[]): void {
    if (!scenario.key) {
      errors.push({
        code: 'MISSING_KEY',
        message: 'Scenario key is required',
        field: 'key',
        severity: 'error',
      })
    }

    if (!scenario.version) {
      errors.push({
        code: 'MISSING_VERSION',
        message: 'Scenario version is required',
        field: 'version',
        severity: 'error',
      })
    }

    if (!scenario.main) {
      errors.push({
        code: 'MISSING_MAIN',
        message: 'Scenario must have a main component',
        field: 'main',
        severity: 'error',
      })
    }
  }

  /**
   * Валидация главного компонента
   */
  private validateMainComponent(
    main: Record<string, any>,
    errors: ValidationErrorDto[],
    warnings: ValidationErrorDto[],
  ): void {
    if (!main || Object.keys(main).length === 0) {
      errors.push({
        code: 'EMPTY_MAIN',
        message: 'Main component cannot be empty',
        field: 'main',
        severity: 'error',
      })
      return
    }

    if (!main.type) {
      errors.push({
        code: 'MISSING_COMPONENT_TYPE',
        message: 'Main component must have a type',
        field: 'main.type',
        severity: 'error',
      })
    }
  }

  /**
   * Валидация именованных компонентов
   */
  private validateComponents(
    components: Record<string, any>,
    errors: ValidationErrorDto[],
    warnings: ValidationErrorDto[],
  ): void {
    if (!components) {
      return
    }

    Object.entries(components).forEach(([name, component]) => {
      if (!component.type) {
        errors.push({
          code: 'MISSING_COMPONENT_TYPE',
          message: `Component '${name}' must have a type`,
          field: `components.${name}.type`,
          severity: 'error',
        })
      }
    })
  }

  /**
   * Валидация stores
   */
  private validateStores(
    stores: any[],
    errors: ValidationErrorDto[],
    warnings: ValidationErrorDto[],
  ): void {
    stores.forEach((store, index) => {
      if (!store.name) {
        errors.push({
          code: 'MISSING_STORE_NAME',
          message: `Store at index ${index} must have a name`,
          field: `stores[${index}].name`,
          severity: 'error',
        })
      }

      if (!store.scope) {
        warnings.push({
          code: 'MISSING_STORE_SCOPE',
          message: `Store '${store.name || index}' should have a scope defined`,
          field: `stores[${index}].scope`,
          severity: 'warning',
        })
      }
    })
  }

  /**
   * Валидация actions
   */
  private validateActions(
    actions: any[],
    errors: ValidationErrorDto[],
    warnings: ValidationErrorDto[],
  ): void {
    actions.forEach((action, index) => {
      if (!action.name) {
        errors.push({
          code: 'MISSING_ACTION_NAME',
          message: `Action at index ${index} must have a name`,
          field: `actions[${index}].name`,
          severity: 'error',
        })
      }

      if (!action.type) {
        errors.push({
          code: 'MISSING_ACTION_TYPE',
          message: `Action '${action.name || index}' must have a type`,
          field: `actions[${index}].type`,
          severity: 'error',
        })
      }
    })
  }
}
