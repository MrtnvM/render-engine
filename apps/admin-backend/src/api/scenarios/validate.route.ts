import { Hono } from 'hono'
import { container } from '../../di-container.js'
import { ValidateScenarioUseCase } from '@render-engine/admin-backend-application'

const app = new Hono()

/**
 * POST /api/scenarios/validate
 * Валидация скомпилированного сценария без сохранения
 */
app.post('/', async (c) => {
  try {
    const body = await c.req.json()

    if (!body) {
      return c.json(
        {
          error: 'Request body is required',
        },
        400,
      )
    }

    // Получение use case из DI контейнера
    const validateUseCase = container.resolve(ValidateScenarioUseCase)

    // Выполнение валидации
    const result = await validateUseCase.execute(body)

    return c.json(result, 200)
  } catch (error: any) {
    console.error('Validation error:', error)
    return c.json(
      {
        error: 'Internal server error during validation',
        message: error.message,
      },
      500,
    )
  }
})

export default app
