package com.max_mrtnv.render_android_playground.domain.entities

import java.util.UUID

/**
 * Domain entity representing a complete UI scenario
 */
data class Scenario(
    val id: String,
    val version: String,
    val mainComponent: Component,
    val metadata: Map<String, Any>
) {
    companion object {
        fun create(json: Map<String, Any?>): Scenario? {
            val config = Config(json)
            
            val id = config.getString("id") ?: UUID.randomUUID().toString()
            val version = config.getString("version") ?: "1.0.0"
            val metadata = config.getDictionary("metadata") ?: emptyMap()
            
            val mainComponentConfig = config.getConfig("main") ?: return null
            val mainComponent = try {
                Component.create(mainComponentConfig)
            } catch (e: Exception) {
                return null
            }
            
            return Scenario(id, version, mainComponent, metadata)
        }
    }
}
