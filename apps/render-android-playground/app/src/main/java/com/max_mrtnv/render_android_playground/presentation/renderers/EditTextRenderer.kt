package com.max_mrtnv.render_android_playground.presentation.renderers

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import com.max_mrtnv.render_android_playground.domain.entities.Component
import com.max_mrtnv.render_android_playground.domain.services.Renderer

/**
 * Renderer for input components (UITextField equivalent)
 */
class EditTextRenderer : Renderer {
    override val type: String = "input"

    override fun render(component: Component): View? {
        val style = component.style
        val placeholder = style.placeholder ?: "Enter text"

        // Create EditText with context from component or default
        val editText = EditText(component.context ?: return null)

        // Set hint/placeholder
        editText.hint = placeholder

        // Apply size
        editText.layoutParams = ViewGroup.LayoutParams(
            style.width?.toInt() ?: ViewGroup.LayoutParams.WRAP_CONTENT,
            style.height?.toInt() ?: ViewGroup.LayoutParams.WRAP_CONTENT
        )

        // Apply position
        editText.x = style.x ?: 0f
        editText.y = style.y ?: 0f

        // Apply background color
        style.backgroundColor?.let { bgColor ->
            editText.setBackgroundColor(bgColor)
        }

        // Apply corner radius using background drawable
        style.cornerRadius?.let { cornerRadius ->
            if (cornerRadius > 0) {
                editText.background = android.graphics.drawable.GradientDrawable().apply {
                    shape = android.graphics.drawable.GradientDrawable.RECTANGLE
                    this.cornerRadius = cornerRadius
                    setColor(style.backgroundColor ?: Color.TRANSPARENT)
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
                    setColor(style.backgroundColor ?: Color.TRANSPARENT)
                }
                editText.background = borderDrawable
            }
        }

        // Apply text color
        style.textColor?.let { textColor ->
            editText.setTextColor(textColor)
        }

        // Apply font size
        style.fontSize?.let { fontSize ->
            editText.textSize = fontSize
        }

        // Apply font weight
        style.fontWeight?.let { fontWeight ->
            when (fontWeight.lowercase()) {
                "bold" -> editText.setTypeface(editText.typeface, Typeface.BOLD)
                "italic" -> editText.setTypeface(editText.typeface, Typeface.ITALIC)
                else -> editText.setTypeface(null, Typeface.NORMAL)
            }
        }

        return editText
    }
}
