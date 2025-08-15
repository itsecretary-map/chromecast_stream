#!/bin/bash

# sync-online-images.sh - Sync images uploaded online to gh-pages
# Usage: ./sync-online-images.sh

echo "🌐 Starting online image sync process..."

# Pull latest changes from remote (including online uploads)
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Pull successful"
    
    # Check if there are new images
    echo "🔍 Checking for new images..."
    
    # Get list of images in main repo
    MAIN_IMAGES=$(find images/slideshow -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" | sort)
    
    # Get list of images in dist (if it exists)
    if [ -d "dist/images/slideshow" ]; then
        DIST_IMAGES=$(find dist/images/slideshow -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" | sort)
    else
        DIST_IMAGES=""
    fi
    
    # Compare and show differences
    if [ "$MAIN_IMAGES" != "$DIST_IMAGES" ]; then
        echo "📸 New images detected! Syncing to gh-pages..."
        
        # Build the project (copies images to dist/)
        echo "🔨 Building project..."
        npm run build
        
        if [ $? -eq 0 ]; then
            echo "✅ Build successful"
            
            # Deploy to gh-pages
            echo "🚀 Deploying to gh-pages..."
            npm run deploy
            
            if [ $? -eq 0 ]; then
                echo "✅ Deployment successful"
                echo "🎉 Online images are now synced to gh-pages!"
                
                # Show what was synced
                echo "📋 Synced images:"
                echo "$MAIN_IMAGES" | while read -r img; do
                    echo "  - $(basename "$img")"
                done
            else
                echo "❌ Deployment failed"
                exit 1
            fi
        else
            echo "❌ Build failed"
            exit 1
        fi
    else
        echo "✅ Images are already in sync"
    fi
else
    echo "❌ Pull failed"
    exit 1
fi

echo "✨ Online image sync process complete!"
