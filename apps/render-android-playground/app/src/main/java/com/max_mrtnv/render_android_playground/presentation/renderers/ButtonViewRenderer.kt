package com.max_mrtnv.render_android_playground.presentation.renderers

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import com.max_mrtnv.render_android_playground.domain.entities.Component
import com.max_mrtnv.render_android_playground.domain.services.Renderer

/**
 * Renderer for button components (UIButton equivalent)
 */
class ButtonViewRenderer : Renderer {
    override val type: String = "button"

    override fun render(component: Component): View? {
        val style = component.style
        val title = style.title ?: "Button"

        // Create Button with context from component or default
        val button = Button(component.context ?: return null)

        // Set text
        button.text = title

        // Apply size
        button.layoutParams = ViewGroup.LayoutParams(
            style.width?.toInt() ?: ViewGroup.LayoutParams.WRAP_CONTENT,
            style.height?.toInt() ?: ViewGroup.LayoutParams.WRAP_CONTENT
        )

        // Apply position
        button.x = style.x ?: 0f
        button.y = style.y ?: 0f

        // Apply background color
        style.backgroundColor?.let { bgColor ->
            button.setBackgroundColor(bgColor)
        }

        // Apply corner radius using background drawable
        style.cornerRadius?.let { cornerRadius ->
            if (cornerRadius > 0) {
                button.background = android.graphics.drawable.GradientDrawable().apply {
                    shape = android.graphics.drawable.GradientDrawable.RECTANGLE
                    this.cornerRadius = cornerRadius
                    setColor(style.backgroundColor ?: Color.BLUE)
                }
            }
        }

        // Apply border
        style.borderWidth?.let { borderWidth ->
            if (borderWidth > 0) {
                val borderDrawable = android.graphics.drawable.GradientDrawable().apply {
                    shape = android.graphics.drawable.GradientDrawable.RECTANGLE
                    this.cornerRadius = style.cornerRadius ?: 0f
                    setStroke(borderWidth.toInt(), style.borderColor ?: Color.BLACK)
                    setColor(style.backgroundColor ?: Color.BLUE)
                }
                button.background = borderDrawable
            }
        }

        // Apply text color
        style.titleColor?.let { titleColor ->
            button.setTextColor(titleColor)
        }

        // Apply font size
        style.fontSize?.let { fontSize ->
            button.textSize = fontSize
        }

        // Apply font weight
        style.fontWeight?.let { fontWeight ->
            when (fontWeight.lowercase()) {
                "bold" -> button.setTypeface(button.typeface, Typeface.BOLD)
                "italic" -> button.setTypeface(button.typeface, Typeface.ITALIC)
                else -> button.setTypeface(null, Typeface.NORMAL)
            }
        }

        return button
    }
}
