package com.max_mrtnv.render_android_playground.infrastructure.di

import com.max_mrtnv.render_android_playground.application.services.ScenarioService
import com.max_mrtnv.render_android_playground.application.usecases.FetchScenarioUseCase
import com.max_mrtnv.render_android_playground.application.usecases.RenderComponentUseCase
import com.max_mrtnv.render_android_playground.domain.repositories.ScenarioRepository
import com.max_mrtnv.render_android_playground.domain.services.ComponentRenderingService
import com.max_mrtnv.render_android_playground.domain.services.Renderer
import com.max_mrtnv.render_android_playground.infrastructure.repositories.HttpScenarioRepository
import com.max_mrtnv.render_android_playground.presentation.renderers.ButtonRenderer
import com.max_mrtnv.render_android_playground.presentation.renderers.ContainerRenderer
import com.max_mrtnv.render_android_playground.presentation.renderers.InputRenderer
import com.max_mrtnv.render_android_playground.presentation.renderers.TextRenderer

/**
 * Dependency injection container for the application
 */
object DIContainer {
    
    // Repositories
    val scenarioRepository: ScenarioRepository by lazy {
        HttpScenarioRepository()
    }
    
    // Renderers
    private val renderers: Map<String, Renderer> by lazy {
        mapOf(
            "container" to ContainerRenderer(),
            "button" to ButtonRenderer(),
            "text" to TextRenderer(),
            "input" to InputRenderer()
        )
    }
    
    // Domain Services
    val componentRenderingService: ComponentRenderingService by lazy {
        ComponentRenderingService(renderers)
    }
    
    // Use Cases
    val fetchScenarioUseCase: FetchScenarioUseCase by lazy {
        FetchScenarioUseCase(scenarioRepository)
    }
    
    val renderComponentUseCase: RenderComponentUseCase by lazy {
        RenderComponentUseCase(componentRenderingService)
    }
    
    // Application Services
    val scenarioService: ScenarioService by lazy {
        ScenarioService(fetchScenarioUseCase, renderComponentUseCase)
    }
}
