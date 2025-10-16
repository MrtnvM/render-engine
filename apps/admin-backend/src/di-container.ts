import 'reflect-metadata'
import { container } from 'tsyringe'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { DrizzleScenarioRepository } from '@render-engine/admin-backend-infrastructure'
import {
  CompileScenarioUseCase,
  PublishScenarioUseCase,
  GetScenarioUseCase,
  ValidateScenarioUseCase,
} from '@render-engine/admin-backend-application'

/**
 * Конфигурация DI контейнера
 * Регистрирует все зависимости для использования в приложении
 */

// Создание клиента базы данных
const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client)

// Регистрация репозитория
container.register('IScenarioRepository', {
  useValue: new DrizzleScenarioRepository(db),
})

// Регистрация use cases (они автоматически резолвятся через @injectable)
container.register(CompileScenarioUseCase, {
  useClass: CompileScenarioUseCase,
})

container.register(PublishScenarioUseCase, {
  useClass: PublishScenarioUseCase,
})

container.register(GetScenarioUseCase, {
  useClass: GetScenarioUseCase,
})

container.register(ValidateScenarioUseCase, {
  useClass: ValidateScenarioUseCase,
})

export { container }
