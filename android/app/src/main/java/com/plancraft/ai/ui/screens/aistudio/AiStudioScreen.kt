package com.plancraft.ai.ui.screens.aistudio

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.plancraft.ai.ui.theme.PrimaryLight

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiStudioScreen() {
    var vastuCompliant by remember { mutableStateOf(true) }
    var spaceOptimization by remember { mutableStateOf(true) }
    var naturalLight by remember { mutableStateOf(true) }
    var parkingSpace by remember { mutableStateOf(true) }
    var stylePreference by remember { mutableStateOf("Luxury") }
    var isGenerating by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Studio", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = Color(0xFFF8FAFC)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Parameters Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text("Design Parameters", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.Gray)
                    
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text("Vastu Compliance", fontWeight = FontWeight.Medium)
                        Switch(checked = vastuCompliant, onCheckedChange = { vastuCompliant = it })
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text("Space Optimization", fontWeight = FontWeight.Medium)
                        Switch(checked = spaceOptimization, onCheckedChange = { spaceOptimization = it })
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text("Natural Light Priority", fontWeight = FontWeight.Medium)
                        Switch(checked = naturalLight, onCheckedChange = { naturalLight = it })
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                        Text("Parking Space", fontWeight = FontWeight.Medium)
                        Switch(checked = parkingSpace, onCheckedChange = { parkingSpace = it })
                    }
                    
                    Text("Style Preference", fontWeight = FontWeight.Medium, modifier = Modifier.padding(top = 8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                        listOf("Standard", "Compact", "Luxury").forEach { style ->
                            FilterChip(
                                selected = stylePreference == style,
                                onClick = { stylePreference = style },
                                label = { Text(style) }
                            )
                        }
                    }
                }
            }
            
            // Generate Button
            Button(
                onClick = { 
                    isGenerating = true
                    // Simulate network call
                    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                        isGenerating = false
                    }, 3000)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F172A))
            ) {
                if (isGenerating) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("Generating floor plan...", color = Color.White)
                } else {
                    Text("Generate Floor Plan", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            }

            // Results Placeholder
            if (isGenerating) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(300.dp)
                        .background(Color.White, RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("AI is optimizing your layout...", color = Color.Gray)
                }
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(300.dp)
                        .background(Color.White, RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Configure parameters and click Generate", color = Color.Gray)
                }
            }
        }
    }
}
