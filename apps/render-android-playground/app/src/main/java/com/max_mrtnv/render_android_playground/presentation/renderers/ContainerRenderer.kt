package com.max_mrtnv.render_android_playground.presentation.renderers

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.max_mrtnv.render_android_playground.domain.entities.Component
import com.max_mrtnv.render_android_playground.domain.services.Renderer
import com.max_mrtnv.render_android_playground.infrastructure.di.DIContainer

/**
 * Renderer for container components
 */
class ContainerRenderer : Renderer {
    override val type: String = "container"
    
    @Composable
    override fun render(component: Component): Boolean {
        val style = component.style
        
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
        
        Box(modifier = modifier) {
            // Render children
            component.children.forEach { child ->
                DIContainer.componentRenderingService.render(child)
            }
        }
        
        return true
    }
}
