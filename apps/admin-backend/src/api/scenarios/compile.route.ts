import { Hono } from 'hono'
import { container } from '../../di-container.js'
import { CompileScenarioUseCase, CompilationError } from '@render-engine/admin-backend-application'
import { CompileScenarioDtoSchema } from '@render-engine/admin-backend-application'

const app = new Hono()

/**
 * POST /api/scenarios/compile
 * Компиляция JSX кода в JSON схему
 */
app.post('/', async (c) => {
  try {
    const body = await c.req.json()

    // Валидация входных данных
    const validation = CompileScenarioDtoSchema.safeParse(body)
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
    const compileUseCase = container.resolve(CompileScenarioUseCase)

    // Выполнение компиляции
    const result = await compileUseCase.execute(validation.data)

    return c.json(result, 200)
  } catch (error: any) {
    if (error instanceof CompilationError) {
      return c.json(
        {
          error: error.message,
          errors: error.errors,
        },
        400,
      )
    }

    console.error('Compilation error:', error)
    return c.json(
      {
        error: 'Internal server error during compilation',
        message: error.message,
      },
      500,
    )
  }
})

export default app
