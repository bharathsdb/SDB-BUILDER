package com.plancraft.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.plancraft.ai.ui.screens.login.LoginScreen
import com.plancraft.ai.ui.screens.generate.GenerateWizardScreen
import com.plancraft.ai.ui.screens.MainScaffold
import com.plancraft.ai.ui.theme.PlanCraftTheme
import com.plancraft.ai.network.TokenManager

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        TokenManager.init(applicationContext)
        setContent {
            PlanCraftTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    NavHost(navController = navController, startDestination = "login") {
                        composable("login") {
                            LoginScreen(
                                onNavigateToDashboard = {
                                    navController.navigate("main") {
                                        popUpTo("login") { inclusive = true }
                                    }
                                }
                            )
                        }
                        composable("main") {
                            MainScaffold(
                                onLogout = {
                                    navController.navigate("login") {
                                        popUpTo("main") { inclusive = true }
                                    }
                                },
                                rootNavController = navController
                            )
                        }
                        composable("generate") {
                            GenerateWizardScreen(
                                onNavigateBack = { navController.popBackStack() },
                                onProjectCreated = { projectId ->
                                    navController.popBackStack() 
                                }
                            )
                        }
                        composable(
                            route = "viewer/{projectId}"
                        ) { backStackEntry ->
                            val projectId = backStackEntry.arguments?.getString("projectId") ?: ""
                            com.plancraft.ai.ui.screens.viewer.ViewerScreen(
                                projectId = projectId,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
