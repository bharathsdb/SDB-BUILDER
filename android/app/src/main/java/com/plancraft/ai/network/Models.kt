package com.plancraft.ai.network

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val email: String, 
    val password: String
)

data class AuthResponse(
    val access_token: String, 
    val refresh_token: String?,
    val token_type: String?,
    val user: UserDto? = null
)

data class UserDto(
    val id: String, 
    val email: String, 
    val name: String, 
    val credits: Int
)

data class ProjectDto(
    val id: String,
    val name: String,
    val description: String,
    val status: String, 
    val style: String,
    @SerializedName("plot_length") val plotLength: Float,
    @SerializedName("plot_width") val plotWidth: Float,
    val floors: Int,
    val vastu: Boolean,
    @SerializedName("updated_at") val updatedAt: String
)

data class CreateProjectRequest(
    val name: String,
    val description: String,
    @SerializedName("plot_length") val plotLength: Float,
    @SerializedName("plot_width") val plotWidth: Float,
    val facing: String,
    val floors: Int,
    @SerializedName("budget_tier") val budgetTier: String,
    val style: String,
    val vastu: Boolean
)
