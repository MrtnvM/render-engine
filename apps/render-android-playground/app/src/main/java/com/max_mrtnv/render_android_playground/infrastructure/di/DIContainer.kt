package com.max_mrtnv.render_android_playground.infrastructure.di

import com.max_mrtnv.render_android_playground.application.services.ScenarioService
import com.max_mrtnv.render_android_playground.application.usecases.FetchScenarioUseCase
import com.max_mrtnv.render_android_playground.domain.repositories.ScenarioRepository
import com.max_mrtnv.render_android_playground.domain.services.RenderController
import com.max_mrtnv.render_android_playground.domain.services.Renderer
import com.max_mrtnv.render_android_playground.infrastructure.network.NetworkClient
import com.max_mrtnv.render_android_playground.infrastructure.repositories.HttpScenarioRepository
import com.max_mrtnv.render_android_playground.presentation.renderers.ButtonViewRenderer
import com.max_mrtnv.render_android_playground.presentation.renderers.EditTextRenderer
import com.max_mrtnv.render_android_playground.presentation.renderers.TextViewRenderer
import com.max_mrtnv.render_android_playground.presentation.renderers.ViewRenderer

/**
 * Dependency injection container for the application
 */
object DIContainer {
    val networkClient: NetworkClient by lazy {
        NetworkClient()
    }

    // Repositories
    val scenarioRepository: ScenarioRepository by lazy {
        HttpScenarioRepository(networkClient)
    }

    // Renderers
    private val renderers: Map<String, Renderer> by lazy {
        mapOf(
            "view" to ViewRenderer(),
            "button" to ButtonViewRenderer(),
            "label" to TextViewRenderer(),
            "input" to EditTextRenderer()
        )
    }

    // Domain Services
    val renderController: RenderController by lazy {
        RenderController(renderers)
    }

    // Use Cases
    val fetchScenarioUseCase: FetchScenarioUseCase by lazy {
        FetchScenarioUseCase(scenarioRepository)
    }

    // Application Services
    val scenarioService: ScenarioService by lazy {
        ScenarioService(fetchScenarioUseCase)
    }
}
