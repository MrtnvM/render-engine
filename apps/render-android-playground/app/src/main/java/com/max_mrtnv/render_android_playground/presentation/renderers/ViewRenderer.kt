package com.max_mrtnv.render_android_playground.presentation.renderers

import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.max_mrtnv.render_android_playground.domain.entities.Component
import com.max_mrtnv.render_android_playground.domain.services.Renderer
import com.max_mrtnv.render_android_playground.infrastructure.di.DIContainer
import com.max_mrtnv.render_android_playground.utils.toDp

/**
 * Renderer for view components (UIView equivalent)
 */
class ViewRenderer : Renderer {
    override val type: String = "view"

    override fun render(component: Component): View? {
        val style = component.style

        // Create FrameLayout as container
        val frameLayout = FrameLayout(component.context ?: return null)

        // Apply size and position using proper layout parameters
        val context = component.context ?: return null
        val layoutParams = FrameLayout.LayoutParams(
            style.width?.toInt()?.toDp(context) ?: ViewGroup.LayoutParams.WRAP_CONTENT,
            style.height?.toInt()?.toDp(context) ?: ViewGroup.LayoutParams.WRAP_CONTENT
        )
        
        // Apply position using margins instead of x/y coordinates
        style.x?.let { x -> layoutParams.leftMargin = x.toInt().toDp(context) }
        style.y?.let { y -> layoutParams.topMargin = y.toInt().toDp(context) }
        
        frameLayout.layoutParams = layoutParams

        // Apply background color
        style.backgroundColor?.let { bgColor ->
            frameLayout.setBackgroundColor(bgColor)
        }

        // Apply corner radius using background drawable
        style.cornerRadius?.let { cornerRadius ->
            if (cornerRadius > 0) {
                frameLayout.background = android.graphics.drawable.GradientDrawable().apply {
                    shape = android.graphics.drawable.GradientDrawable.RECTANGLE
                    this.cornerRadius = cornerRadius.toDp(context).toFloat()
                    setColor(style.backgroundColor ?: Color.TRANSPARENT)
                }
            }
        }

        // Apply border
        style.borderWidth?.let { borderWidth ->
            if (borderWidth > 0) {
                val borderDrawable = android.graphics.drawable.GradientDrawable().apply {
                    shape = android.graphics.drawable.GradientDrawable.RECTANGLE
                    this.cornerRadius = style.cornerRadius?.toDp(context)?.toFloat() ?: 0f
                    setStroke(borderWidth.toInt().toDp(context), style.borderColor ?: Color.BLACK)
                    setColor(style.backgroundColor ?: Color.TRANSPARENT)
                }
                frameLayout.background = borderDrawable
            }
        }

        // Render children
        component.children.forEach { child ->
            DIContainer.renderController.render(child, frameLayout)
        }

        return frameLayout
    }
}
