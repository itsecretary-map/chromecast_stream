# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MAP Chromecast Stream is a digital signage platform for the Muslim Association of Greater Pittsburgh (MAP). It displays prayer times, a rotating image slideshow, QR codes, and Islamic quotes on Chromecast devices, Android TV, and web browsers. Deployed to GitHub Pages at `https://itsecretary-map.github.io/chromecast_stream/`.

## Build & Development Commands

```bash
npm run dev            # Start Vite dev server (port 5173, auto-opens browser, network-accessible)
npm run build          # Build production bundle to dist/
npm run deploy         # Deploy dist/ to GitHub Pages via gh-pages
npm run build-deploy   # Build + deploy in one step
npm run preview        # Preview production build locally
npm run sync-images    # Sync images via shell script
```

## Architecture

**Stack:** Vanilla JavaScript (ES modules), Vite 7.1.0, deployed to GitHub Pages with `gh-pages`.

### Source Files

- `index.html` — Entry point with TV-optimized meta tags and three-row layout (header, content, footer)
- `src/main.js` — All application logic (~1200 lines), organized as functional modules
- `src/config.js` — Configuration constants, image path resolution, ayat/hadith data, GitHub API config
- `src/style.css` — All styling with TV-responsive media queries (960-1200px for emulator, 1920px+ for real TVs)

### Key Functional Modules in main.js

1. **Prayer Times** — Fetches from Aladhan API using hardcoded zipcode 15044; has static fallback times
2. **Slideshow** — Rotates images every 8 seconds; fetches image list from GitHub API, caches in LocalStorage for 24 hours, falls back to bundled defaults
3. **QR Codes** — Displays MAP website and WhatsApp group QR codes with multi-path fallback loading
4. **Ayat/Hadith Rotation** — Cycles through 40 curated bilingual quotes every 20 seconds
5. **TV/Chromecast Detection** — Auto-detects display environment and optimizes viewport, fonts, layout
6. **Wake Lock** — Prevents device sleep using Wake Lock API with fallbacks (activity simulation, fullscreen, silent AudioContext)
7. **Auto-Reload** — Schedules page reload at midnight daily for fresh content

### Environment Detection Pattern

All image paths and asset URLs are resolved at runtime by detecting GitHub Pages (`location.hostname` check) vs. local dev. This pattern is used in `config.js` (`getImagePath`, `getQrImagePath`, `getQrImageUrls`) and throughout `main.js`. The Vite config sets `base: '/chromecast_stream/'` for GitHub Pages path resolution.

### Image Caching Strategy

Two-tier LocalStorage caching: GitHub API responses cached 24 hours (`GITHUB_CACHE_KEY`), resolved image URLs cached separately (`LOCAL_IMAGE_CACHE_KEY`). After a complete slideshow rotation, images are re-fetched from GitHub to pick up changes.

### Static Assets

Vite copies `images/` and `CCA_5344-HDR.jpg` to `dist/` via `vite-plugin-static-copy`. Image directories:
- `images/slideshow/` — Rotating slideshow images (JPG, PNG, GIF, WEBP)
- `images/qr-codes/` — QR code images (mapitt.png, whatsapp.png)

### Android TV Wrapper

`android-tv-wrapper/` contains a Kotlin/Gradle native Android TV app (package `com.map.chromecaststream`, target SDK 34) that wraps the web app in a full-screen WebView with D-pad navigation and wake lock support.

## Layout Structure

Three-row flex layout filling the viewport:
- **Header** (60px): Welcome banner
- **Content Row**: Three columns — Prayer Times (30%) | Slideshow (40%) | QR Codes (30%)
- **Footer** (60px): Rotating ayat/hadith display
