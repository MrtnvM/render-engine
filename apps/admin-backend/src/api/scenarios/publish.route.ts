import { Hono } from 'hono'
import { container } from '../../di-container.js'
import { PublishScenarioUseCase, PublishError } from '@render-engine/admin-backend-application'
import { PublishScenarioDtoSchema } from '@render-engine/admin-backend-application'

const app = new Hono()

/**
 * POST /api/scenarios/publish
 * Публикация скомпилированного сценария в базу данных
 */
app.post('/', async (c) => {
  try {
    const body = await c.req.json()

    // Валидация входных данных
    const validation = PublishScenarioDtoSchema.safeParse(body)
    if (!validation.success) {
      return c.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        400,
      )
    }

    // Получение use case из DI контейнера
    const publishUseCase = container.resolve(PublishScenarioUseCase)

    // Выполнение публикации
    const result = await publishUseCase.execute(validation.data)

    return c.json(result, 201)
  } catch (error: any) {
    if (error instanceof PublishError) {
      return c.json(
        {
          error: error.message,
        },
        400,
      )
    }

    console.error('Publish error:', error)
    return c.json(
      {
        error: 'Internal server error during publishing',
        message: error.message,
      },
      500,
    )
  }
})

export default app
