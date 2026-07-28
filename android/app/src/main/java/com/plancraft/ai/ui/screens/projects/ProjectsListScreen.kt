package com.plancraft.ai.ui.screens.projects

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.plancraft.ai.ui.screens.dashboard.ProjectItem
import com.plancraft.ai.ui.theme.PrimaryLight
import com.plancraft.ai.viewmodels.ProjectsState
import com.plancraft.ai.viewmodels.ProjectsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectsListScreen(
    onNavigateToViewer: (String) -> Unit,
    viewModel: ProjectsViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Projects", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = Color(0xFFF8FAFC)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search projects...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                colors = TextFieldDefaults.outlinedTextFieldColors(containerColor = Color.White),
                shape = MaterialTheme.shapes.medium
            )
            
            Spacer(modifier = Modifier.height(16.dp))

            when (val state = uiState) {
                is ProjectsState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                }
                is ProjectsState.Success -> {
                    val filteredProjects = state.projects.filter {
                        it.name.contains(searchQuery, ignoreCase = true)
                    }
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(filteredProjects.size) { index ->
                            val project = filteredProjects[index]
                            val statusColor = when (project.status) {
                                "completed" -> Color(0xFF10B981)
                                "generating" -> Color(0xFFF59E0B)
                                else -> PrimaryLight
                            }
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = Color.White),
                                onClick = { onNavigateToViewer(project.id) }
                            ) {
                                Box(modifier = Modifier.padding(16.dp)) {
                                    ProjectItem(
                                        name = project.name,
                                        details = "${project.plotLength}x${project.plotWidth}ft • ${project.floors} Floors",
                                        status = project.status.capitalize(),
                                        statusColor = statusColor
                                    )
                                }
                            }
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
