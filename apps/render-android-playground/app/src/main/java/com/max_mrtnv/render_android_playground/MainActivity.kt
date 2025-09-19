package com.max_mrtnv.render_android_playground

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.max_mrtnv.render_android_playground.presentation.screens.MainScreen
import com.max_mrtnv.render_android_playground.ui.theme.RenderandroidplaygroundTheme

/**
 * Main activity following clean architecture principles
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            RenderandroidplaygroundTheme {
                MainScreen()
            }
        }
    }
}