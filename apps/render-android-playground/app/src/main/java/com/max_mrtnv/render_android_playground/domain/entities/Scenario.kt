package com.max_mrtnv.render_android_playground.domain.entities

import java.util.UUID

/**
 * Domain entity representing a complete UI scenario
 */
data class Scenario(
    val id: String,
    val key: String,
    val version: String,
    val buildNumber: Int,
    val mainComponent: Component,
    val components: Map<String, Component>,
    val metadata: Map<String, Any>,
    val createdAt: Long,
    val updatedAt: Long
) {
    companion object {
        fun create(json: Map<String, Any?>): Scenario? {
            val config = Config(json)
            
            val id = config.getString("id") ?: UUID.randomUUID().toString()
            val key = config.getString("key") ?: config.getString("id") ?: UUID.randomUUID().toString()
            val version = config.getString("version") ?: "1.0.0"
            val buildNumber = config.getInt("buildNumber") ?: 1
            val metadata = config.getDictionary("metadata") ?: emptyMap()
            val createdAt = config.getLong("createdAt") ?: System.currentTimeMillis()
            val updatedAt = config.getLong("updatedAt") ?: System.currentTimeMillis()
            
            val mainComponentConfig = config.getConfig("main") ?: return null
            val mainComponent = try {
                Component.create(mainComponentConfig)
            } catch (e: Exception) {
                println("Error creating main component: ${e.message}")
                return null
            }
            
            // Parse components section
            val components = mutableMapOf<String, Component>()
            val componentsSection = config.getDictionary("components")
            componentsSection?.forEach { (componentName, componentData) ->
                if (componentData is Map<*, *>) {
                    try {
                        val component = Component.create(Config(componentData))
                        components[componentName] = component
                    } catch (e: Exception) {
                        println("Error creating component $componentName: ${e.message}")
                    }
                }
            }
            
            return Scenario(id, key, version, buildNumber, mainComponent, components, metadata, createdAt, updatedAt)
        }
    }
}
