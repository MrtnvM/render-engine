import { Hono } from 'hono'
import { container } from '../../di-container.js'
import { GetScenarioUseCase } from '@render-engine/admin-backend-application'

const app = new Hono()

/**
 * GET /api/scenarios/:key
 * Получить последнюю версию сценария по ключу
 */
app.get('/:key', async (c) => {
  try {
    const key = c.req.param('key')

    if (!key) {
      return c.json(
        {
          error: 'Scenario key is required',
        },
        400,
      )
    }

    // Получение use case из DI контейнера
    const getScenarioUseCase = container.resolve(GetScenarioUseCase)

    // Получение сценария
    const scenario = await getScenarioUseCase.getByKey(key)

    if (!scenario) {
      return c.json(
        {
          error: `Scenario with key '${key}' not found`,
        },
        404,
      )
    }

    return c.json(scenario, 200)
  } catch (error: any) {
    console.error('Get scenario error:', error)
    return c.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      500,
    )
  }
})

/**
 * GET /api/scenarios/:key/versions
 * Получить все версии сценария
 */
app.get('/:key/versions', async (c) => {
  try {
    const key = c.req.param('key')

    if (!key) {
      return c.json(
        {
          error: 'Scenario key is required',
        },
        400,
      )
    }

    // Получение use case из DI контейнера
    const getScenarioUseCase = container.resolve(GetScenarioUseCase)

    // Получение всех версий
    const versions = await getScenarioUseCase.getVersions(key)

    return c.json(versions, 200)
  } catch (error: any) {
    console.error('Get versions error:', error)
    return c.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      500,
    )
  }
})

/**
 * GET /api/scenarios/:key/version/:version
 * Получить конкретную версию сценария
 */
app.get('/:key/version/:version', async (c) => {
  try {
    const key = c.req.param('key')
    const version = c.req.param('version')

    if (!key || !version) {
      return c.json(
        {
          error: 'Scenario key and version are required',
        },
        400,
      )
    }

    // Получение use case из DI контейнера
    const getScenarioUseCase = container.resolve(GetScenarioUseCase)

    // Получение конкретной версии
    const scenario = await getScenarioUseCase.getByKeyAndVersion(key, version)

    if (!scenario) {
      return c.json(
        {
          error: `Scenario with key '${key}' and version '${version}' not found`,
        },
        404,
      )
    }

    return c.json(scenario, 200)
  } catch (error: any) {
    console.error('Get scenario by version error:', error)
    return c.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      500,
    )
  }
})

export default app
