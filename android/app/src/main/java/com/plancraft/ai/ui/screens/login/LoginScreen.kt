package com.plancraft.ai.ui.screens.login

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.plancraft.ai.ui.theme.PrimaryLight
import com.plancraft.ai.ui.theme.NavyLight
import com.plancraft.ai.viewmodels.AuthViewModel
import com.plancraft.ai.viewmodels.AuthState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onNavigateToDashboard: () -> Unit,
    viewModel: AuthViewModel = viewModel()
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    
    var emailError by remember { mutableStateOf("") }
    var passwordError by remember { mutableStateOf("") }

    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState) {
        if (uiState is AuthState.Success) {
            onNavigateToDashboard()
        }
    }

    fun handleLogin() {
        var hasError = false
        if (email.isBlank()) {
            emailError = "User ID is required."
            hasError = true
        } else {
            emailError = ""
        }

        if (password.isBlank()) {
            passwordError = "Password is required."
            hasError = true
        } else {
            passwordError = ""
        }

        if (!hasError) {
            viewModel.login(email, password)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF3EFE6)) // Paper color
    ) {
        // Stage Area (Top)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(0.4f)
                .background(NavyLight),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(24.dp)
            ) {
                Text(
                    text = "PlanCraftAI",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp
                )
                Spacer(modifier = Modifier.height(32.dp))
                Text(
                    text = "Every plan, oriented true.",
                    color = Color.White,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Medium,
                    lineHeight = 36.sp,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Sign in to pick up your floor plans, elevation renders, and Vastu-zoned layouts where you left them.",
                    color = Color.White.copy(alpha = 0.7f),
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            }
        }

        // Form Area (Bottom)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .weight(0.6f)
                .padding(32.dp),
            verticalArrangement = Arrangement.Top
        ) {
            Text(
                text = "SITE & PLOT ACCESS",
                color = Color(0xFFB8863B), // Brass
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Welcome back",
                fontSize = 32.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF1C1C1A) // Ink
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row {
                Text("New to PlanCraftAI? ", color = Color(0xFF55564F), fontSize = 14.sp)
                Text("Create an account", color = Color(0xFF1C1C1A), fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            }
            
            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { 
                    email = it
                    emailError = ""
                },
                label = { Text("Email") },
                isError = emailError.isNotEmpty(),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                colors = TextFieldDefaults.outlinedTextFieldColors(
                    containerColor = Color(0xFFE9E3D4), // Paper Dim
                    focusedBorderColor = Color(0xFFB8863B),
                    unfocusedBorderColor = Color.Transparent,
                    errorBorderColor = Color(0xFFA6432F)
                )
            )
            if (emailError.isNotEmpty()) {
                Text(
                    text = emailError,
                    color = Color(0xFFA6432F),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(top = 4.dp, start = 4.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = password,
                onValueChange = { 
                    password = it
                    passwordError = ""
                },
                label = { Text("Password") },
                isError = passwordError.isNotEmpty(),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            imageVector = if (showPassword) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                            contentDescription = if (showPassword) "Hide password" else "Show password"
                        )
                    }
                },
                colors = TextFieldDefaults.outlinedTextFieldColors(
                    containerColor = Color(0xFFE9E3D4), // Paper Dim
                    focusedBorderColor = Color(0xFFB8863B),
                    unfocusedBorderColor = Color.Transparent,
                    errorBorderColor = Color(0xFFA6432F)
                )
            )
            if (passwordError.isNotEmpty()) {
                Text(
                    text = passwordError,
                    color = Color(0xFFA6432F),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(top = 4.dp, start = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (uiState is AuthState.Error) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFFEF2F2), RoundedCornerShape(8.dp))
                        .border(1.dp, Color(0xFFF87171), RoundedCornerShape(8.dp))
                        .padding(12.dp)
                ) {
                    Text(
                        text = (uiState as AuthState.Error).message,
                        color = Color(0xFFB91C1C),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            Button(
                onClick = { handleLogin() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(4.dp),
                colors = ButtonDefaults.buttonColors(containerColor = NavyLight),
                enabled = uiState !is AuthState.Loading
            ) {
                if (uiState is AuthState.Loading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Sign in", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
