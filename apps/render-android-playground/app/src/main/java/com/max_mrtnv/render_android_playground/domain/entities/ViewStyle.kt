package com.max_mrtnv.render_android_playground.domain.entities

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Domain entity representing view styling properties
 */
class ViewStyle(private val config: Config?) {
    private val cache = mutableMapOf<String, Any?>()
    
    val backgroundColor: Color?
        get() = get("bgColor") { parseColor(it) }
    
    val cornerRadius: Dp?
        get() = get("cornerRadius") { (it as? Number)?.toFloat()?.dp }
    
    val borderWidth: Dp?
        get() = get("borderWidth") { (it as? Number)?.toFloat()?.dp }
    
    val borderColor: Color?
        get() = get("borderColor") { parseColor(it) }
    
    val x: Dp?
        get() = get("x") { (it as? Number)?.toFloat()?.dp }
    
    val y: Dp?
        get() = get("y") { (it as? Number)?.toFloat()?.dp }
    
    val width: Dp?
        get() = get("width") { (it as? Number)?.toFloat()?.dp }
    
    val height: Dp?
        get() = get("height") { (it as? Number)?.toFloat()?.dp }
    
    val title: String?
        get() = get("title") { it as? String }
    
    val text: String?
        get() = get("text") { it as? String }
    
    val placeholder: String?
        get() = get("placeholder") { it as? String }
    
    val textColor: Color?
        get() = get("textColor") { parseColor(it) }
    
    val titleColor: Color?
        get() = get("titleColor") { parseColor(it) }
    
    val fontSize: Float?
        get() = get("fontSize") { (it as? Number)?.toFloat() }
    
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
    
    private fun parseColor(value: Any?): Color? {
        return when (value) {
            is String -> {
                try {
                    when {
                        value.startsWith("#") && value.length == 7 -> {
                            val colorInt = value.substring(1).toLong(16)
                            Color(colorInt or 0xFF000000)
                        }
                        value.startsWith("#") && value.length == 9 -> {
                            val colorInt = value.substring(1).toLong(16)
                            Color(colorInt)
                        }
                        value.equals("red", ignoreCase = true) -> Color.Red
                        value.equals("blue", ignoreCase = true) -> Color.Blue
                        value.equals("green", ignoreCase = true) -> Color.Green
                        value.equals("yellow", ignoreCase = true) -> Color.Yellow
                        value.equals("black", ignoreCase = true) -> Color.Black
                        value.equals("white", ignoreCase = true) -> Color.White
                        value.equals("gray", ignoreCase = true) -> Color.Gray
                        else -> null
                    }
                } catch (e: Exception) {
                    null
                }
            }
            else -> null
        }
    }
}
