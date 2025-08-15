#!/bin/bash

# sync-images.sh - Automatically sync images between main repo and gh-pages
# Usage: ./sync-images.sh

echo "🔄 Starting image sync process..."

# Check if there are any changes in images directory and all subdirectories recursively
echo "🔍 Checking for changes in images directory and all subdirectories recursively..."

# Get all subdirectories under images/
SUBDIRS=$(find images/ -type d 2>/dev/null | sort)

# Check for changes in main images directory and all subdirectories
CHANGES_DETECTED=false

# Check main images directory for both modified and untracked files
if ! git diff --quiet images/ || [ -n "$(git ls-files --others --exclude-standard images/)" ]; then
    echo "📸 Changes detected in images/ directory"
    CHANGES_DETECTED=true
fi

# Check each subdirectory for both modified and untracked files
for subdir in $SUBDIRS; do
    if [ "$subdir" != "images/" ]; then  # Skip the root images directory (already checked)
        if ! git diff --quiet "$subdir" || [ -n "$(git ls-files --others --exclude-standard "$subdir")" ]; then
            echo "📸 Changes detected in $subdir"
            CHANGES_DETECTED=true
        fi
    fi
done

if [ "$CHANGES_DETECTED" = false ]; then
    echo "✅ No changes detected in images/ directory or any subdirectories"
else
    echo "📸 Changes detected in images directory or subdirectories"
    
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
