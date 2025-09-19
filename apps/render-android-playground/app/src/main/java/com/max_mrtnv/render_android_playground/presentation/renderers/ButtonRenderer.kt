package com.max_mrtnv.render_android_playground.presentation.renderers

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.max_mrtnv.render_android_playground.domain.entities.Component
import com.max_mrtnv.render_android_playground.domain.services.Renderer

/**
 * Renderer for button components
 */
class ButtonRenderer : Renderer {
    override val type: String = "button"
    
    @Composable
    override fun render(component: Component): Boolean {
        val style = component.style
        val title = style.title ?: "Button"
        
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
        
        // Apply border
        style.borderWidth?.let { borderWidth ->
            if (borderWidth > 0.dp) {
                val borderColor = style.borderColor ?: Color.Black
                val cornerRadius = style.cornerRadius ?: 0.dp
                modifier = modifier.border(
                    width = borderWidth,
                    color = borderColor,
                    shape = RoundedCornerShape(cornerRadius)
                )
            }
        }
        
        // Button colors
        val backgroundColor = style.backgroundColor ?: Color.Blue
        val titleColor = style.titleColor ?: Color.White
        
        // Corner radius
        val cornerRadius = style.cornerRadius ?: 4.dp
        
        Button(
            onClick = { /* TODO: Handle click events */ },
            modifier = modifier,
            colors = ButtonDefaults.buttonColors(
                containerColor = backgroundColor,
                contentColor = titleColor
            ),
            shape = RoundedCornerShape(cornerRadius)
        ) {
            val fontSize = style.fontSize?.sp ?: 14.sp
            Text(
                text = title,
                style = TextStyle(fontSize = fontSize)
            )
        }
        
        return true
    }
}
