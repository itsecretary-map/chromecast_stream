#!/bin/bash

# sync-images.sh - Automatically sync images between main repo and gh-pages
# Usage: ./sync-images.sh

echo "🔄 Starting image sync process..."

# Check if there are any changes in images directory
if git diff --quiet images/; then
    echo "✅ No changes detected in images/ directory"
else
    echo "📸 Changes detected in images/ directory"
    
    # Build the project (this copies images to dist/)
    echo "🔨 Building project..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful"
        
        # Deploy to gh-pages
        echo "🚀 Deploying to gh-pages..."
        npm run deploy
        
        if [ $? -eq 0 ]; then
            echo "✅ Deployment successful"
            echo "🎉 Images are now in sync between main repo and gh-pages!"
        else
            echo "❌ Deployment failed"
            exit 1
        fi
    else
        echo "❌ Build failed"
        exit 1
    fi
fi

echo "✨ Image sync process complete!"
