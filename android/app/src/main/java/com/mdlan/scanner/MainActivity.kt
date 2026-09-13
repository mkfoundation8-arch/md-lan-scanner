package com.mdlan.scanner

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Create WebView
        val webView = WebView(this)
        setContentView(webView)
        
        // Configure WebView settings
        val settings: WebSettings = webView.settings.apply {
            // Enable JavaScript
            javaScriptEnabled = true
            
            // Enable DOM storage
            domStorageEnabled = true
            
            // Enable local storage
            databaseEnabled = true
            
            // Set appropriate user agent
            userAgentString = userAgentString + " MDLANScanner/1.0"
            
            // Enable mixed content (for HTTP resources on HTTPS or vice versa)
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            
            // Cache settings
            cacheMode = WebSettings.LOAD_DEFAULT
        }
        
        // Load the React app from assets
        webView.loadUrl("file:///android_asset/www/index.html")
    }
}