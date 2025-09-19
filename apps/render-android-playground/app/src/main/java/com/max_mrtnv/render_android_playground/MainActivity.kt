package com.max_mrtnv.render_android_playground

import android.os.Bundle
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.max_mrtnv.render_android_playground.domain.entities.Component
import com.max_mrtnv.render_android_playground.domain.entities.Scenario
import com.max_mrtnv.render_android_playground.infrastructure.di.DIContainer
import kotlinx.coroutines.launch

/**
 * Main activity following clean architecture principles
 */
class MainActivity : AppCompatActivity() {
    private lateinit var container: FrameLayout
    private lateinit var loadingView: ProgressBar
    private lateinit var errorView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        container = findViewById(R.id.container)
        loadingView = findViewById(R.id.loading_view)
        errorView = findViewById(R.id.error_view)

        loadScenario()
    }

    private fun loadScenario() {
        showLoading()

        lifecycleScope.launch {
            try {
                val url = "http://10.0.2.2:3050/json-schema"
                val scenario = DIContainer.scenarioService.fetchScenario(url)
                renderScenario(scenario)
            } catch (e: Exception) {
                showError("Failed to load scenario: ${e.message}")
            }
        }
    }

    private fun renderScenario(scenario: Scenario) {
        hideLoading()

        // Add context to the root component
        val rootComponent = scenario.mainComponent.copy(context = this)

        // Render the scenario
        DIContainer.renderController.render(rootComponent, container)
    }

    private fun showLoading() {
        loadingView.visibility = ProgressBar.VISIBLE
        errorView.visibility = TextView.GONE
        container.removeAllViews()
    }

    private fun hideLoading() {
        loadingView.visibility = ProgressBar.GONE
        errorView.visibility = TextView.GONE
    }

    private fun showError(message: String) {
        hideLoading()
        errorView.visibility = TextView.VISIBLE
        errorView.text = message
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}