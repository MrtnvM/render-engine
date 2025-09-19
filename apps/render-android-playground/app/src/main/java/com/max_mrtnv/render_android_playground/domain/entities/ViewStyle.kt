package com.max_mrtnv.render_android_playground.domain.entities

import android.graphics.Color

/**
 * Domain entity representing view styling properties
 */
class ViewStyle(private val config: Config?) {
    private val cache = mutableMapOf<String, Any?>()
    
    val backgroundColor: Int?
        get() = get("bgColor") { parseColor(it) }

    val cornerRadius: Float?
        get() = get("cornerRadius") { (it as? Number)?.toFloat() }

    val borderWidth: Float?
        get() = get("borderWidth") { (it as? Number)?.toFloat() }

    val borderColor: Int?
        get() = get("borderColor") { parseColor(it) }

    val x: Float?
        get() = get("x") { (it as? Number)?.toFloat() }

    val y: Float?
        get() = get("y") { (it as? Number)?.toFloat() }

    val width: Float?
        get() = get("width") { (it as? Number)?.toFloat() }

    val height: Float?
        get() = get("height") { (it as? Number)?.toFloat() }
    
    val title: String?
        get() = get("title") { it as? String }
    
    val text: String?
        get() = get("text") { it as? String }
    
    val placeholder: String?
        get() = get("placeholder") { it as? String }
    
    val textColor: Int?
        get() = get("textColor") { parseColor(it) }

    val titleColor: Int?
        get() = get("titleColor") { parseColor(it) }
    
    val fontSize: Float?
        get() = get("fontSize") { (it as? Number)?.toFloat() }

    val fontWeight: String?
        get() = get("fontWeight") { it as? String }

    val textAlign: String?
        get() = get("textAlign") { it as? String }
    
    private fun <T> get(key: String, transform: (Any) -> T?): T? {
        if (cache.containsKey(key)) {
            @Suppress("UNCHECKED_CAST")
            return cache[key] as? T
        }
        
        val rawValue = config?.get(key)
        val value = rawValue?.let(transform)
        cache[key] = value
        return value
    }
    
    private fun parseColor(value: Any?): Int? {
        return when (value) {
            is String -> {
                try {
                    when {
                        value.startsWith("#") && value.length == 7 -> {
                            Color.parseColor(value)
                        }
                        value.startsWith("#") && value.length == 9 -> {
                            Color.parseColor(value)
                        }
                        value.equals("red", ignoreCase = true) -> Color.RED
                        value.equals("blue", ignoreCase = true) -> Color.BLUE
                        value.equals("green", ignoreCase = true) -> Color.GREEN
                        value.equals("yellow", ignoreCase = true) -> Color.YELLOW
                        value.equals("black", ignoreCase = true) -> Color.BLACK
                        value.equals("white", ignoreCase = true) -> Color.WHITE
                        value.equals("gray", ignoreCase = true) -> Color.GRAY
                        else -> null
                    }
                } catch (e: Exception) {
                    println("Error parsing color: $value")
                    null
                }
            }
            else -> null
        }
    }
}
