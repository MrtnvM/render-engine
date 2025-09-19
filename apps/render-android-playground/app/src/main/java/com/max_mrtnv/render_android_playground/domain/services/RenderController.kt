package com.max_mrtnv.render_android_playground.domain.services

import android.view.View
import android.view.ViewGroup
import com.max_mrtnv.render_android_playground.domain.entities.Component

/**
 * Controller responsible for rendering components to Android Views
 */
class RenderController(
    private val renderers: Map<String, Renderer>
) {
    fun render(component: Component, container: ViewGroup): View? {
        val renderer = renderers[component.type] ?: return null
        val view = renderer.render(component)

        view?.let {
            // Remove from parent if already attached
            (it.parent as? ViewGroup)?.removeView(it)

            // Add to container
            container.addView(it)
        }

        return view
    }
}

/**
 * Interface for component renderers
 */
interface Renderer {
    val type: String

    fun render(component: Component): View?
}