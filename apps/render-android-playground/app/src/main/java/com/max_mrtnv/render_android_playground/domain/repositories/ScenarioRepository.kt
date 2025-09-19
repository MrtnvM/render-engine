package com.max_mrtnv.render_android_playground.domain.repositories

/**
 * Repository interface for fetching scenarios
 */
interface ScenarioRepository {
    suspend fun fetchScenario(): Map<String, Any?>
    suspend fun fetchScenario(url: String): Map<String, Any?>
}
