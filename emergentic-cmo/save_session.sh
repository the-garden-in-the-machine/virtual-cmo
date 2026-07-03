#!/bin/bash
cd "$(dirname "$0")"
echo "==================================================="
echo "  Capture LinkedIn Session State"
echo "==================================================="
echo ""
node Tools/Scrapers/Playwright/save-session.js
