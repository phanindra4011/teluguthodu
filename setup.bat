@echo off
chcp 65001 >nul
echo 🎯 Telugu Thodu Setup Script
echo ================================

echo.
echo 📋 Checking prerequisites...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js found
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed!
    echo Please install npm or use a Node.js installer that includes npm
    pause
    exit /b 1
) else (
    echo ✅ npm found
)

echo.
echo 📦 Installing dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

echo.
echo 🔑 Setting up environment variables...

REM Check if .env.local already exists
if exist .env.local (
    echo ⚠️  .env.local already exists
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i "%overwrite%"=="y" (
        goto create_env
    ) else (
        echo Keeping existing .env.local
        goto continue_setup
    )
) else (
    goto create_env
)

:create_env
echo Creating .env.local file...
copy env.example .env.local >nul
echo ✅ .env.local created from template

echo.
echo ⚠️  IMPORTANT: You need to edit .env.local and add your GEMINI_API_KEY
echo   1. Get an API key from https://aistudio.google.com/app/apikey
echo   2. Open .env.local in a text editor
echo   3. Replace 'your_gemini_api_key_here' with your actual API key
echo.

:continue_setup
echo 🚀 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env.local with your GEMINI_API_KEY
echo 2. Run 'npm run dev' to start development server
echo 3. Run 'deploy.bat' when ready to deploy
echo.
echo Your app will be available at: http://localhost:9003
echo.

set /p start_dev="Would you like to start the development server now? (y/n): "
if /i "%start_dev%"=="y" (
    echo 🚀 Starting development server...
    call npm run dev
) else (
    echo 👋 Setup complete! Run 'npm run dev' when ready
)

pause
