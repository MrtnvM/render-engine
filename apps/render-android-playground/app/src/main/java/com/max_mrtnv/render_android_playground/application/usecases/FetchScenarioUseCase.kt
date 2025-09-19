package com.max_mrtnv.render_android_playground.application.usecases

import com.max_mrtnv.render_android_playground.application.errors.ApplicationError
import com.max_mrtnv.render_android_playground.domain.entities.Scenario
import com.max_mrtnv.render_android_playground.domain.errors.DomainError
import com.max_mrtnv.render_android_playground.domain.repositories.ScenarioRepository

/**
 * Use case for fetching scenario from remote source
 */
class FetchScenarioUseCase(
    private val scenarioRepository: ScenarioRepository
) {
    suspend fun execute(): Scenario? {
        return try {
            val data = scenarioRepository.fetchScenario()
            Scenario.create(data)
        } catch (e: DomainError) {
            throw e
        } catch (e: Exception) {
            throw ApplicationError.SchemaFetchFailed(e.message ?: "Unknown error")
        }
    }
    
    suspend fun execute(url: String): Scenario? {
        return try {
            val data = scenarioRepository.fetchScenario(url)
            Scenario.create(data)
        } catch (e: DomainError) {
            throw e
        } catch (e: Exception) {
            throw ApplicationError.SchemaFetchFailed(e.message ?: "Unknown error")
        }
    }
}
