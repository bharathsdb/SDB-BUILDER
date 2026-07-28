package com.plancraft.ai.network

import android.content.Context
import android.content.SharedPreferences

object TokenManager {
    private var sharedPreferences: SharedPreferences? = null

    fun init(context: Context) {
        if (sharedPreferences == null) {
            sharedPreferences = context.getSharedPreferences("plancraft_prefs", Context.MODE_PRIVATE)
        }
    }

    fun saveTokens(accessToken: String, refreshToken: String) {
        sharedPreferences?.edit()?.apply {
            putString("access_token", accessToken)
            putString("refresh_token", refreshToken)
            apply()
        }
    }

    fun getAccessToken(): String? {
        return sharedPreferences?.getString("access_token", null)
    }

    fun getRefreshToken(): String? {
        return sharedPreferences?.getString("refresh_token", null)
    }

    fun clearTokens() {
        sharedPreferences?.edit()?.apply {
            remove("access_token")
            remove("refresh_token")
            apply()
        }
    }
}
