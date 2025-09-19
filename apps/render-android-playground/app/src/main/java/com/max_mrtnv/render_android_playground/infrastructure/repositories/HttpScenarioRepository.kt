package com.max_mrtnv.render_android_playground.infrastructure.repositories

import com.max_mrtnv.render_android_playground.application.errors.ApplicationError
import com.max_mrtnv.render_android_playground.domain.entities.Scenario
import com.max_mrtnv.render_android_playground.domain.repositories.ScenarioRepository
import com.max_mrtnv.render_android_playground.infrastructure.network.NetworkClient

class HttpScenarioRepository(
    private val networkClient: NetworkClient,
) : ScenarioRepository {

    override suspend fun fetchScenario(url: String): Scenario {
        val json = networkClient.fetchJson(url)
        val scenario = Scenario.create(json)
        if (scenario == null) {
            throw ApplicationError.SchemaFetchFailed("")
        }
        return scenario
    }
}
