package com.max_mrtnv.render_android_playground.presentation.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.max_mrtnv.render_android_playground.application.services.ScenarioService
import com.max_mrtnv.render_android_playground.domain.entities.Scenario
import com.max_mrtnv.render_android_playground.infrastructure.di.DIContainer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ViewModel for the main screen following clean architecture principles
 */
class MainViewModel(
    private val scenarioService: ScenarioService = DIContainer.scenarioService
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()
    
    fun fetchSchema() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val scenario = scenarioService.fetchScenario()
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    scenario = scenario,
                    error = null
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Unknown error occurred"
                )
            }
        }
    }
    
    data class UiState(
        val isLoading: Boolean = false,
        val scenario: Scenario? = null,
        val error: String? = null
    )
}
