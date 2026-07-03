@echo off
cd /d "%~dp0"
echo ===================================================
echo   Emergentic Sales Navigator Prospector Setup
echo ===================================================
echo.

:: Detect if running in Google Drive, OneDrive, Dropbox, etc.
echo %cd% | findstr /I /C:"Google Drive" /C:"OneDrive" /C:"Dropbox" /C:"iCloud" >nul
set is_cloud_sync=%errorlevel%
if "%cd:~0,2%"=="G:" set is_cloud_sync=0
if "%cd:~0,2%"=="g:" set is_cloud_sync=0

if %is_cloud_sync% equ 0 (
    echo [WARNING] Running from a cloud-synchronized folder or drive:
    echo           "%cd%"
    echo.
    echo NPM installations inside Google Drive, OneDrive, or Dropbox often fail
    echo due to sync locks. If the installation fails, please move this folder
    echo to a local, unsynced folder (like C:\emergentic or local Documents).
    echo.
)

echo [1/2] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ===================================================
    echo ERROR: Failed to install npm dependencies!
    echo ===================================================
    echo This is often caused by running inside Google Drive,
    echo OneDrive, or a synced folder (locks on node_modules).
    echo.
    echo TO RESOLVE:
    echo 1. Move the unzipped "emergentic" folder to a local,
    echo    unsynced path (e.g., C:\emergentic or local Documents).
    echo 2. Make sure Node.js (v18+) is installed on your computer.
    echo 3. Run setup.bat again.
    echo ===================================================
    pause
    exit /b %errorlevel%
)
echo.
echo [2/2] Installing Playwright Chromium browser...
call npx playwright install chromium
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install Playwright browser.
    pause
    exit /b %errorlevel%
)
echo.
echo ===================================================
echo   Setup completed successfully!
echo   You can now run "save_session.bat" to log in.
echo ===================================================
pause
