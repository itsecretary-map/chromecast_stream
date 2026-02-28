# MAP Chromecast Stream - Project Documentation

## Table of Contents
1. [Overview](#overview)
2. [Capabilities](#capabilities)
3. [System Components](#system-components)
4. [Architecture](#architecture)
5. [Limitations](#limitations)
6. [Deployment](#deployment)
7. [Configuration](#configuration)

---

## Overview

**MAP Chromecast Stream** is a web-based digital signage application designed for the Muslim Association of Greater Pittsburgh (MAP). The application is optimized for display on large screens, Chromecast devices, and Android TV devices, providing real-time community information including prayer times, announcements, and community resources.

### Key Features
- **TV-Optimized Display**: Responsive layout designed for 1080p, 4K, and ultra-wide displays
- **Dynamic Content**: Real-time prayer times, rotating slideshow images, and rotating Islamic quotes
- **Multiple Deployment Options**: Web-based (GitHub Pages), Android TV app, and Chromecast receiver
- **Smart Caching**: Local and remote caching mechanisms for optimal performance
- **Sleep Prevention**: Wake lock API integration to prevent screen sleep during operation

---

## Capabilities

### 1. **Prayer Times Display**
- Fetches real-time prayer times from Aladhan API based on zipcode (15044, US)
- Displays five daily prayers: Fajr, Dhuhr, Asr, Maghrib, Isha
- Includes Jummah (Friday prayer) time
- Automatic fallback to static times if API fails
- Updates daily at midnight

### 2. **Dynamic Slideshow**
- Rotates through images every 8 seconds
- Fetches images from GitHub repository (`images/slideshow/` folder)
- Supports multiple image formats: JPG, JPEG, PNG, GIF, WEBP
- Automatic refresh after completing a full rotation
- Local caching with 24-hour expiration
- Fallback to default images if GitHub API fails
- Preloads images to prevent layout shifts

### 3. **QR Code Display**
- Displays community QR codes for:
  - MAP Website (`mapitt.png`)
  - Community WhatsApp Group (`whatsapp.png`)
- Dynamic path resolution for local and production environments
- Automatic retry mechanism for failed image loads

### 4. **Rotating Ayat/Hadith**
- Displays 40 curated Islamic quotes (Ayat from Quran and Hadith)
- Rotates every 20 seconds
- Focused on community values, prayer, knowledge, and accountability
- Bilingual support (Arabic text with English translations)

### 5. **TV Display Optimization**
- Automatic detection of TV/Chromecast receiver mode
- Responsive layout for different screen sizes:
  - Standard 16:9 displays (1920x1080, 3840x2160)
  - Ultra-wide displays
- Viewport locking to prevent unwanted scaling
- Font size optimization based on screen resolution

### 6. **Sleep Prevention**
- Wake Lock API integration to prevent screen sleep
- Fallback keep-alive mechanisms for unsupported browsers
- Automatic re-acquisition of wake lock on visibility changes
- Fullscreen mode support

### 7. **Caching System**
- **GitHub API Cache**: 24-hour cache for GitHub repository images
- **Local Image Cache**: Persistent local storage cache with versioning
- **Cache Management**: Manual cache clearing and refresh capabilities
- **Fallback Strategy**: Multiple fallback layers for reliability

### 8. **Auto-Reload**
- Daily reload at midnight to ensure fresh content
- Automatic scheduling of subsequent reloads

---

## System Components

### Frontend Components

#### 1. **HTML Structure** (`index.html`)
- Main layout container with three-row structure:
  - **Row 1**: Header with welcome message
  - **Row 2**: Three-column layout (Prayer Times, Slideshow, QR Codes)
  - **Row 3**: Rotating Ayat/Hadith display
- Meta tags optimized for TV displays and mobile web apps
- Preload directives for critical assets

#### 2. **JavaScript Application** (`src/main.js`)
- **Image Management Module**:
  - GitHub API integration
  - Image caching and preloading
  - Fallback image handling
  - Rotation logic (8-second intervals)

- **Prayer Times Module**:
  - Aladhan API integration
  - Time formatting (12-hour format)
  - Fallback static times

- **QR Code Module**:
  - Dynamic path resolution
  - Image loading with retry logic

- **Ayat/Hadith Module**:
  - Rotation logic (20-second intervals)
  - Content rendering

- **TV Optimization Module**:
  - Screen size detection
  - Viewport locking
  - CSS variable management
  - Aspect ratio optimization

- **Wake Lock Module**:
  - Wake Lock API integration
  - Keep-alive fallback mechanisms
  - Visibility change handling

- **Cache Management Module**:
  - LocalStorage integration
  - Cache expiration logic
  - Cache versioning

#### 3. **Configuration** (`src/config.js`)
- GitHub repository configuration
- Image path resolution functions
- Ayat/Hadith content (40 items)
- QR code labels and paths
- Environment detection (local vs. GitHub Pages)

#### 4. **Styling** (`src/style.css`)
- Responsive CSS Grid/Flexbox layout
- TV-optimized typography
- Background image handling
- CSS variables for dynamic sizing
- Media queries for different screen sizes

### Build System

#### 1. **Vite Configuration** (`vite.config.js`)
- Base path configuration for GitHub Pages (`/chromecast_stream/`)
- Static asset copying (images, background image)
- Development server configuration
- Build optimization

#### 2. **Package Management** (`package.json`)
- Dependencies:
  - `vite`: Build tool and dev server
  - `vite-plugin-static-copy`: Static asset copying
  - `gh-pages`: GitHub Pages deployment
- Scripts:
  - `dev`: Development server
  - `build`: Production build
  - `preview`: Preview production build
  - `deploy`: Deploy to GitHub Pages
  - `sync-images`: Sync images script
  - `build-deploy`: Build and deploy

### Android TV Wrapper

#### 1. **Android Application** (`android-tv-wrapper/`)
- Native Android TV app built with Kotlin
- WebView integration to load web app
- TV-optimized layout and navigation
- D-pad and remote control support
- Fullscreen TV experience

#### 2. **Components**:
- `MainActivity.kt`: Main TV activity
- `activity_main.xml`: TV-optimized layout
- `AndroidManifest.xml`: TV-specific configuration
- App banner and icons for TV launcher

### Deployment Scripts

#### 1. **Image Sync Script** (`sync-images.sh`)
- Detects changes in `images/` directory
- Automatically builds and deploys when images change
- Recursive subdirectory checking

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER DEVICES                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Chromecast  │  │  Android TV  │  │  Web Browser │         │
│  │   Device     │  │     App      │  │   (Desktop)  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
└─────────┼─────────────────┼──────────────────┼──────────────────┘
          │                 │                  │
          └─────────────────┼──────────────────┘
                            │
          ┌─────────────────▼──────────────────┐
          │     GitHub Pages (Web App)          │
          │  https://itsecretary-map.github.io  │
          │      /chromecast_stream/             │
          └─────────────────┬───────────────────┘
                            │
          ┌─────────────────┼───────────────────┐
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐
│  GitHub API     │  │  Aladhan API│  │  Local Storage  │
│  (Images)       │  │  (Prayer    │  │  (Cache)        │
│                 │  │   Times)    │  │                 │
└─────────────────┘  └──────────────┘  └─────────────────┘
```

### Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Initialization                │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Load Config  │ │ Request Wake │ │ Detect TV    │
│              │ │ Lock         │ │ Mode         │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Initialize   │ │ Load Prayer  │ │ Load QR      │
│ Slideshow    │ │ Times        │ │ Codes        │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       │                │                │
       ▼                ▼                ▼
┌─────────────────────────────────────────────────┐
│           Check Cache (LocalStorage)            │
└───────────────────────┬─────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Cache Hit?   │ │ Cache Miss?  │ │ API Failed?  │
│ Use Cache    │ │ Fetch GitHub │ │ Use Fallback │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │    Render Content & Start     │
        │    Rotation Timers            │
        └───────────────────────────────┘
```

### Data Flow

#### Image Loading Flow
```
1. Application Start
   │
   ├─► Check LocalStorage Cache
   │   ├─► Cache Valid? → Use Cached Images
   │   └─► Cache Invalid/Missing? → Continue
   │
   ├─► Fetch from GitHub API
   │   ├─► Success? → Cache & Use Images
   │   └─► Failure? → Use Fallback Images
   │
   └─► Preload Images → Start Slideshow
```

#### Prayer Times Flow
```
1. Application Start
   │
   ├─► Fetch from Aladhan API
   │   ├─► Success? → Format & Display
   │   └─► Failure? → Use Fallback Times
   │
   └─► Schedule Daily Reload (Midnight)
```

### Technology Stack

```
┌─────────────────────────────────────────┐
│         Frontend Technologies           │
├─────────────────────────────────────────┤
│ • HTML5                                 │
│ • CSS3 (Grid, Flexbox, Variables)      │
│ • JavaScript (ES6 Modules)              │
│ • Web APIs (Wake Lock, LocalStorage)    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Build & Deployment               │
├─────────────────────────────────────────┤
│ • Vite (Build Tool)                     │
│ • npm (Package Manager)                 │
│ • GitHub Pages (Hosting)                │
│ • gh-pages (Deployment)                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         External APIs                    │
├─────────────────────────────────────────┤
│ • GitHub API (Image Repository)          │
│ • Aladhan API (Prayer Times)            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Android TV                       │
├─────────────────────────────────────────┤
│ • Kotlin                                │
│ • Android SDK 34                        │
│ • WebView                               │
│ • Leanback Library                      │
└─────────────────────────────────────────┘
```

---

## Limitations

### 1. **Browser Compatibility**
- **Wake Lock API**: Not supported in all browsers (Safari, older browsers)
  - **Impact**: Screen may sleep on unsupported devices
  - **Mitigation**: Fallback keep-alive mechanisms implemented

- **LocalStorage**: Limited storage capacity (~5-10MB)
  - **Impact**: Large image caches may fail
  - **Mitigation**: Cache expiration and versioning

### 2. **API Dependencies**
- **GitHub API Rate Limits**: 60 requests/hour for unauthenticated requests
  - **Impact**: Frequent refreshes may hit rate limits
  - **Mitigation**: 24-hour cache reduces API calls

- **Aladhan API Availability**: External dependency
  - **Impact**: Prayer times unavailable if API is down
  - **Mitigation**: Fallback static prayer times

### 3. **Network Requirements**
- **Internet Connection Required**: For prayer times and GitHub images
  - **Impact**: No offline functionality
  - **Mitigation**: Caching provides some offline capability for images

- **CORS Restrictions**: GitHub API may have CORS limitations
  - **Impact**: Direct browser requests may fail
  - **Mitigation**: Using GitHub's public API endpoints

### 4. **Image Management**
- **Manual Image Updates**: Images must be added to GitHub repository
  - **Impact**: No built-in image upload interface
  - **Workaround**: Use GitHub web interface or git commands

- **Image Format Support**: Limited to JPG, PNG, GIF, WEBP
  - **Impact**: Other formats not supported
  - **Note**: SVG not supported for slideshow images

### 5. **Display Limitations**
- **Fixed Layout**: Three-column layout may not suit all screen sizes
  - **Impact**: Suboptimal display on very small or very large screens
  - **Mitigation**: Responsive CSS with media queries

- **Background Image**: Single static background image
  - **Impact**: No dynamic background changes
  - **Note**: Background image must be manually updated

### 6. **Chromecast Integration**
- **Sender Functionality Disabled**: Chromecast sender code is commented out
  - **Impact**: Cannot cast from web browser
  - **Current Usage**: App runs as receiver only (via Android TV app)

- **App ID Dependency**: Hardcoded Chromecast App ID (`57E55C54`)
  - **Impact**: Requires Google Cast SDK registration
  - **Note**: Currently not actively used

### 7. **Performance Considerations**
- **Image Loading**: Large images may cause slow initial load
  - **Impact**: Delayed slideshow start
  - **Mitigation**: Image preloading and caching

- **Memory Usage**: Multiple large images in memory
  - **Impact**: High memory usage on low-end devices
  - **Mitigation**: Image rotation and cleanup

### 8. **Configuration Limitations**
- **Hardcoded Zipcode**: Prayer times zipcode is hardcoded (`15044`)
  - **Impact**: Cannot change location without code modification
  - **Location**: Defined in `src/main.js` line 791

- **Static Jummah Time**: Friday prayer time is hardcoded (`1:15 PM`)
  - **Impact**: Cannot automatically adjust for seasonal changes
  - **Location**: Defined in `src/main.js` line 835

### 9. **Android TV Wrapper**
- **WebView Dependency**: Relies on Android WebView
  - **Impact**: Performance depends on WebView version
  - **Note**: Older Android versions may have compatibility issues

- **No Native Features**: Limited to web app capabilities
  - **Impact**: Cannot access native TV features directly
  - **Note**: All functionality is web-based

### 10. **Deployment Limitations**
- **GitHub Pages Dependency**: Deployment tied to GitHub Pages
  - **Impact**: Requires GitHub account and repository
  - **Alternative**: Can be deployed to any static hosting

- **Base Path Requirement**: Hardcoded base path (`/chromecast_stream/`)
  - **Impact**: Must deploy to subdirectory
  - **Location**: Defined in `vite.config.js` line 5

### 11. **Content Management**
- **No Admin Interface**: All content managed via code/config
  - **Impact**: Requires technical knowledge to update content
  - **Workaround**: Direct file editing or GitHub web interface

- **Ayat/Hadith Content**: Hardcoded in configuration file
  - **Impact**: Adding/removing quotes requires code changes
  - **Location**: Defined in `src/config.js` lines 35-86

### 12. **Security Considerations**
- **No Authentication**: Public access to all content
  - **Impact**: No access control
  - **Note**: Appropriate for public community display

- **API Keys**: No authentication for external APIs
  - **Impact**: Subject to public API rate limits
  - **Note**: Using public APIs only

---

## Deployment

### Web Application (GitHub Pages)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

3. **Access the application**:
   ```
   https://itsecretary-map.github.io/chromecast_stream/
   ```

### Android TV Application

1. **Build the APK**:
   ```bash
   cd android-tv-wrapper
   ./gradlew assembleDebug
   ```

2. **Install on Android TV**:
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

### Image Synchronization

Run the sync script to automatically deploy image changes:
```bash
./sync-images.sh
```

---

## Configuration

### GitHub Repository Configuration

Edit `src/config.js`:
```javascript
export const githubConfig = {
  owner: 'itsecretary-map',
  repo: 'chromecast_stream',
  folder: 'images/slideshow',
  enabled: true
};
```

### Prayer Times Location

Edit `src/main.js` line 791:
```javascript
const zipcode = '15044';  // Change to your zipcode
const country = 'US';     // Change to your country
```

### Slideshow Timing

Edit `src/main.js` line 723:
```javascript
setInterval(nextImage, 8000); // Change interval (milliseconds)
```

### Ayat/Hadith Rotation

Edit `src/main.js` line 757:
```javascript
setInterval(() => {
  ayatIdx = (ayatIdx + 1) % ayatHadithList.length;
  showAyat(ayatIdx);
}, 20000); // Change interval (milliseconds)
```

---

## Maintenance

### Regular Tasks
- **Weekly**: Check GitHub API rate limit usage
- **Monthly**: Review and update Ayat/Hadith content
- **As Needed**: Add/remove slideshow images
- **Seasonal**: Update Jummah time if needed

### Troubleshooting

#### Images Not Loading
1. Check GitHub API rate limits
2. Verify image paths in repository
3. Clear browser cache and localStorage
4. Check browser console for errors

#### Prayer Times Not Displaying
1. Verify Aladhan API is accessible
2. Check network connectivity
3. Verify zipcode is correct
4. Check browser console for API errors

#### Screen Going to Sleep
1. Verify Wake Lock API support
2. Check browser compatibility
3. Ensure fullscreen mode is active
4. Check keep-alive fallback is working

---

## Future Enhancements

Potential improvements for future versions:
- Admin interface for content management
- Multiple location support for prayer times
- Dynamic Jummah time calculation
- Image upload interface
- Analytics and usage tracking
- Multi-language support
- Customizable layout themes
- Scheduled content display
- Integration with masjid calendar systems

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-27  
**Maintained By**: MAP IT Team
