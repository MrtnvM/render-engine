package com.max_mrtnv.render_android_playground.presentation.renderers

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import com.max_mrtnv.render_android_playground.domain.entities.Component
import com.max_mrtnv.render_android_playground.domain.services.Renderer

/**
 * Renderer for text components (UILabel equivalent)
 */
class TextViewRenderer : Renderer {
    override val type: String = "label"

    override fun render(component: Component): View? {
        val style = component.style
        val text = style.text ?: "Text"

        // Create TextView with context from component or default
        val textView = TextView(component.context ?: return null)

        // Set text
        textView.text = text

        // Apply size
        textView.layoutParams = ViewGroup.LayoutParams(
            style.width?.toInt() ?: ViewGroup.LayoutParams.WRAP_CONTENT,
            style.height?.toInt() ?: ViewGroup.LayoutParams.WRAP_CONTENT
        )

        // Apply position
        textView.x = style.x ?: 0f
        textView.y = style.y ?: 0f

        // Apply background color
        style.backgroundColor?.let { bgColor ->
            textView.setBackgroundColor(bgColor)
        }

        // Apply corner radius using background drawable
        style.cornerRadius?.let { cornerRadius ->
            if (cornerRadius > 0) {
                textView.background = android.graphics.drawable.GradientDrawable().apply {
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
                    cornerRadius = style.cornerRadius ?: 0f
                    setStroke(borderWidth.toInt(), style.borderColor ?: Color.BLACK)
                    setColor(style.backgroundColor ?: Color.TRANSPARENT)
                }
                textView.background = borderDrawable
            }
        }

        // Apply text color
        style.textColor?.let { textColor ->
            textView.setTextColor(textColor)
        }

        // Apply font size
        style.fontSize?.let { fontSize ->
            textView.textSize = fontSize
        }

        // Apply font weight
        style.fontWeight?.let { fontWeight ->
            when (fontWeight.lowercase()) {
                "bold" -> textView.setTypeface(textView.typeface, Typeface.BOLD)
                "italic" -> textView.setTypeface(textView.typeface, Typeface.ITALIC)
                else -> textView.setTypeface(null, Typeface.NORMAL)
            }
        }

        // Apply text alignment
        style.textAlign?.let { textAlign ->
            textView.textAlignment = when (textAlign.lowercase()) {
                "center" -> View.TEXT_ALIGNMENT_CENTER
                "right" -> View.TEXT_ALIGNMENT_VIEW_END
                else -> View.TEXT_ALIGNMENT_VIEW_START
            }
        }

        return textView
    }
}
