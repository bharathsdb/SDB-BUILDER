package com.plancraft.ai.ui.screens.login

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

// NOTE: 10.0.2.2 maps to localhost on the host machine in the Android Emulator.
// If testing on a physical device, change this to your computer's LAN IP (e.g. 192.168.0.157).
private const val LOGIN_URL = "http://10.0.2.2:3000/login"
// private const val LOGIN_URL = "http://192.168.0.157:3000/login"

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebViewLoginScreen(
    onNavigateToDashboard: () -> Unit
) {
    var webView: WebView? by remember { mutableStateOf(null) }
    var isLoading by remember { mutableStateOf(true) }

    // Handle system back button to navigate within WebView history
    BackHandler(enabled = webView?.canGoBack() == true) {
        webView?.goBack()
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true

                    webViewClient = object : WebViewClient() {
                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                            super.onPageStarted(view, url, favicon)
                            isLoading = true
                        }

                        override fun onPageFinished(view: WebView?, url: String?) {
                            super.onPageFinished(view, url)
                            isLoading = false
                        }

                        override fun shouldOverrideUrlLoading(
                            view: WebView?,
                            request: WebResourceRequest?
                        ): Boolean {
                            val url = request?.url?.toString() ?: ""
                            // Check if Next.js redirected to dashboard after successful login
                            if (url.contains("/dashboard") || url.contains("/workspace") || url.contains("main")) {
                                onNavigateToDashboard()
                                return true
                            }
                            return super.shouldOverrideUrlLoading(view, request)
                        }
                    }
                    
                    loadUrl(LOGIN_URL)
                    webView = this
                }
            },
            update = {
                webView = it
            }
        )

        // Show a loading indicator while the page is loading
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.align(Alignment.Center)
            )
        }
    }
}
