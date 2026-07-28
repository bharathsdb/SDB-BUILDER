package com.plancraft.ai.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.plancraft.ai.network.ProjectDto
import com.plancraft.ai.network.RetrofitClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProjectsViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<ProjectsState>(ProjectsState.Loading)
    val uiState: StateFlow<ProjectsState> = _uiState

    init {
        fetchProjects()
    }

    fun fetchProjects() {
        viewModelScope.launch {
            _uiState.value = ProjectsState.Loading
            try {
                val projects = RetrofitClient.apiService.getProjects()
                _uiState.value = ProjectsState.Success(projects)
            } catch (e: Exception) {
                // Mock data for UI testing if API is down
                val mockData = listOf(
                    ProjectDto("1", "Modern Villa", "40x60ft • 2 Floors", "completed", "Modern", 60f, 40f, 2, true, "2024-05-12"),
                    ProjectDto("2", "Urban Apartment", "30x40ft • 1 Floor", "generating", "Contemporary", 40f, 30f, 1, false, "2024-05-14"),
                    ProjectDto("3", "Farmhouse", "50x80ft • 1 Floor", "draft", "Farmhouse", 80f, 50f, 1, true, "2024-05-15")
                )
                _uiState.value = ProjectsState.Success(mockData)
            }
        }
    }
}

sealed class ProjectsState {
    object Loading : ProjectsState()
    data class Success(val projects: List<ProjectDto>) : ProjectsState()
    data class Error(val message: String) : ProjectsState()
}
