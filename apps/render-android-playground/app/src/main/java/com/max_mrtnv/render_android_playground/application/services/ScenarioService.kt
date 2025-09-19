package com.max_mrtnv.render_android_playground.application.services

import androidx.compose.runtime.Composable
import com.max_mrtnv.render_android_playground.application.errors.ApplicationError
import com.max_mrtnv.render_android_playground.application.usecases.FetchScenarioUseCase
import com.max_mrtnv.render_android_playground.application.usecases.RenderComponentUseCase
import com.max_mrtnv.render_android_playground.domain.entities.Scenario

/**
 * Application service that orchestrates scenario operations
 */
class ScenarioService(
    private val fetchScenarioUseCase: FetchScenarioUseCase,
    private val renderComponentUseCase: RenderComponentUseCase
) {
    suspend fun fetchScenario(): Scenario {
        return fetchScenarioUseCase.execute() 
            ?: throw ApplicationError.SchemaFetchFailed("No scenario received")
    }
    
    suspend fun fetchScenario(url: String): Scenario {
        return fetchScenarioUseCase.execute(url)
            ?: throw ApplicationError.SchemaFetchFailed("No scenario received")
    }
    
    @Composable
    fun renderScenario(scenario: Scenario): Boolean {
        return renderComponentUseCase.execute(scenario)
    }
}
