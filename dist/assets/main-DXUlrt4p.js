// main.js - Chromecast Receiver Demo
// Rotates through images from GitHub repository and displays prayer times and QR codes

import { 
  slideshowImgUrls, 
  getImagePath, 
  ayatHadithList,
  getQrImageUrls,
  qrImageLabels, 
  githubConfig 
} from './config.js';

// === VIEWPORT LOCKING FOR TV DISPLAYS ===
// Simplified viewport handling to prevent conflicts
function lockViewportDimensions() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  console.log(`🔒 Detected screen dimensions: ${width}x${height}`);
  
  // Only prevent unwanted scaling - let CSS handle layout
  document.documentElement.style.transform = 'none';
  document.body.style.transform = 'none';
}

// Single event listener to avoid conflicts
window.addEventListener('load', () => {
  console.log('📱 Page loaded, locking viewport dimensions...');
  lockViewportDimensions();
});

// === BACKGROUND IMAGE LOADING ===
function loadBackgroundImage() {
  // Detect if we're running on GitHub Pages or locally
  const isGitHubPages = window.location.hostname === 'itsecretary-map.github.io' || 
                       window.location.pathname.includes('/chromecast_stream/');
  
  // Try multiple possible paths for the background image
  const possiblePaths = [
    './CCA_5344-HDR.jpg',
    'CCA_5344-HDR.jpg',
    '/CCA_5344-HDR.jpg',
    '../CCA_5344-HDR.jpg'
  ];
  
  // Add GitHub Pages specific paths if needed
  if (isGitHubPages) {
    possiblePaths.unshift('/chromecast_stream/CCA_5344-HDR.jpg');
    possiblePaths.unshift('./chromecast_stream/CCA_5344-HDR.jpg');
  }
  
  console.log('🖼️  Attempting to load background image from multiple paths:', possiblePaths);
  console.log('📍 Current page URL:', window.location.href);
  console.log('📁 Current page pathname:', window.location.pathname);
  
  let currentPathIndex = 0;
  
  // Create a temporary image to test loading
  const testImg = new Image();
  
  testImg.onload = () => {
    console.log('✅ Background image loaded successfully:', testImg.src);
    console.log('📏 Image dimensions:', testImg.naturalWidth, 'x', testImg.naturalHeight);
    console.log('💾 Image size:', (testImg.naturalWidth * testImg.naturalHeight * 4 / 1024 / 1024).toFixed(2), 'MB (estimated)');
    
    // Apply background image to body - let CSS handle the styling
    document.body.style.setProperty('background-image', `url('${testImg.src}')`);
    document.body.style.setProperty('background-size', 'cover');
    document.body.style.setProperty('background-position', 'center center');
    document.body.style.setProperty('background-attachment', 'fixed');
    document.body.style.setProperty('background-repeat', 'no-repeat');
    
    console.log('🎨 Background image applied to body element');
  };
  
  testImg.onerror = () => {
    console.error(`❌ Failed to load background image from path ${currentPathIndex + 1}/${possiblePaths.length}:`, possiblePaths[currentPathIndex]);
    
    // Try next path in the array
    currentPathIndex++;
    
    if (currentPathIndex < possiblePaths.length) {
      const nextPath = possiblePaths[currentPathIndex];
      console.log(`🔄 Trying next path (${currentPathIndex + 1}/${possiblePaths.length}):`, nextPath);
      testImg.src = nextPath;
    } else {
      console.error('❌ All paths failed. Background image could not be loaded.');
      console.log('🎨 Keeping CSS gradient background as fallback');
      // Don't override the CSS background - let it show the nice gradient
    }
  };
  
  // Start with first path
  console.log(`🚀 Starting with path: ${possiblePaths[0]}`);
  testImg.src = possiblePaths[0];
  
  // Also test if we can fetch the image directly
  fetch(possiblePaths[0])
    .then(response => {
      if (response.ok) {
        console.log('✅ Fetch API confirms image is accessible:', possiblePaths[0]);
      } else {
        console.error('❌ Fetch API failed:', response.status, response.statusText);
      }
    })
    .catch(error => {
      console.error('❌ Fetch API error:', error);
    });
}

// === IMAGE MANAGEMENT ===
let availableImages = []; // Will be populated from GitHub or fallback

// Preload images to prevent layout shifts
function preloadImages(imageUrls) {
  console.log('🔄 Preloading images to prevent layout shifts...');
  
  imageUrls.forEach((url, index) => {
    const img = new Image();
    img.onload = () => {
      console.log(`✅ Preloaded image ${index + 1}/${imageUrls.length}:`, url);
    };
    img.onerror = () => {
      console.warn(`⚠️ Failed to preload image ${index + 1}:`, url);
    };
    img.src = url;
  });
}

// Cache for GitHub API responses
const GITHUB_CACHE_KEY = 'github_images_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Get cached images or fetch from GitHub
async function getCachedOrFetchImages() {
  try {
    // Check if we have valid cached data
    const cached = localStorage.getItem(GITHUB_CACHE_KEY);
    if (cached) {
      const cacheData = JSON.parse(cached);
      const now = Date.now();
      
      if (now - cacheData.timestamp < CACHE_DURATION) {
        console.log('📦 Using cached GitHub images (age:', Math.round((now - cacheData.timestamp) / 1000 / 60), 'minutes)');
        return cacheData.images;
      } else {
        console.log('⏰ Cache expired, fetching fresh images from GitHub');
      }
    }
    
    // Fetch fresh data from GitHub
    const freshImages = await fetchGitHubImages();
    
    // Cache the new data
    if (freshImages.length > 0) {
      const cacheData = {
        images: freshImages,
        timestamp: Date.now()
      };
      localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Cached fresh GitHub images');
    }
    
    return freshImages;
  } catch (error) {
    console.error('❌ Error in cache management:', error);
    // Try to use expired cache as fallback
    const cached = localStorage.getItem(GITHUB_CACHE_KEY);
    if (cached) {
      const cacheData = JSON.parse(cached);
      console.log('🔄 Using expired cache as fallback');
      return cacheData.images;
    }
    return [];
  }
}

// Fetch images from GitHub repository
async function fetchGitHubImages() {
  if (!githubConfig.enabled) {
    console.log('GitHub integration is disabled');
    return [];
  }

  try {
    const apiUrl = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubConfig.folder}`;
    console.log('Fetching images from GitHub:', apiUrl);
  
    const response = await fetch(apiUrl);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('⚠️ GitHub folder not found:', apiUrl);
        console.log('This is expected if the folder is empty or doesn\'t exist');
        return [];
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const files = await response.json();
    console.log('GitHub API response:', files);
    console.log('📁 All files returned from GitHub:', files.map(f => f.name));
    
    // Filter for image files only, excluding background image
    const imageFiles = files.filter(file => {
      const extension = file.name.toLowerCase().split('.').pop();
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
      const isNotBackground = !file.name.includes('CCA_5344-HDR');
      console.log(`🔍 File: ${file.name}, isImage: ${isImage}, isNotBackground: ${isNotBackground}`);
      return isImage && isNotBackground;
    });
    
    console.log(`✅ Found ${imageFiles.length} valid slideshow image files:`, imageFiles);
    
    // Convert to image URLs using raw GitHub URLs
    const githubImages = imageFiles.map(file => ({
      id: file.sha,
      name: file.name,
      url: file.download_url
    }));
    
    console.log('GitHub images processed:', githubImages);
    return githubImages;
    
  } catch (error) {
    console.error('Error fetching GitHub images:', error);
    console.log('Falling back to default slideshow images');
    return [];
  }
}

// Enhanced local image caching system
const LOCAL_IMAGE_CACHE_KEY = 'local_images_cache';
const IMAGE_CACHE_VERSION = '1.0'; // Increment this when image paths change

// Cache management functions
function clearImageCache() {
  localStorage.removeItem(GITHUB_CACHE_KEY);
  localStorage.removeItem(LOCAL_IMAGE_CACHE_KEY);
  console.log('🗑️ Image cache cleared');
}

function getCacheInfo() {
  const cached = localStorage.getItem(GITHUB_CACHE_KEY);
  if (cached) {
    const cacheData = JSON.parse(cached);
    const age = Math.round((Date.now() - cacheData.timestamp) / 1000 / 60);
    const expiresIn = Math.round((CACHE_DURATION - (Date.now() - cacheData.timestamp)) / 1000 / 60);
    console.log('📊 Cache Info:', {
      age: age + ' minutes',
      expiresIn: expiresIn + ' minutes',
      imageCount: cacheData.images.length
    });
    return { age, expiresIn, imageCount: cacheData.images.length };
  } else {
    console.log('📊 No cache found');
    return null;
  }
}

// Local image caching functions
function getLocalImageCache() {
  try {
    const cached = localStorage.getItem(LOCAL_IMAGE_CACHE_KEY);
    if (cached) {
      const cacheData = JSON.parse(cached);
      // Check if cache version matches current version
      if (cacheData.version === IMAGE_CACHE_VERSION) {
        console.log('✅ Local image cache is valid');
        return cacheData.images;
      } else {
        console.log('🔄 Local image cache version mismatch, clearing...');
        clearImageCache();
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading local image cache:', error);
    return null;
  }
}

function setLocalImageCache(images) {
  try {
    const cacheData = {
      version: IMAGE_CACHE_VERSION,
      timestamp: Date.now(),
      images: images
    };
    localStorage.setItem(LOCAL_IMAGE_CACHE_KEY, JSON.stringify(cacheData));
    console.log('💾 Local image cache updated with', images.length, 'images');
  } catch (error) {
    console.error('Error setting local image cache:', error);
  }
}

// Function to get all available slideshow images (local + fallback)
function getAllAvailableImages() {
  // First try to get from local cache
  const cachedImages = getLocalImageCache();
  if (cachedImages && cachedImages.length > 0) {
    console.log('📱 Using cached local images:', cachedImages.length);
    return cachedImages;
  }
  
  // If no cache, use fallback images
  const fallbackImages = getFallbackImages();
  console.log('📱 Using fallback images:', fallbackImages.length);
  
  // Cache the fallback images for future use
  setLocalImageCache(fallbackImages);
  
  // Preload images for better performance
  preloadImages(fallbackImages);
  
  return fallbackImages;
}



// Force refresh images (bypass cache)
async function forceRefreshImages() {
  console.log('🔄 Force refreshing images...');
  clearImageCache();
  
  try {
    // Try GitHub API first
    const freshImages = await fetchGitHubImages();
    if (freshImages.length > 0) {
      availableImages = freshImages.map(img => img.url);
      console.log(`✅ Updated slideshow with ${availableImages.length} fresh GitHub images`);
      // Cache the new images
      setLocalImageCache(availableImages);
      currentIdx = 0;
      showImage(currentIdx);
      return freshImages;
    }
  } catch (error) {
    console.log('⚠️ GitHub API failed during refresh, using fallback');
  }
  
  // Fallback to default images
  availableImages = getFallbackImages();
  if (availableImages.length > 0) {
    console.log(`📱 Using ${availableImages.length} fallback images after refresh`);
    setLocalImageCache(availableImages);
    currentIdx = 0;
    showImage(currentIdx);
  }
  
  return availableImages;
}

// Function to manually refresh local cache
function refreshLocalCache() {
  console.log('🔄 Manually refreshing local image cache...');
  clearImageCache();
  const images = getAllAvailableImages();
  if (images && images.length > 0) {
    availableImages = images;
    currentIdx = 0;
    showImage(currentIdx);
    console.log('✅ Local cache refreshed successfully');
  }
}

// === SLEEP MODE PREVENTION ===
let wakeLock = null;
let keepAliveInterval = null;

// Function to request wake lock (prevents sleep mode)
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('✅ Wake lock acquired - screen will stay awake');
      
      wakeLock.addEventListener('release', () => {
        console.log('⚠️ Wake lock was released');
        // Try to re-acquire wake lock
        setTimeout(requestWakeLock, 1000);
      });
    } else {
      console.log('⚠️ Wake lock API not supported, using alternative methods');
      // Fallback: use keep-alive techniques
      startKeepAlive();
    }
  } catch (err) {
    console.log('⚠️ Wake lock failed:', err);
    // Fallback: use keep-alive techniques
    startKeepAlive();
  }
}

// Fallback method to prevent sleep mode
function startKeepAlive() {
  console.log('🔄 Starting keep-alive fallback methods');
  
  // Method 1: Periodic user activity simulation
  keepAliveInterval = setInterval(() => {
    // Simulate user activity to prevent sleep
    const event = new Event('mousemove');
    document.dispatchEvent(event);
    
    // Also update some visual elements to keep the system active
    const header = document.querySelector('.header');
    if (header) {
      header.style.transform = 'translateZ(0)'; // Force GPU rendering
    }
  }, 30000); // Every 30 seconds
  
  // Method 2: Request fullscreen if possible
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {
      console.log('Fullscreen request denied');
    });
  }
  
  // Method 3: Keep audio context alive (if using audio)
  if (typeof AudioContext !== 'undefined') {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    gainNode.gain.value = 0; // Silent
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.001);
  }
}

// Function to release wake lock
function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
    console.log('🔓 Wake lock released');
  }
  
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('🔓 Keep-alive interval cleared');
  }
}

// === CHROMECAST RECEIVER OPTIMIZATION ===
function detectAndOptimizeForChromecast() {
  // Check if this is likely running as a Chromecast receiver
  const isChromecastReceiver = 
    window.location.hostname === 'localhost' || // Local testing
    window.location.hostname.includes('github.io') || // GitHub Pages
    window.innerWidth >= 1920 || // Large screen (TV)
    window.innerHeight >= 1080; // High resolution
  
  if (isChromecastReceiver) {
    console.log('📺 Chromecast Receiver Mode Detected');
    console.log('  - Screen size:', window.innerWidth, 'x', window.innerHeight);
    console.log('  - Hostname:', window.location.hostname);
    
    // Add Chromecast-specific optimizations
    optimizeForTVDisplay();
    
    // Hide sender controls if they exist
    const senderControls = document.querySelector('.chromecast-controls');
    if (senderControls) {
      senderControls.style.display = 'none';
      console.log('🎯 Hidden Chromecast sender controls for receiver mode');
    }
  } else {
    console.log('💻 Sender Mode Detected (showing cast controls)');
  }
}

function optimizeForTVDisplay() {
  // Optimize text sizes for TV viewing distance
  const body = document.body;
  body.style.fontSize = window.innerWidth >= 3840 ? '32px' : '24px';
  
  // Don't override CSS layout properties - let CSS handle it
  // const mainLayout = document.querySelector('.main-layout');
  // if (mainLayout) {
  //   mainLayout.style.maxWidth = window.innerWidth >= 3840 ? '2400px' : '1800px';
  //   mainLayout.style.margin = '0 auto';
  //   mainLayout.style.padding = window.innerWidth >= 3840 ? '60px' : '40px';
  // }
  
  // Optimize slideshow for TV
  const slideshow = document.querySelector('.slideshow img');
  if (slideshow) {
    // Don't override maxHeight - let CSS handle it
    slideshow.style.borderRadius = '16px';
    slideshow.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.6)';
  }
  
  console.log('🎨 TV display optimizations applied (CSS-preserving)');
}

// TV aspect ratio detection and optimization
function optimizeForTV() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const isTV = window.innerWidth >= 1920;
  
  if (isTV) {
    console.log(`TV detected: ${window.innerWidth}x${window.innerHeight}, aspect ratio: ${aspectRatio.toFixed(2)}`);
    
    if (aspectRatio <= 16/9) {
      // 16:9 or narrower - optimize for standard TV (percentage-based layout)
      document.documentElement.style.setProperty('--header-height', '10vh');
      document.documentElement.style.setProperty('--ayats-height', '10vh');
      document.documentElement.style.setProperty('--content-height', '70vh');
      document.documentElement.style.setProperty('--gap', '2vh');
      document.documentElement.style.setProperty('--padding', '2vh');
      console.log('Applied 16:9 TV optimization (percentage-based layout)');
    } else {
      // Ultra-wide - optimize for wide displays (percentage-based layout)
      document.documentElement.style.setProperty('--header-height', '8vh');
      document.documentElement.style.setProperty('--ayats-height', '8vh');
      document.documentElement.style.setProperty('--content-height', '74vh');
      document.documentElement.style.setProperty('--gap', '2vh');
      document.documentElement.style.setProperty('--padding', '2vh');
      console.log('Applied ultra-wide TV optimization (percentage-based layout)');
    }
  }
}

// Call TV optimization on load and resize
window.addEventListener('load', optimizeForTV);
window.addEventListener('resize', optimizeForTV);

// Handle visibility changes to maintain wake lock
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('⚠️ Page became hidden, trying to maintain wake lock');
    // Try to re-acquire wake lock when page becomes visible again
    setTimeout(() => {
      if (!document.hidden) {
        requestWakeLock();
      }
    }, 1000);
  } else {
    console.log('✅ Page became visible, ensuring wake lock is active');
    requestWakeLock();
  }
});

// Handle page focus/blur events
window.addEventListener('focus', () => {
  console.log('✅ Window focused, ensuring wake lock is active');
  requestWakeLock();
});

window.addEventListener('blur', () => {
  console.log('⚠️ Window blurred, but maintaining wake lock');
});

// Cleanup wake lock when page is unloaded
window.addEventListener('beforeunload', () => {
  console.log('🔓 Page unloading, releasing wake lock');
  releaseWakeLock();
});

// Handle page unload
window.addEventListener('unload', () => {
  console.log('🔓 Page unloaded, releasing wake lock');
  releaseWakeLock();
});

// === Slideshow Logic ===
let currentIdx = 0;
const imgEl = document.getElementById('slideshow-img');
let rotationCount = 0; // Track how many complete rotations we've done

function showImage(idx) {
  if (availableImages.length === 0) {
    console.log('No images available to show');
    return;
  }
  
  console.log(`Showing image ${idx + 1} of ${availableImages.length}:`, availableImages[idx]);
  
  imgEl.style.opacity = 0;
  // Remove any previous error message
  let errorMsg = document.getElementById('slideshow-error');
  if (errorMsg) errorMsg.remove();
  
  setTimeout(() => {
    const imageUrl = availableImages[idx];
    console.log('Setting image src to:', imageUrl);
    imgEl.src = imageUrl;
    imgEl.onload = () => { 
      console.log('Image loaded successfully:', imageUrl);
      imgEl.style.opacity = 1;
    };
    imgEl.onerror = () => {
      console.error('Image failed to load:', imageUrl);
      imgEl.style.opacity = 0.2;
      // Show error message below the image
      if (!document.getElementById('slideshow-error')) {
        const msg = document.createElement('div');
        msg.id = 'slideshow-error';
        msg.style.color = 'red';
        msg.style.textAlign = 'center';
        msg.style.marginTop = '10px';
        msg.textContent = 'Image failed to load. Check the image URL or try another image.';
        imgEl.parentNode.appendChild(msg);
      }
    };
  }, 300);
}

// Image info display removed - no more "Image 1 of 2" messages

function nextImage() {
  if (availableImages.length === 0) return;
  
  // Check if we're about to complete a full rotation
  if (currentIdx === availableImages.length - 1) {
    rotationCount++;
    console.log(`🔄 Completed rotation ${rotationCount} through ${availableImages.length} images`);
    
    // After completing a rotation, refresh images from GitHub
    refreshImagesAfterRotation();
  }
  
  currentIdx = (currentIdx + 1) % availableImages.length;
  showImage(currentIdx);
}

// Function to refresh images after completing a rotation
async function refreshImagesAfterRotation() {
  console.log('🔄 Refreshing slideshow images after completing rotation...');
  
  try {
    // Clear cache to ensure fresh data
    clearImageCache();
    
    const freshImages = await fetchGitHubImages();
    
    if (freshImages.length > 0) {
      const oldCount = availableImages.length;
      availableImages = freshImages.map(img => img.url);
      console.log(`✅ Refreshed slideshow: ${oldCount} → ${availableImages.length} images`);
      
      // Reset to first image and continue slideshow
      currentIdx = 0;
      showImage(currentIdx);
      
      // Log any new images found
      if (availableImages.length > oldCount) {
        console.log(`🎉 Found ${availableImages.length - oldCount} new images!`);
      }
    } else {
      console.log('⚠️ No fresh images found, keeping current set');
    }
    
  } catch (error) {
    console.error('❌ Error refreshing images after rotation:', error);
    console.log('🔄 Continuing with current image set');
  }
}

// Initialize slideshow with smart local caching
async function initializeSlideshow() {
  // Request wake lock to prevent sleep mode
  await requestWakeLock();
  
  try {
    console.log('Initializing slideshow with smart local caching...');
    
    // Try to get images from local cache first
    let images = getAllAvailableImages();
    
    // If we have cached images, use them
    if (images && images.length > 0) {
      availableImages = images;
      console.log(`✅ Using ${availableImages.length} cached local images`);
      currentIdx = 0;
      showImage(currentIdx);
      return;
    }
    
    // If no cache, try GitHub API as fallback
    console.log('🔄 No local cache, trying GitHub API...');
    try {
      const githubImages = await getCachedOrFetchImages();
      if (githubImages.length > 0) {
        availableImages = githubImages.map(img => img.url);
        console.log(`✅ Got ${availableImages.length} images from GitHub`);
        // Cache these for future use
        setLocalImageCache(availableImages);
        currentIdx = 0;
        showImage(currentIdx);
        return;
      }
    } catch (githubError) {
      console.log('⚠️ GitHub API failed, using fallback images');
    }
    
    // Final fallback to default images
    availableImages = getFallbackImages();
    if (availableImages.length > 0) {
      console.log(`📱 Using ${availableImages.length} fallback images`);
      // Cache these for future use
      setLocalImageCache(availableImages);
      currentIdx = 0;
      showImage(currentIdx);
    }
    
  } catch (error) {
    console.error('Error initializing slideshow:', error);
    // Emergency fallback
    availableImages = getFallbackImages();
    if (availableImages.length > 0) {
      currentIdx = 0;
      showImage(currentIdx);
    }
  }
}

setInterval(nextImage, 8000); // 8 seconds

// Function to get fallback images with correct paths for current environment
function getFallbackImages() {
  return [
    getImagePath('coat-drive.jpg'),
    getImagePath('imams-schedule.png'),
    getImagePath('membership drive.jpg'),
    getImagePath('Untitled design - Kehkeshan Shah-COLLAGE.jpg'),
    getImagePath('Untitled design-4 - Aalaa Alshareef-COLLAGE.jpg'),
    getImagePath('winter-fundraiser.jpg')
  ];
}



// === Rotating Ayats/Hadith Logic ===
const ayatsContent = document.getElementById('ayats-content');
let ayatIdx = 0;

function showAyat(idx) {
  if (ayatsContent) {
    const ayat = ayatHadithList[idx];
    const en = ayat.en.replace(/[.]+(?=\s*\()/, '');
    ayatsContent.innerHTML = `<div style="font-size:1rem;text-align:center;color:white;line-height:1.4;padding:15px;background:rgba(255,255,255,0.1);border-radius:8px;border-left:4px solid #2196F3;">${en}</div>`;
  }
}

// Initialize ayats rotation
if (ayatsContent) {
  showAyat(ayatIdx);
  setInterval(() => {
    ayatIdx = (ayatIdx + 1) % ayatHadithList.length;
    showAyat(ayatIdx);
  }, 20000); // 20 seconds
}



// === Prayer Times Logic ===
function renderPrayerTimes() {
  console.log('🕌 Rendering prayer times...');
  console.log('🔍 DOM ready state:', document.readyState);
  console.log('🔍 Current URL:', window.location.href);
  
  const prayerList = document.getElementById('prayer-times-list');
  console.log('🔍 Prayer list element search result:', prayerList);
  
  if (!prayerList) {
    console.error('❌ Prayer times list element not found!');
    console.error('🔍 Available elements with "prayer" in class or id:');
    document.querySelectorAll('*').forEach(el => {
      if (el.className && el.className.includes('prayer') || 
          el.id && el.id.includes('prayer')) {
        console.log('  - Found:', el.tagName, 'class:', el.className, 'id:', el.id);
      }
    });
    return;
  }
  
  console.log('✅ Found prayer times list element:', prayerList);
  console.log('🔍 Prayer list current HTML:', prayerList.innerHTML);
  console.log('🔍 Prayer list parent element:', prayerList.parentElement);
  
  // Clear existing content
  prayerList.innerHTML = '';
  console.log('🔍 Cleared prayer list HTML');
  
  const zipcode = '15044';
  const country = 'US';
  
  console.log('🌐 Fetching prayer times from API...');
  
  fetch(`https://api.aladhan.com/v1/timingsByAddress?address=${zipcode},${country}`)
    .then(res => {
      console.log('📡 API response status:', res.status, res.statusText);
      return res.json();
    })
    .then(data => {
      console.log('✅ Prayer times API response:', data);
      const times = data.data.timings;
      const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      
      console.log('📝 Processing prayer times...');
      
      prayerOrder.forEach(name => {
        let time = times[name];
        if (time) {
          let [h, m] = time.split(':');
          let hour = parseInt(h, 10);
          let ampm = 'AM';
          if (hour === 0) {
            hour = 12;
          } else if (hour === 12) {
            ampm = 'PM';
          } else if (hour > 12) {
            hour -= 12;
            ampm = 'PM';
          }
          time = `${hour}:${m} ${ampm}`;
        }
        
        const li = document.createElement('li');
        li.textContent = `${name}: ${time}`;
        li.className = 'prayer-time-item';
        prayerList.appendChild(li);
        console.log(`✅ Added prayer time: ${name}: ${time}`);
        console.log(`🔍 Prayer list now has ${prayerList.children.length} children`);
      });
      
      // Add Jummah time
      const jummahLi = document.createElement('li');
      jummahLi.textContent = 'Jummah: 1:15 PM';
      jummahLi.className = 'prayer-time-item';
      prayerList.appendChild(jummahLi);
      console.log('✅ Added Jummah time');
      console.log(`🔍 Final prayer list has ${prayerList.children.length} children`);
      console.log('🔍 Final prayer list HTML:', prayerList.innerHTML);
    })
    .catch((error) => {
      console.error('❌ Prayer times API failed, using fallback:', error);
      
      // fallback static times if API fails
      const fallback = [
        { name: 'Fajr', time: '05:12 AM' },
        { name: 'Dhuhr', time: '01:23 PM' },
        { name: 'Asr', time: '05:07 PM' },
        { name: 'Maghrib', time: '08:34 PM' },
        { name: 'Isha', time: '10:02 PM' },
      ];
      
      console.log('🔄 Using fallback prayer times...');
      
      fallback.forEach(pt => {
        const li = document.createElement('li');
        li.textContent = `${pt.name}: ${pt.time}`;
        li.className = 'prayer-time-item';
        prayerList.appendChild(li);
        console.log(`✅ Added fallback prayer time: ${pt.name}: ${pt.time}`);
      });
      
      // Add Jummah time to fallback as well
      const jummahLi = document.createElement('li');
      jummahLi.textContent = 'Jummah: 1:15 PM';
      jummahLi.className = 'prayer-time-item';
      prayerList.appendChild(jummahLi);
      console.log('✅ Added fallback Jummah time');
      console.log(`🔍 Final fallback prayer list has ${prayerList.children.length} children`);
    });
}

// === QR Code Images ===
// Function to render QR codes
function renderQrCodes() {
  console.log('🔍 Rendering QR codes...');
  const qrList = document.querySelector('.qr-list');
  console.log('📍 QR list element:', qrList);
  
  if (qrList) {
    const qrImageUrls = getQrImageUrls();
    console.log('🖼️ QR image URLs:', qrImageUrls);
    
    if (qrImageUrls && typeof qrImageUrls === 'object') {
      qrList.innerHTML = '';
      Object.entries(qrImageUrls).forEach(([key, url], i) => {
        console.log(`📱 Creating QR code ${i + 1}:`, key, url);
        
        const wrapper = document.createElement('div');
        wrapper.className = 'qr-wrapper';
        // Remove all inline styles - let CSS handle everything!

        const label = document.createElement('div');
        label.textContent = qrImageLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        label.className = 'qr-label';
        // Remove all inline styles - let CSS handle everything!

        const img = document.createElement('img');
        img.className = 'qr-img';
        img.alt = label.textContent;
        
        // Try multiple paths for the image
        const tryImagePaths = (imageKey) => {
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          
          // Dynamic path logic for all QR codes
          const getImageFileName = (key) => {
            switch(key) {
              case 'mapWebsite': return 'mapitt.png';
              case 'communityWhatsApp': return 'whatsapp_group.png';
              default: return 'mapitt.png';
            }
          };
          
          const imageFileName = getImageFileName(imageKey);
          
          // Simple path logic: local uses relative, production uses absolute
          const paths = isLocal ? [
            `./images/qr-codes/${imageFileName}`,
            `images/qr-codes/${imageFileName}`
          ] : [
            `/chromecast_stream/images/qr-codes/${imageFileName}`,
            `./images/qr-codes/${imageFileName}`
          ];
          
          // Add the original config URL as the first fallback
          paths.unshift(url);
          
          let currentPathIndex = 0;
          
          const tryNextPath = () => {
            if (currentPathIndex < paths.length) {
              const currentPath = paths[currentPathIndex];
              console.log(`🔄 Trying QR image path ${currentPathIndex + 1}/${paths.length}:`, currentPath);
              img.src = currentPath;
              currentPathIndex++;
            } else {
              // All paths failed, show fallback text
              console.error(`❌ All paths failed for QR image: ${imageKey}`);
              const fallbackText = document.createElement('div');
              fallbackText.textContent = `QR Code: ${qrImageLabels[key] || key}`;
              fallbackText.className = 'qr-fallback';
              // Remove all inline styles - let CSS handle everything!
              wrapper.appendChild(fallbackText);
            }
          };
          
          img.onerror = () => {
            console.error(`❌ Failed to load QR image from path:`, img.src);
            tryNextPath();
          };
          
          img.onload = () => {
            console.log(`✅ QR image loaded successfully: ${img.src}`);
            console.log(`✅ Image element:`, img);
            console.log(`✅ Image dimensions:`, img.naturalWidth, 'x', img.naturalHeight);
          };
          
          // Start with first path
          tryNextPath();
        };
        
        // Start trying to load the image
        tryImagePaths(key);
        
        // Log the created image element
        console.log(`📸 Created image element for ${key}:`, img);
        console.log(`🔗 Image src set to:`, url);

        wrapper.appendChild(label);
        wrapper.appendChild(img);
        qrList.appendChild(wrapper);
      });
      console.log('✅ QR codes rendered successfully');
      
      // Debug: Check what's actually in the DOM
      console.log('🔍 Final QR list HTML:', qrList.innerHTML);
      console.log('🔍 QR list children count:', qrList.children.length);
      console.log('🔍 All image elements in QR list:', qrList.querySelectorAll('img'));
      
      // Add a retry mechanism if no images are found
      if (qrList.children.length === 0) {
        console.warn('⚠️ No QR codes rendered, retrying in 1 second...');
        setTimeout(() => {
          console.log('🔄 Retrying QR code rendering...');
          renderQrCodes();
        }, 1000);
      }
    } else {
      console.error('❌ QR image URLs not available or invalid');
    }
  } else {
    console.error('❌ QR list element not found');
  }
}

// Initialize everything when the page loads
console.log('🚀 Initializing Chromecast Receiver Demo...');

// DEBUG: Add debug button functionality
document.addEventListener('DOMContentLoaded', () => {
  const debugBtn = document.getElementById('debugBtn');
  if (debugBtn) {
    debugBtn.addEventListener('click', () => {
      console.log('🔍 DEBUG BUTTON CLICKED');
      
      // Force apply debug styles
      document.body.style.border = '10px solid yellow';
      
      // Check current CSS variables
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      console.log('🎨 Current CSS Variables:');
      console.log('  - headerHeight:', computedStyle.getPropertyValue('--header-height'));
      console.log('  - contentHeight:', computedStyle.getPropertyValue('--content-height'));
      console.log('  - ayatsHeight:', computedStyle.getPropertyValue('--ayats-height'));
      console.log('  - gap:', computedStyle.getPropertyValue('--gap'));
      console.log('  - padding:', computedStyle.getPropertyValue('--padding'));
      
      // Check actual computed styles of elements
      const prayerTimes = document.querySelector('.prayer-times');
      const qrCodes = document.querySelector('.qr-codes');
      const slideshow = document.querySelector('.slideshow');
      
      if (prayerTimes) {
        const style = window.getComputedStyle(prayerTimes);
        console.log('📏 Prayer Times Computed Styles:');
        console.log('  - height:', style.height);
        console.log('  - maxHeight:', style.maxHeight);
        console.log('  - overflow:', style.overflow);
        console.log('  - padding:', style.padding);
        console.log('  - margin:', style.margin);
        console.log('  - display:', style.display);
        console.log('  - position:', style.position);
      }
      
      if (qrCodes) {
        const style = window.getComputedStyle(qrCodes);
        console.log('📏 QR Codes Computed Styles:');
        console.log('  - height:', style.height);
        console.log('  - maxHeight:', style.maxHeight);
        console.log('  - overflow:', style.overflow);
        console.log('  - padding:', style.padding);
        console.log('  - margin:', style.margin);
        console.log('  - display:', style.display);
        console.log('  - position:', style.position);
      }
      
      // Check media query match
      const mediaQuery1920 = window.matchMedia('(min-width: 1920px)');
      const mediaQuery960 = window.matchMedia('(min-width: 960px) and (max-width: 1200px)');
      console.log('📺 Media Query (min-width: 1920px):', mediaQuery1920.matches);
      console.log('📺 Media Query (960px-1200px):', mediaQuery960.matches);
      
      // Check viewport
      console.log('📱 Viewport:');
      console.log('  - width:', window.innerWidth);
      console.log('  - height:', window.innerHeight);
      
      // Check cache status
      console.log('💾 Cache Status:');
      const cacheInfo = getCacheInfo();
      if (cacheInfo) {
        console.log('  - GitHub Cache Age:', cacheInfo.age + ' minutes');
        console.log('  - GitHub Cache Expires In:', cacheInfo.expiresIn + ' minutes');
        console.log('  - GitHub Cache Image Count:', cacheInfo.imageCount);
      } else {
        console.log('  - GitHub Cache: None');
      }
      
      const localCache = getLocalImageCache();
      if (localCache) {
        console.log('  - Local Cache: Available with', localCache.length, 'images');
      } else {
        console.log('  - Local Cache: None');
      }
      
      console.log('  - Available Images:', availableImages.length);
      console.log('  - Current Image Index:', currentIdx);
    });
  }
});

// DEBUG: Log screen dimensions and CSS variables
console.log('📱 Screen Dimensions:', {
  width: window.innerWidth,
  height: window.innerHeight,
  screenWidth: screen.width,
  screenHeight: screen.height,
  devicePixelRatio: window.devicePixelRatio
});

// DEBUG: Check if CSS variables are being applied
setTimeout(() => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  console.log('🎨 CSS Variables Applied:', {
    headerHeight: computedStyle.getPropertyValue('--header-height'),
    contentHeight: computedStyle.getPropertyValue('--content-height'),
    ayatsHeight: computedStyle.getPropertyValue('--ayats-height'),
    gap: computedStyle.getPropertyValue('--gap'),
    padding: computedStyle.getPropertyValue('--padding')
  });
  
  // DEBUG: Check actual element dimensions
  const prayerTimes = document.querySelector('.prayer-times');
  const qrCodes = document.querySelector('.qr-codes');
  const slideshow = document.querySelector('.slideshow');
  
  if (prayerTimes) {
    const rect = prayerTimes.getBoundingClientRect();
    console.log('📏 Prayer Times Element:', {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left
    });
  }
  
  if (qrCodes) {
    const rect = qrCodes.getBoundingClientRect();
    console.log('📏 QR Codes Element:', {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left
    });
  }
}, 1000);

// Ensure DOM is fully loaded before setting background
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM fully loaded, setting background image...');
    loadBackgroundImage();
    // Add a small delay to ensure everything is ready
    setTimeout(() => {
      renderPrayerTimes(); // Render prayer times when DOM is ready
      renderQrCodes(); // Render QR codes when DOM is ready
    }, 100);
  });
} else {
  console.log('📄 DOM already loaded, setting background image...');
  loadBackgroundImage();
  // Add a small delay to ensure everything is ready
  setTimeout(() => {
    renderPrayerTimes(); // Render prayer times immediately if DOM is already ready
    renderQrCodes(); // Render QR codes immediately if DOM is already ready
  }, 100);
}

initializeSlideshow();

// Detect if running as Chromecast receiver and optimize layout
detectAndOptimizeForChromecast();

// === AUTO-RELOAD FUNCTIONALITY ===
// Reload at midnight each day to ensure fresh content
function scheduleReload() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const timeUntilMidnight = tomorrow - now;
  
  console.log('🕛 Scheduling daily reload at midnight');
  console.log('⏰ Current time:', now.toLocaleTimeString());
  console.log('🌅 Next reload at:', tomorrow.toLocaleString());
  console.log('⏳ Time until reload:', Math.round(timeUntilMidnight / 1000 / 60), 'minutes');
  
  setTimeout(() => {
    console.log('🔄 Executing scheduled daily reload...');
    window.location.reload();
  }, timeUntilMidnight);
  
  // Schedule the next reload after this one
  setTimeout(() => {
    scheduleReload();
  }, timeUntilMidnight);
}

// Start the reload scheduling
scheduleReload();

// Add cache debugging to console
console.log('🔧 Cache Management Commands Available:');
console.log('  - getCacheInfo() - Check cache status');
console.log('  - clearImageCache() - Clear image cache');
console.log('  - forceRefreshImages() - Force refresh from GitHub');
console.log('  - CACHE_DURATION:', Math.round(CACHE_DURATION / 1000 / 60), 'minutes');

console.log('✅ Initialization complete!');
