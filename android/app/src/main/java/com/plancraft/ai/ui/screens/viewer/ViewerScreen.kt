package com.plancraft.ai.ui.screens.viewer

import android.webkit.CookieManager
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.plancraft.ai.network.TokenManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ViewerScreen(
    projectId: String,
    onNavigateBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("2D/3D Viewer - $projectId", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = Color(0xFFF3EFE6)
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues).fillMaxSize()) {
            AndroidView(
                factory = { context ->
                    WebView(context).apply {
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                        
                        val accessToken = TokenManager.getAccessToken() ?: ""
                        val refreshToken = TokenManager.getRefreshToken() ?: ""
                        
                        val domain = "10.0.2.2"
                        val cookieManager = CookieManager.getInstance()
                        cookieManager.setAcceptCookie(true)
                        cookieManager.setCookie(domain, "plancraft_auth=true; Path=/")
                        cookieManager.flush()
                        
                        webViewClient = object : WebViewClient() {
                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                                // Inject tokens into localStorage
                                val js = """
                                    localStorage.setItem('access_token', '$accessToken');
                                    localStorage.setItem('refresh_token', '$refreshToken');
                                """.trimIndent()
                                view?.evaluateJavascript(js, null)
                            }
                        }
                        
                        loadUrl("http://10.0.2.2:3000/workspace/2d?project=$projectId")
                    }
                },
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}
