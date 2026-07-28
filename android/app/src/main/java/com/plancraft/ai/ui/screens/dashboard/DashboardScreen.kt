package com.plancraft.ai.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.foundation.lazy.items
import com.plancraft.ai.ui.theme.PrimaryLight
import com.plancraft.ai.viewmodels.ProjectsState
import com.plancraft.ai.viewmodels.ProjectsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onLogout: () -> Unit,
    onNavigateToGenerate: () -> Unit,
    viewModel: ProjectsViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("PlanCraftAI", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color.Black
                ),
                navigationIcon = {
                    IconButton(onClick = { /* Open drawer */ }) {
                        Icon(Icons.Default.Menu, contentDescription = "Menu")
                    }
                },
                actions = {
                    IconButton(onClick = onLogout) {
                        Icon(Icons.Default.ExitToApp, contentDescription = "Logout")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToGenerate,
                containerColor = PrimaryLight,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "New Project")
            }
        },
        containerColor = Color(0xFFF8FAFC) // BackgroundLight
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "Good morning, there \uD83D\uDC4B",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Text(
                    text = "Here's what's happening with your projects today.",
                    color = Color.Gray,
                    fontSize = 14.sp
                )
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    StatCard(
                        modifier = Modifier.weight(1f),
                        title = "Total Projects",
                        value = "12",
                        icon = Icons.Default.Folder,
                        iconColor = PrimaryLight
                    )
                    StatCard(
                        modifier = Modifier.weight(1f),
                        title = "AI Credits Used",
                        value = "45/100",
                        icon = Icons.Default.Star,
                        iconColor = Color(0xFF8B5CF6)
                    )
                }
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Recent Projects", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        when (val state = uiState) {
                            is ProjectsState.Loading -> {
                                CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally))
                            }
                            is ProjectsState.Success -> {
                                state.projects.forEachIndexed { index, project ->
                                    val statusColor = when (project.status) {
                                        "completed" -> Color(0xFF10B981)
                                        "generating" -> Color(0xFFF59E0B)
                                        else -> PrimaryLight
                                    }
                                    ProjectItem(
                                        name = project.name, 
                                        details = "${project.plotLength}x${project.plotWidth}ft • ${project.floors} Floors", 
                                        status = project.status.capitalize(), 
                                        statusColor = statusColor
                                    )
                                    if (index < state.projects.size - 1) {
                                        Divider(modifier = Modifier.padding(vertical = 8.dp))
                                    }
                                }
                            }
                            is ProjectsState.Error -> {
                                Text("Error loading projects", color = Color.Red)
                            }
                        }
                    }
                }
            }
            
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = PrimaryLight),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(24.dp)) {
                        Text("Need professional help?", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color.White)
                        Text("Connect with 500+ verified architects.", color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = PrimaryLight),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Browse Marketplace")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(modifier: Modifier = Modifier, title: String, value: String, icon: ImageVector, iconColor: Color) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(iconColor.copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(16.dp))
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(value, fontWeight = FontWeight.Bold, fontSize = 24.sp)
            Text(title, color = Color.Gray, fontSize = 12.sp)
        }
    }
}

@Composable
fun ProjectItem(name: String, details: String, status: String, statusColor: Color) {
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(PrimaryLight.copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(name.take(1), fontWeight = FontWeight.Bold, color = PrimaryLight)
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(name, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
            Text(details, color = Color.Gray, fontSize = 12.sp)
        }
        Box(
            modifier = Modifier.background(statusColor.copy(alpha = 0.1f), RoundedCornerShape(12.dp)).padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Text(status, color = statusColor, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}
