package com.max_mrtnv.render_android_playground.application.services

import com.max_mrtnv.render_android_playground.application.errors.ApplicationError
import com.max_mrtnv.render_android_playground.application.usecases.FetchScenarioUseCase
import com.max_mrtnv.render_android_playground.domain.entities.Scenario

/**
 * Application service that orchestrates scenario operations
 */
class ScenarioService(
    private val fetchScenarioUseCase: FetchScenarioUseCase
) {
    suspend fun fetchScenario(url: String): Scenario {
        return fetchScenarioUseCase.execute(url)
            ?: throw ApplicationError.SchemaFetchFailed("No scenario received")
    }
}
