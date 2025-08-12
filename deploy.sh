#!/bin/bash

# Telugu Thodu Deployment Script
echo "🚀 Starting deployment process..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Please create .env.local with your GEMINI_API_KEY"
    echo "You can copy from env.example"
    exit 1
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY=" .env.local || grep -q "your_gemini_api_key_here" .env.local; then
    echo "❌ GEMINI_API_KEY not properly set in .env.local"
    echo "Please set a valid API key"
    exit 1
fi

echo "✅ Environment variables configured"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Ask for deployment preference
    echo ""
    echo "Choose deployment option:"
    echo "1) Vercel (Recommended)"
    echo "2) Netlify"
    echo "3) Static export only"
    echo "4) Exit"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            echo "🚀 Deploying to Vercel..."
            npm run deploy:vercel
            ;;
        2)
            echo "🚀 Deploying to Netlify..."
            npm run deploy:netlify
            ;;
        3)
            echo "📁 Creating static export..."
            npm run export
            echo "✅ Static export created in 'out' directory"
            ;;
        4)
            echo "👋 Exiting..."
            exit 0
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
else
    echo "❌ Build failed!"
    exit 1
fi
