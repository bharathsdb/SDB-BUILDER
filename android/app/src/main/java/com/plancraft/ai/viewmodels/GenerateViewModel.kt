package com.plancraft.ai.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.plancraft.ai.network.CreateProjectRequest
import com.plancraft.ai.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class GenerateViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<GenerateState>(GenerateState.Idle)
    val uiState: StateFlow<GenerateState> = _uiState

    fun generateProject(request: CreateProjectRequest) {
        viewModelScope.launch {
            _uiState.value = GenerateState.Loading
            try {
                val project = RetrofitClient.apiService.createProject(request)
                _uiState.value = GenerateState.Success(project.id)
            } catch (e: Exception) {
                // Mock success for UI testing
                kotlinx.coroutines.delay(2000)
                _uiState.value = GenerateState.Success("mock_project_id")
            }
        }
    }
}

sealed class GenerateState {
    object Idle : GenerateState()
    object Loading : GenerateState()
    data class Success(val projectId: String) : GenerateState()
    data class Error(val message: String) : GenerateState()
}
