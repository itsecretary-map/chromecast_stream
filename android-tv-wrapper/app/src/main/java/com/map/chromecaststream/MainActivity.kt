package com.map.chromecaststream

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebSettings
import android.view.KeyEvent
import android.view.View
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.activity.OnBackPressedCallback

class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    private lateinit var webViewContainer: FrameLayout
    
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Set up TV-optimized window
        setupTVWindow()
        
        setContentView(R.layout.activity_main)
        
        webViewContainer = findViewById(R.id.webview_container)
        webView = findViewById(R.id.webview)
        
        // Configure WebView for TV and Chromecast
        setupWebView()
        
        // Load the MAP Chromecast Stream app
        webView.loadUrl("https://itsecretary-map.github.io/chromecast_stream/")
        
        // Set up back press handling for modern Android
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }
    
    private fun setupTVWindow() {
        // Enable edge-to-edge display
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        // Hide system bars for immersive TV experience
        val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
        windowInsetsController.apply {
            hide(WindowInsetsCompat.Type.systemBars())
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }
    }
    
    private fun setupWebView() {
        val settings = webView.settings
        
        // Enable JavaScript and modern web features
        settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            
            // Enable media playback
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = true
            allowContentAccess = true
            
            // Optimize for TV displays
            loadWithOverviewMode = true
            useWideViewPort = true
            
            // Enable modern web features
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
            
            // User agent for better compatibility
            userAgentString = "MAP-Chromecast-Stream-TV/1.0"
        }
        
        // Set WebView client for navigation handling
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Inject TV-specific CSS for better navigation
                injectTVOptimizations()
            }
        }
        
        // Enable hardware acceleration for smooth TV experience
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)
    }
    
    private fun injectTVOptimizations() {
        val css = """
            <style>
                /* TV-optimized focus indicators only - don't override layout */
                *:focus {
                    outline: 3px solid #4CAF50 !important;
                    outline-offset: 2px !important;
                }
                
                /* Larger touch targets for TV remote */
                button, a, input, select, textarea {
                    min-height: 48px !important;
                    min-width: 48px !important;
                }
                
                /* Minimal text optimization - don't override layout */
                body {
                    font-size: 18px !important;
                    line-height: 1.6 !important;
                }
            </style>
        """.trimIndent()
        
        webView.evaluateJavascript("""
            (function() {
                var style = document.createElement('style');
                style.innerHTML = `$css`;
                document.head.appendChild(style);
            })();
        """.trimIndent(), null)
    }
    
    // Handle TV remote navigation
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        when (keyCode) {
            KeyEvent.KEYCODE_DPAD_CENTER,
            KeyEvent.KEYCODE_ENTER -> {
                // Simulate click on focused element
                webView.evaluateJavascript("""
                    (function() {
                        var focused = document.activeElement;
                        if (focused && focused.click) {
                            focused.click();
                        }
                    })();
                """.trimIndent(), null)
                return true
            }
            KeyEvent.KEYCODE_BACK -> {
                if (webView.canGoBack()) {
                    webView.goBack()
                    return true
                }
            }
        }
        return super.onKeyDown(keyCode, event)
    }
}
