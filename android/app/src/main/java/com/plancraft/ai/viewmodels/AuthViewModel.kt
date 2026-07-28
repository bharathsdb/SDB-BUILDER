package com.plancraft.ai.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.plancraft.ai.network.LoginRequest
import com.plancraft.ai.network.RetrofitClient
import com.plancraft.ai.network.TokenManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException
import org.json.JSONObject

class AuthViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<AuthState>(AuthState.Idle)
    val uiState: StateFlow<AuthState> = _uiState

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = AuthState.Loading
            try {
                val response = RetrofitClient.apiService.login(LoginRequest(email = email, password = password))
                if (response.access_token.isNotEmpty()) {
                    TokenManager.saveTokens(
                        response.access_token, 
                        response.refresh_token ?: ""
                    )
                    _uiState.value = AuthState.Success
                } else {
                    _uiState.value = AuthState.Error("Invalid response from server.")
                }
            } catch (e: HttpException) {
                var errorMessage = "Invalid email or password"
                try {
                    val errorBody = e.response()?.errorBody()?.string()
                    if (errorBody != null) {
                        val json = JSONObject(errorBody)
                        if (json.has("detail")) {
                            val detail = json.get("detail")
                            if (detail is String) {
                                errorMessage = detail
                            } else if (detail is JSONObject && detail.has("message")) {
                                errorMessage = detail.getString("message")
                            }
                        }
                    }
                } catch (parseException: Exception) {
                    // Ignore parse error, use default message
                }
                _uiState.value = AuthState.Error(errorMessage)
            } catch (e: Exception) {
                _uiState.value = AuthState.Error(e.message ?: "Network error. Please try again.")
            }
        }
    }
}

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    object Success : AuthState()
    data class Error(val message: String) : AuthState()
}
