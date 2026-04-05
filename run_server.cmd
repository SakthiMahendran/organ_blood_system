@echo off
setlocal
title Organ Blood System - Running Servers
set ROOT=%~dp0
set BACKEND=%ROOT%backend_django
set FRONTEND=%ROOT%web_react
set VENV=%BACKEND%\.venv

echo.
echo ==========================================
echo   Organ Blood System - Starting Servers
echo ==========================================
echo.

REM -----------------------------------------------
REM  Pre-flight checks
REM -----------------------------------------------
if not exist "%VENV%" (
    echo  ERROR: Virtual environment not found.
    echo  Please run setup_server.cmd first.
    echo.
    pause
    exit /b 1
)

if not exist "%FRONTEND%\node_modules" (
    echo  ERROR: node_modules not found.
    echo  Please run setup_server.cmd first.
    echo.
    pause
    exit /b 1
)

REM -----------------------------------------------
REM  Free ports 8000 and 5173 if already in use
REM -----------------------------------------------
echo  Checking for processes on ports 8000 and 5173...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":8000 " 2^>nul') do (
    if not "%%p"=="0" taskkill /F /PID %%p >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":5173 " 2^>nul') do (
    if not "%%p"=="0" taskkill /F /PID %%p >nul 2>&1
)
echo  Ports cleared.
echo.

REM -----------------------------------------------
REM  Start Django backend
REM -----------------------------------------------
echo  Starting Backend  (Django)  ...
start "Django Backend" cmd /k "title Django Backend && cd /d "%BACKEND%" && call .venv\Scripts\activate.bat && python manage.py runserver"

timeout /t 3 /nobreak >nul

REM -----------------------------------------------
REM  Start React / Vite frontend
REM -----------------------------------------------
echo  Starting Frontend (React/Vite) ...
start "React Frontend" cmd /k "title React Frontend && cd /d "%FRONTEND%" && npm run dev"

echo.
echo  Servers are starting in separate windows:
echo.
echo    Backend   -^>  http://127.0.0.1:8000
echo    Frontend  -^>  http://localhost:5173
echo.
echo  Close those windows to stop the servers.
echo.
endlocal
