package com.max_mrtnv.render_android_playground.application.usecases

import androidx.compose.runtime.Composable
import com.max_mrtnv.render_android_playground.domain.entities.Component
import com.max_mrtnv.render_android_playground.domain.entities.Scenario
import com.max_mrtnv.render_android_playground.domain.services.ComponentRenderingService

/**
 * Use case for rendering a scenario into Composables
 */
class RenderComponentUseCase(
    private val renderingService: ComponentRenderingService
) {
    @Composable
    fun execute(scenario: Scenario): Boolean {
        return renderingService.render(scenario.mainComponent)
    }
    
    @Composable
    fun execute(component: Component): Boolean {
        return renderingService.render(component)
    }
}
