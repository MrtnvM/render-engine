package com.max_mrtnv.render_android_playground.infrastructure.repositories

import com.max_mrtnv.render_android_playground.domain.repositories.ScenarioRepository
import com.max_mrtnv.render_android_playground.infrastructure.network.NetworkClient

/**
 * HTTP implementation of ScenarioRepository
 */
class HttpScenarioRepository(
    private val networkClient: NetworkClient,
    private val defaultUrl: String = "http://10.0.2.2:3050/json-schema" // Android emulator localhost
) : ScenarioRepository {
    
    constructor() : this(NetworkClient())
    
    override suspend fun fetchScenario(): Map<String, Any?> {
        return fetchScenario(defaultUrl)
    }
    
    override suspend fun fetchScenario(url: String): Map<String, Any?> {
        return networkClient.fetchJson(url)
    }
}
