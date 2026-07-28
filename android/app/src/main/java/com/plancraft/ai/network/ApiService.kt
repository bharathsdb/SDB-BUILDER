package com.plancraft.ai.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {
    @POST("api/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @GET("api/projects")
    suspend fun getProjects(): List<ProjectDto>

    @POST("api/projects")
    suspend fun createProject(@Body request: CreateProjectRequest): ProjectDto
}
