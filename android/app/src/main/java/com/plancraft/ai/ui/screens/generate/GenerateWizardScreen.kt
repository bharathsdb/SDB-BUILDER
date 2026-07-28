package com.plancraft.ai.ui.screens.generate

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.plancraft.ai.network.CreateProjectRequest
import com.plancraft.ai.ui.theme.PrimaryLight
import com.plancraft.ai.viewmodels.GenerateState
import com.plancraft.ai.viewmodels.GenerateViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GenerateWizardScreen(
    onNavigateBack: () -> Unit,
    onProjectCreated: (String) -> Unit,
    viewModel: GenerateViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    var plotLength by remember { mutableStateOf("60") }
    var plotWidth by remember { mutableStateOf("40") }
    var floors by remember { mutableStateOf(2) }
    var vastu by remember { mutableStateOf(true) }
    var style by remember { mutableStateOf("Modern") }
    
    LaunchedEffect(uiState) {
        if (uiState is GenerateState.Success) {
            onProjectCreated((uiState as GenerateState.Success).projectId)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("New Project", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = Color(0xFFF8FAFC)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Plot Details", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    
                    OutlinedTextField(
                        value = plotLength,
                        onValueChange = { plotLength = it },
                        label = { Text("Plot Length (ft)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = plotWidth,
                        onValueChange = { plotWidth = it },
                        label = { Text("Plot Width (ft)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
            
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Preferences", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text("Vastu Compliant")
                        Switch(checked = vastu, onCheckedChange = { vastu = it })
                    }
                    
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text("Floors")
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = { if (floors > 1) floors-- }) { Text("-", fontWeight = FontWeight.Bold) }
                            Text("$floors", fontWeight = FontWeight.Bold)
                            IconButton(onClick = { floors++ }) { Text("+", fontWeight = FontWeight.Bold) }
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.weight(1f))
            
            Button(
                onClick = {
                    val request = CreateProjectRequest(
                        name = "$style ${plotLength}x${plotWidth} Home",
                        description = "Mobile Generated Layout",
                        plotLength = plotLength.toFloatOrNull() ?: 60f,
                        plotWidth = plotWidth.toFloatOrNull() ?: 40f,
                        facing = "East",
                        floors = floors,
                        budgetTier = "Standard",
                        style = style,
                        vastu = vastu
                    )
                    viewModel.generateProject(request)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                enabled = uiState !is GenerateState.Loading,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryLight)
            ) {
                if (uiState is GenerateState.Loading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Generate Plan", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
