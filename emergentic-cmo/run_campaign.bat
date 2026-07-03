@echo off
cd /d "%~dp0"
echo ===================================================
echo   Run Sales Navigator Prospecting Campaign
echo ===================================================
echo.
node orchestrator.js --limit 8 --real --headed
pause
