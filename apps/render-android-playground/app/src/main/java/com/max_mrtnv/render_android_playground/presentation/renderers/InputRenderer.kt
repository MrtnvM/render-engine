package com.max_mrtnv.render_android_playground.presentation.renderers

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.max_mrtnv.render_android_playground.domain.entities.Component
import com.max_mrtnv.render_android_playground.domain.services.Renderer

/**
 * Renderer for input components
 */
class InputRenderer : Renderer {
    override val type: String = "input"
    
    @Composable
    override fun render(component: Component): Boolean {
        val style = component.style
        val placeholder = style.placeholder ?: "Enter text"
        
        var value by remember { mutableStateOf("") }
        
        var modifier: Modifier = Modifier
        
        // Apply size
        style.width?.let { width ->
            modifier = modifier.width(width)
        }
        style.height?.let { height ->
            modifier = modifier.height(height)
        }
        
        // Apply position
        if (style.x != null || style.y != null) {
            modifier = modifier.offset(
                x = style.x ?: 0.dp,
                y = style.y ?: 0.dp
            )
        }
        
        // Apply background
        style.backgroundColor?.let { bgColor ->
            modifier = modifier.background(bgColor)
        }
        
        // Apply corner radius
        val cornerRadius = style.cornerRadius ?: 0.dp
        if (cornerRadius > 0.dp) {
            modifier = modifier.clip(RoundedCornerShape(cornerRadius))
        }
        
        // Apply border
        style.borderWidth?.let { borderWidth ->
            if (borderWidth > 0.dp) {
                val borderColor = style.borderColor ?: Color.Black
                modifier = modifier.border(
                    width = borderWidth,
                    color = borderColor,
                    shape = RoundedCornerShape(cornerRadius)
                )
            }
        }
        
        // Text properties
        val textColor = style.textColor ?: Color.Black
        val fontSize = style.fontSize?.sp ?: 14.sp
        
        OutlinedTextField(
            value = value,
            onValueChange = { value = it },
            modifier = modifier,
            placeholder = { Text(placeholder) },
            textStyle = TextStyle(
                color = textColor,
                fontSize = fontSize
            ),
            colors = TextFieldDefaults.colors(
                focusedTextColor = textColor,
                unfocusedTextColor = textColor
            ),
            shape = RoundedCornerShape(cornerRadius)
        )
        
        return true
    }
}
