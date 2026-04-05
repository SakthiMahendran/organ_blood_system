@echo off
setlocal
title Organ Blood System - Fix / Reset DB
set ROOT=%~dp0
set BACKEND=%ROOT%backend_django
set VENV=%BACKEND%\.venv

echo.
echo ==========================================
echo   Organ Blood System - Fix ^& Reseed DB
echo ==========================================
echo.

REM -----------------------------------------------
REM  Check .venv exists
REM -----------------------------------------------
if not exist "%VENV%" (
    echo  ERROR: Virtual environment not found.
    echo  Please run setup_server.cmd first.
    echo.
    pause
    exit /b 1
)

REM -----------------------------------------------
REM  Activate .venv
REM -----------------------------------------------
call "%VENV%\Scripts\activate.bat"
cd /d "%BACKEND%"

REM -----------------------------------------------
REM  Run migrations
REM -----------------------------------------------
echo [1/2] Running migrations...
python manage.py migrate
if errorlevel 1 (
    echo.
    echo  ERROR: Migrations failed.
    echo.
    pause
    exit /b 1
)
echo   Migrations done.
echo.

REM -----------------------------------------------
REM  Seed demo data
REM -----------------------------------------------
echo [2/2] Seeding demo data...
python manage.py seed_demo
if errorlevel 1 (
    echo.
    echo  ERROR: Seeding failed.
    echo.
    pause
    exit /b 1
)
echo.

REM -----------------------------------------------
REM  Done
REM -----------------------------------------------
echo ==========================================
echo   Done! Login with any of these accounts:
echo.
echo   admin@demo.com    / Demo1234!  (Admin)
echo   donor@demo.com    / Demo1234!  (Donor)
echo   hospital@demo.com / Demo1234!  (Hospital)
echo   acceptor@demo.com / Demo1234!  (Acceptor)
echo ==========================================
echo.
pause
endlocal
