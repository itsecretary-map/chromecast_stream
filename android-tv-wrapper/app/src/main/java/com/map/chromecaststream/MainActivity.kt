package com.map.chromecaststream

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.os.PowerManager
import android.view.WindowManager
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
    
    // Wake lock for preventing sleep mode
    private var wakeLock: PowerManager.WakeLock? = null
    
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Set up TV-optimized window
        setupTVWindow()
        
        // Acquire wake lock to prevent sleep mode
        acquireWakeLock()
        
        setContentView(R.layout.activity_main)
        
        webViewContainer = findViewById(R.id.webview_container)
        webView = findViewById(R.id.webview)
        
        // Configure WebView for TV and Chromecast
        setupWebView()
        
        // Load the MAP Chromecast Stream app
        // URL is automatically set based on build type
        // Debug builds use localhost, Release builds use production URL
        val webUrl = BuildConfig.WEB_URL
        val environment = BuildConfig.ENVIRONMENT
        
        // Runtime detection as backup
        val isDebugMode = BuildConfig.DEBUG
        val runtimeUrl = if (isDebugMode) {
            "http://192.168.40.6:4173/chromecast_stream/"
        } else {
            "https://itsecretary-map.github.io/chromecast_stream/"
        }
        
        println("🌐 Loading app from: $webUrl (Environment: $environment)")
        println("🔧 Debug mode: $isDebugMode, Runtime URL: $runtimeUrl")
        webView.loadUrl(webUrl)
        
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
    
    // === SLEEP MODE PREVENTION ===
    
    /**
     * Acquire wake lock to prevent device from sleeping
     */
    private fun acquireWakeLock() {
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ON_AFTER_RELEASE,
                "MAPChromecastStream::WakeLock"
            )
            
            // Keep screen on and bright
            wakeLock?.acquire()
            
            // Also set window flags to keep screen on
            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            window.addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD)
            window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED)
            window.addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
            
            println("✅ Wake lock acquired - device will stay awake")
        } catch (e: Exception) {
            println("⚠️ Failed to acquire wake lock: ${e.message}")
        }
    }
    
    /**
     * Release wake lock when app is destroyed
     */
    private fun releaseWakeLock() {
        try {
            wakeLock?.let { lock ->
                if (lock.isHeld) {
                    lock.release()
                    println("🔓 Wake lock released")
                }
            }
            wakeLock = null
            
            // Remove window flags
            window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            window.clearFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD)
            window.clearFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED)
            window.clearFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
        } catch (e: Exception) {
            println("⚠️ Error releasing wake lock: ${e.message}")
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        // Release wake lock when app is destroyed
        releaseWakeLock()
    }
    
    override fun onPause() {
        super.onPause()
        // Keep wake lock active even when app is paused
        // This ensures the slideshow continues running
    }
    
    override fun onResume() {
        super.onResume()
        // Ensure wake lock is still active when resuming
        if (wakeLock?.isHeld == false) {
            acquireWakeLock()
        }
    }
}
