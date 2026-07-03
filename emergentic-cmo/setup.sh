#!/bin/bash
cd "$(dirname "$0")"
echo "==================================================="
echo "  Emergentic Sales Navigator Prospector Setup"
echo "==================================================="
echo ""

# Detect cloud-sync folders
if [[ "$PWD" == *"/Google Drive"* || "$PWD" == *"/CloudStorage/"* || "$PWD" == *"/OneDrive"* || "$PWD" == *"/Dropbox"* || "$PWD" == *"/Library/Mobile Documents/"* ]]; then
    echo "[WARNING] Running from a cloud-synchronized folder:"
    echo "          $PWD"
    echo ""
    echo "NPM installations inside Google Drive, OneDrive, or iCloud often fail"
    echo "due to syncing file locks. If setup fails, please move this folder"
    echo "to a local directory (e.g., /Users/$(whoami)/Desktop/emergentic)."
    echo ""
fi

echo "[1/2] Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo "==================================================="
    echo "ERROR: Failed to install npm dependencies!"
    echo "==================================================="
    echo "This is often caused by file-locking in cloud-sync folders."
    echo ""
    echo "TO RESOLVE:"
    echo "1. Move the 'emergentic' folder to a local directory"
    echo "   (e.g., your local Desktop or Documents folder)."
    echo "2. Make sure Node.js is installed on your computer."
    echo "3. Run ./setup.sh again."
    echo "==================================================="
    exit 1
fi
echo ""
echo "[2/2] Installing Playwright Chromium browser..."
npx playwright install chromium
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Playwright browser."
    exit 1
fi
echo ""
echo "==================================================="
echo "  Setup completed successfully!"
echo "  You can now run './save_session.sh' to log in."
echo "==================================================="
chmod +x save_session.sh run_campaign.sh 2>/dev/null
