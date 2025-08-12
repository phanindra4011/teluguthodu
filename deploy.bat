@echo off
chcp 65001 >nul
echo 🚀 Starting deployment process...

REM Check if .env.local exists
if not exist .env.local (
    echo ❌ .env.local file not found!
    echo Please create .env.local with your GEMINI_API_KEY
    echo You can copy from env.example
    pause
    exit /b 1
)

REM Check if GEMINI_API_KEY is set
findstr /C:"GEMINI_API_KEY=" .env.local >nul
if errorlevel 1 (
    echo ❌ GEMINI_API_KEY not found in .env.local
    echo Please set a valid API key
    pause
    exit /b 1
)

findstr /C:"your_gemini_api_key_here" .env.local >nul
if not errorlevel 1 (
    echo ❌ GEMINI_API_KEY not properly set in .env.local
    echo Please set a valid API key
    pause
    exit /b 1
)

echo ✅ Environment variables configured

REM Clean previous builds
echo 🧹 Cleaning previous builds...
call npm run clean

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build the project
echo 🔨 Building project...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    echo.
    echo Choose deployment option:
    echo 1) Vercel (Recommended)
    echo 2) Netlify
    echo 3) Static export only
    echo 4) Exit
    
    set /p choice="Enter your choice (1-4): "
    
    if "%choice%"=="1" (
        echo 🚀 Deploying to Vercel...
        call npm run deploy:vercel
    ) else if "%choice%"=="2" (
        echo 🚀 Deploying to Netlify...
        call npm run deploy:netlify
    ) else if "%choice%"=="3" (
        echo 📁 Creating static export...
        call npm run export
        echo ✅ Static export created in 'out' directory
    ) else if "%choice%"=="4" (
        echo 👋 Exiting...
        pause
        exit /b 0
    ) else (
        echo ❌ Invalid choice
        pause
        exit /b 1
    )
) else (
    echo ❌ Build failed!
    pause
    exit /b 1
)

pause
