#!/bin/bash

echo "🎯 Telugu Thodu Setup Script"
echo "================================"

echo ""
echo "📋 Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
else
    echo "✅ Node.js found: $(node --version)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    echo "Please install npm or use a Node.js installer that includes npm"
    exit 1
else
    echo "✅ npm found: $(npm --version)"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

echo ""
echo "🔑 Setting up environment variables..."

# Check if .env.local already exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists"
    read -p "Do you want to overwrite it? (y/n): " overwrite
    if [[ $overwrite =~ ^[Yy]$ ]]; then
        cp env.example .env.local
        echo "✅ .env.local created from template"
    else
        echo "Keeping existing .env.local"
    fi
else
    cp env.example .env.local
    echo "✅ .env.local created from template"
fi

echo ""
echo "⚠️  IMPORTANT: You need to edit .env.local and add your GEMINI_API_KEY"
echo "  1. Get an API key from https://aistudio.google.com/app/apikey"
echo "  2. Open .env.local in a text editor"
echo "  3. Replace 'your_gemini_api_key_here' with your actual API key"
echo ""

echo "🚀 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your GEMINI_API_KEY"
echo "2. Run 'npm run dev' to start development server"
echo "3. Run './deploy.sh' when ready to deploy"
echo ""
echo "Your app will be available at: http://localhost:9003"
echo ""

read -p "Would you like to start the development server now? (y/n): " start_dev
if [[ $start_dev =~ ^[Yy]$ ]]; then
    echo "🚀 Starting development server..."
    npm run dev
else
    echo "👋 Setup complete! Run 'npm run dev' when ready"
fi
