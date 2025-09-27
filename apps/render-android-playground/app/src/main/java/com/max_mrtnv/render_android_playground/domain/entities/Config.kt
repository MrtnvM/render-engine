package com.max_mrtnv.render_android_playground.domain.entities

/**
 * Configuration wrapper for handling JSON data with type safety
 */
class Config(private val data: Map<String, Any?>) {
    
    constructor(data: Any?) : this(
        when (data) {
            is Map<*, *> -> {
                // Handle both regular Maps and LinkedTreeMaps from Gson
                data.mapKeys { it.key.toString() }.mapValues { it.value }
            }
            else -> emptyMap()
        }
    )
    
    fun get(key: String): Any? = data[key]
    
    fun getString(key: String, defaultValue: String? = null): String? =
        data[key] as? String ?: defaultValue
    
    fun getInt(key: String, defaultValue: Int? = null): Int? =
        data[key] as? Int ?: (data[key] as? Double)?.toInt() ?: defaultValue
    
    fun getFloat(key: String, defaultValue: Float? = null): Float? =
        data[key] as? Float ?: (data[key] as? Double)?.toFloat() ?: defaultValue
    
    fun getDouble(key: String, defaultValue: Double? = null): Double? =
        data[key] as? Double ?: defaultValue
    
    fun getLong(key: String, defaultValue: Long? = null): Long? =
        data[key] as? Long ?: (data[key] as? Int)?.toLong() ?: defaultValue
    
    fun getBoolean(key: String, defaultValue: Boolean? = null): Boolean? =
        data[key] as? Boolean ?: defaultValue
    
    fun getArray(key: String, defaultValue: List<Any>? = null): List<Any>? =
        data[key] as? List<Any> ?: defaultValue
    
    fun getConfigArray(key: String, defaultValue: List<Config>? = null): List<Config>? {
        val value = data[key]
        return when (value) {
            is List<*> -> value.map { Config(it) }
            else -> defaultValue
        }
    }
    
    fun getDictionary(key: String, defaultValue: Map<String, Any>? = null): Map<String, Any>? {
        val value = data[key]
        return when (value) {
            is Map<*, *> -> value
                .filterValues { it != null }
                .mapKeys { it.key.toString() }.mapValues { it.value!! }
            else -> defaultValue
        }
    }
    
    fun getConfig(key: String, defaultValue: Config? = null): Config? {
        val value = data[key]
        return when (value) {
            is Map<*, *> -> Config(value.mapKeys { it.key.toString() }.mapValues { it.value })
            else -> defaultValue
        }
    }
}
