package com.max_mrtnv.render_android_playground.domain.repositories

import com.max_mrtnv.render_android_playground.application.errors.ApplicationError
import com.max_mrtnv.render_android_playground.domain.entities.Scenario
import com.max_mrtnv.render_android_playground.domain.errors.DomainError

interface ScenarioRepository {
    @Throws(ApplicationError::class, DomainError::class)
    suspend fun fetchScenario(url: String): Scenario
}
