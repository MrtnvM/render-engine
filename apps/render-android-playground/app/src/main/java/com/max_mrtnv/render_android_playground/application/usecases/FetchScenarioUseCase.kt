package com.max_mrtnv.render_android_playground.application.usecases

import com.max_mrtnv.render_android_playground.domain.entities.Scenario
import com.max_mrtnv.render_android_playground.domain.repositories.ScenarioRepository

/**
 * Use case for fetching scenario from remote source
 */
class FetchScenarioUseCase(
    private val scenarioRepository: ScenarioRepository
) {
    suspend fun execute(url: String): Scenario? {
        return scenarioRepository.fetchScenario(url)
    }
}
