// main.js - Chromecast Receiver Demo
// Rotates through images from GitHub repository and displays announcements

import { 
  ayatHadithList,
  qrImageUrls,
  qrImageLabels,
  githubConfig,
  slideshowImgUrls
} from './config.js';

// === BACKGROUND IMAGE LOADING ===
function loadBackgroundImage() {
  // Try multiple possible paths for the background image
  const possiblePaths = [
    './CCA_5344-HDR.jpg',
    'CCA_5344-HDR.jpg',
    '/CCA_5344-HDR.jpg',
    '../CCA_5344-HDR.jpg'
  ];
  
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
    
    // Apply background image to body with !important to override any CSS
    document.body.style.setProperty('background-image', `url('${testImg.src}')`, 'important');
    document.body.style.setProperty('background-size', 'cover', 'important');
    document.body.style.setProperty('background-position', 'center center', 'important');
    document.body.style.setProperty('background-attachment', 'fixed', 'important');
    document.body.style.setProperty('background-repeat', 'no-repeat', 'important');
    
    console.log('🎨 Background image applied to body element with !important');
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
    
    // Filter for image files only
    const imageFiles = files.filter(file => {
      const extension = file.name.toLowerCase().split('.').pop();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
    });
    
    console.log(`Found ${imageFiles.length} image files:`, imageFiles);
    
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

// Cache management functions
function clearImageCache() {
  localStorage.removeItem(GITHUB_CACHE_KEY);
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

// Force refresh images (bypass cache)
async function forceRefreshImages() {
  console.log('🔄 Force refreshing images from GitHub...');
  clearImageCache();
  const freshImages = await fetchGitHubImages();
  if (freshImages.length > 0) {
    availableImages = freshImages.map(img => img.url);
    console.log(`Updated slideshow with ${availableImages.length} fresh images`);
    if (availableImages.length > 0) {
      currentIdx = 0;
      showImage(currentIdx);
    }
  }
  return freshImages;
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
  
  // Optimize layout spacing for TV
  const mainLayout = document.querySelector('.main-layout');
  if (mainLayout) {
    mainLayout.style.maxWidth = window.innerWidth >= 3840 ? '2400px' : '1800px';
    mainLayout.style.margin = '0 auto';
    mainLayout.style.padding = window.innerWidth >= 3840 ? '60px' : '40px';
  }
  
  // Optimize slideshow for TV
  const slideshow = document.querySelector('.slideshow img');
  if (slideshow) {
    slideshow.style.maxHeight = '70vh';
    slideshow.style.borderRadius = '16px';
    slideshow.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.6)';
  }
  
  console.log('🎨 TV display optimizations applied');
}

// === Slideshow Logic ===
let currentIdx = 0;
const imgEl = document.getElementById('slideshow-img');

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
  currentIdx = (currentIdx + 1) % availableImages.length;
  showImage(currentIdx);
}

// Initialize slideshow with GitHub images
async function initializeSlideshow() {
  try {
    console.log('Initializing slideshow with GitHub images...');
    
    const githubImages = await getCachedOrFetchImages();
    
    if (githubImages.length > 0) {
      availableImages = githubImages.map(img => img.url);
      console.log(`Updated slideshow with ${availableImages.length} images from GitHub`);
      
      // Start slideshow if we have images
      if (availableImages.length > 0) {
        currentIdx = 0;
        showImage(currentIdx);
      }
    } else {
      console.log('No images found in GitHub repository');
      // Fallback to default images if needed
      availableImages = slideshowImgUrls;
      if (availableImages.length > 0) {
        currentIdx = 0;
        showImage(currentIdx);
      }
    }
    
  } catch (error) {
    console.error('Error initializing slideshow:', error);
    // Fallback to default images
    availableImages = slideshowImgUrls;
    if (availableImages.length > 0) {
      currentIdx = 0;
      showImage(currentIdx);
    }
  }
}

setInterval(nextImage, 10000); // 10 seconds

// === Rotating Ayat/Hadith Logic ===
const annList = document.getElementById('announcements-list');
let ayatIdx = 0;
function showAyat(idx) {
  annList.innerHTML = '';
  // Use a div instead of <li> to avoid bullet
  const wrapper = document.createElement('div');
  // Remove trailing period from Arabic and English if present
  const ar = ayatHadithList[idx].ar.replace(/[.\u06D4]+$/, '');
  const en = ayatHadithList[idx].en.replace(/[.]+(?=\s*\()/, '');
  wrapper.innerHTML = `<div style="font-size:1.5rem;font-weight:bold;direction:rtl;text-align:center;color:white;">${ar}</div><div style="margin-top:6px;font-size:1.1rem;text-align:center;color:white;">${en}</div>`;
  annList.appendChild(wrapper);
}
showAyat(ayatIdx);
setInterval(() => {
  ayatIdx = (ayatIdx + 1) % ayatHadithList.length;
  showAyat(ayatIdx);
}, 20000); // 20 seconds

// === Prayer Times Logic ===
// Fetch prayer times for zipcode 15044 (Gibsonia, PA) but do not display the location
const zipcode = '15044';
const country = 'US';
const prayerList = document.getElementById('prayer-times-list');

fetch(`https://api.aladhan.com/v1/timingsByAddress?address=${zipcode},${country}`)
  .then(res => res.json())
  .then(data => {
    const times = data.data.timings;
    const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    prayerOrder.forEach(name => {
      let time = times[name];
      // Convert to 12-hour format with AM/PM if needed
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
      prayerList.appendChild(li);
    });
    // Add Jummah time
    const jummahLi = document.createElement('li');
    jummahLi.textContent = 'Jummah: 1:15 PM';
    prayerList.appendChild(jummahLi);
  })
  .catch(() => {
    // fallback static times if API fails
    const fallback = [
      { name: 'Fajr', time: '05:12 AM' },
      { name: 'Dhuhr', time: '01:23 PM' },
      { name: 'Asr', time: '05:07 PM' },
      { name: 'Maghrib', time: '08:34 PM' },
      { name: 'Isha', time: '10:02 PM' },
    ];
    fallback.forEach(pt => {
      // Convert fallback time to 12-hour format with AM/PM if needed
      let [h, m, ap] = pt.time.match(/(\d+):(\d+)\s*(AM|PM)/i) || [];
      let time = pt.time;
      if (h && m && ap) {
        time = `${parseInt(h, 10)}:${m} ${ap.toUpperCase()}`;
      }
      const li = document.createElement('li');
      li.textContent = `${pt.name}: ${time}`;
      prayerList.appendChild(li);
    });
    // Add Jummah time to fallback as well
    const jummahLi = document.createElement('li');
    jummahLi.textContent = 'Jummah: 1:15 PM';
    prayerList.appendChild(jummahLi);
  });

// === QR Code Images ===
// Use a map with descriptive keys for each QR code

// Map for QR code display names
const qrList = document.querySelector('.qr-list');
if (qrList && qrImageUrls && typeof qrImageUrls === 'object') {
  qrList.innerHTML = '';
  Object.entries(qrImageUrls).forEach(([key, url], i) => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginBottom = '18px';

    const label = document.createElement('div');
    label.textContent = qrImageLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    label.style.color = '#ffd600';
    label.style.fontSize = '1.1rem';
    label.style.marginBottom = '8px';
    label.style.textAlign = 'center';
    label.style.wordBreak = 'break-word';

    const img = document.createElement('img');
    img.className = 'qr-img';
    img.src = url;
    img.alt = label.textContent;

    wrapper.appendChild(label);
    wrapper.appendChild(img);
    qrList.appendChild(wrapper);
  });
}

// Initialize everything when the page loads
console.log('🚀 Initializing Chromecast Receiver Demo...');

// Ensure DOM is fully loaded before setting background
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM fully loaded, setting background image...');
    loadBackgroundImage();
  });
} else {
  console.log('📄 DOM already loaded, setting background image...');
  loadBackgroundImage();
}

initializeSlideshow();

// Detect if running as Chromecast receiver and optimize layout
detectAndOptimizeForChromecast();

// Add cache debugging to console
console.log('🔧 Cache Management Commands Available:');
console.log('  - getCacheInfo() - Check cache status');
console.log('  - clearImageCache() - Clear image cache');
console.log('  - forceRefreshImages() - Force refresh from GitHub');
console.log('  - CACHE_DURATION:', Math.round(CACHE_DURATION / 1000 / 60), 'minutes');

console.log('✅ Initialization complete!');
