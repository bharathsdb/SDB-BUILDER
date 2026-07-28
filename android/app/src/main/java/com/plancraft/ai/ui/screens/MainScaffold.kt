package com.plancraft.ai.ui.screens

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.plancraft.ai.ui.screens.dashboard.DashboardScreen
import com.plancraft.ai.ui.screens.projects.ProjectsListScreen
import com.plancraft.ai.ui.screens.aistudio.AiStudioScreen
import com.plancraft.ai.ui.screens.settings.SettingsScreen

sealed class BottomNavItem(val route: String, val title: String, val icon: ImageVector) {
    object Dashboard : BottomNavItem("dashboard_tab", "Dashboard", Icons.Default.Home)
    object Projects : BottomNavItem("projects_tab", "Projects", Icons.Default.List)
    object AiStudio : BottomNavItem("ai_studio_tab", "AI Studio", Icons.Default.Star)
    object Settings : BottomNavItem("settings_tab", "Settings", Icons.Default.Settings)
}

@Composable
fun MainScaffold(
    onLogout: () -> Unit,
    rootNavController: NavHostController // To navigate to full-screen destinations like GenerateWizard
) {
    val navController = rememberNavController()
    val items = listOf(
        BottomNavItem.Dashboard,
        BottomNavItem.Projects,
        BottomNavItem.AiStudio,
        BottomNavItem.Settings
    )

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = Color.White) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route

                items.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) },
                        selected = currentRoute == item.route,
                        onClick = {
                            navController.navigate(item.route) {
                                navController.graph.startDestinationRoute?.let { route ->
                                    popUpTo(route) { saveState = true }
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = BottomNavItem.Dashboard.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(BottomNavItem.Dashboard.route) {
                DashboardScreen(
                    onLogout = onLogout,
                    onNavigateToGenerate = { rootNavController.navigate("generate") }
                )
            }
            composable(BottomNavItem.Projects.route) {
                ProjectsListScreen(
                    onNavigateToViewer = { projectId -> rootNavController.navigate("viewer/$projectId") }
                )
            }
            composable(BottomNavItem.AiStudio.route) {
                AiStudioScreen()
            }
            composable(BottomNavItem.Settings.route) {
                SettingsScreen()
            }
        }
    }
}
