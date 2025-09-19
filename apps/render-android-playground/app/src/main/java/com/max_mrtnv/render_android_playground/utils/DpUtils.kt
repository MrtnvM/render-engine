package com.max_mrtnv.render_android_playground.utils

import android.content.Context
import android.util.TypedValue

/**
 * Utility functions for converting between dp and pixels in Android
 */

/**
 * Converts a Float value from dp to pixels
 * @param context Android context to get display metrics
 * @return The pixel value as Int
 */
fun Float.toDp(context: Context): Int {
    return TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP,
        this,
        context.resources.displayMetrics
    ).toInt()
}

/**
 * Converts an Int value from dp to pixels
 * @param context Android context to get display metrics
 * @return The pixel value as Int
 */
fun Int.toDp(context: Context): Int {
    return TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP,
        this.toFloat(),
        context.resources.displayMetrics
    ).toInt()
}

/**
 * Converts a Float value from pixels to dp
 * @param context Android context to get display metrics
 * @return The dp value as Float
 */
fun Float.toPx(context: Context): Float {
    val density = context.resources.displayMetrics.density
    return this / density
}

/**
 * Converts an Int value from pixels to dp
 * @param context Android context to get display metrics
 * @return The dp value as Int
 */
fun Int.toPx(context: Context): Int {
    val density = context.resources.displayMetrics.density
    return (this / density + 0.5f).toInt()
}
