package com.max_mrtnv.render_android_playground.domain.services

import androidx.compose.runtime.Composable
import com.max_mrtnv.render_android_playground.domain.entities.Component

/**
 * Domain service responsible for rendering components to Composables
 */
class ComponentRenderingService(
    private val renderers: Map<String, Renderer>
) {
    @Composable
    fun render(component: Component): Boolean {
        val renderer = renderers[component.type] ?: return false
        return renderer.render(component)
    }
}

/**
 * Interface for component renderers
 */
interface Renderer {
    val type: String
    
    @Composable
    fun render(component: Component): Boolean
}
