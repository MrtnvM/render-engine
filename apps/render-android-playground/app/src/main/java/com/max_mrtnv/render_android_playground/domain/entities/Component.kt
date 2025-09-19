package com.max_mrtnv.render_android_playground.domain.entities

import com.max_mrtnv.render_android_playground.domain.errors.DomainError
import java.util.UUID

/**
 * Domain entity representing a UI component
 */
data class Component(
    val id: String,
    val type: String,
    val style: ViewStyle,
    private val _children: MutableList<Component> = mutableListOf()
) {
    val children: List<Component> get() = _children.toList()
    
    @Throws(DomainError::class)
    fun addChild(child: Component) {
        // Check for circular dependencies
        if (child.containsComponent(id)) {
            throw DomainError.RenderingError("Circular dependency detected")
        }
        _children.add(child)
    }
    
    private fun containsComponent(componentId: String): Boolean {
        if (id == componentId) return true
        return _children.any { it.containsComponent(componentId) }
    }
    
    companion object {
        @Throws(DomainError::class)
        fun create(config: Config): Component {
            val type = config.getString("type") 
                ?: throw DomainError.InvalidSchemaStructure("Missing 'type' field in component config")
            
            val id = config.getString("id") ?: UUID.randomUUID().toString()
            val styleConfig = config.getConfig("style")
            val style = ViewStyle(styleConfig)
            
            val component = Component(id, type, style)
            
            config.getConfigArray("children")?.forEach { childConfig ->
                val childComponent = create(childConfig)
                component.addChild(childComponent)
            }
            
            return component
        }
    }
}
