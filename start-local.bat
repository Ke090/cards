@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 22.13+ or 24 LTS from https://nodejs.org/
  pause
  exit /b 1
)
node "%~dp0scripts\start-local.mjs" %*
if errorlevel 1 (
  echo.
  echo Startup failed. Check the error above. Port 5173 may already be in use.
  pause
  exit /b 1
)
endlocal
