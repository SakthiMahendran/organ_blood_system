@echo off
setlocal
title Organ Blood System - Setup
set ROOT=%~dp0
set BACKEND=%ROOT%backend_django
set FRONTEND=%ROOT%web_react
set VENV=%BACKEND%\.venv

echo.
echo ==========================================
echo   Organ Blood System - Environment Setup
echo ==========================================
echo.

REM -----------------------------------------------
REM  STEP 1: Check Python
REM -----------------------------------------------
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ERROR: Python is not installed or not in PATH.
    echo  Install Python from https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version') do echo   Found: %%v
echo.

REM -----------------------------------------------
REM  STEP 2: Create .venv if missing
REM -----------------------------------------------
echo [2/5] Checking virtual environment...
if not exist "%VENV%" (
    echo   .venv not found. Creating virtual environment...
    python -m venv "%VENV%"
    if errorlevel 1 (
        echo.
        echo  ERROR: Failed to create virtual environment.
        echo.
        pause
        exit /b 1
    )
    echo   .venv created successfully.
) else (
    echo   .venv already exists. Skipping.
)
echo.

REM -----------------------------------------------
REM  STEP 3: Install Python dependencies
REM -----------------------------------------------
echo [3/5] Installing Python dependencies...
call "%VENV%\Scripts\activate.bat"
pip install -r "%BACKEND%\requirements.txt" --quiet
if errorlevel 1 (
    echo.
    echo  ERROR: pip install failed. Check requirements.txt and your internet connection.
    echo.
    pause
    exit /b 1
)
echo   Python dependencies installed.
echo.

REM -----------------------------------------------
REM  STEP 4: Check Node.js / npm
REM -----------------------------------------------
echo [4/5] Checking Node.js / npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ERROR: Node.js / npm is not installed or not in PATH.
    echo  Install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo   Node: %%v
for /f "tokens=*" %%v in ('npm --version') do echo   npm:  %%v
echo.

REM -----------------------------------------------
REM  STEP 5: Install frontend deps and build
REM -----------------------------------------------
echo [5/5] Setting up frontend (npm install + build)...
cd /d "%FRONTEND%"

echo   Running npm install...
npm install
if errorlevel 1 (
    echo.
    echo  ERROR: npm install failed.
    echo.
    pause
    exit /b 1
)

echo   Running npm run build...
npm run build
if errorlevel 1 (
    echo.
    echo  ERROR: npm run build failed.
    echo.
    pause
    exit /b 1
)
echo   Frontend built successfully.
echo.

REM -----------------------------------------------
REM  Done
REM -----------------------------------------------
echo ==========================================
echo   Setup complete! All checks passed.
echo   Run run_server.cmd to start the servers.
echo ==========================================
echo.
pause
endlocal
