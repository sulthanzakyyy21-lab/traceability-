@echo off
title Traceability SJA Server (Port 3001)
cd /d "%~dp0"
cls
echo ====================================================
echo   Traceability System - PT. Santos Jaya Abadi
echo   Alamat Web : http://localhost:3001
echo ====================================================
echo.

netstat -ano | findstr :3001 | findstr LISTENING >nul
if %errorlevel% equ 0 goto ALREADY_RUNNING
goto START_NEW

:ALREADY_RUNNING
echo [INFO] Server SUDAH AKTIF di port 3001.
echo Membuka browser ke http://localhost:3001 ...
start http://localhost:3001
echo.
echo Web telah dibuka di browser Anda.
echo (Jendela ini boleh ditutup, server tetap aktif di background)
echo.
pause
exit /b 0

:START_NEW
echo [INFO] Menyalakan server pada port 3001...
echo Membuka browser otomatis dalam 2 detik...
start "" cmd /c "timeout /t 2 >nul & start http://localhost:3001"
echo.
echo ====================================================
echo   Server sedang berjalan...
echo   (Biarkan jendela ini tetap terbuka selama memakai web)
echo ====================================================
echo.
set PORT=3001
node server/index.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server berhenti dengan error.
    echo Pastikan Laragon MySQL sudah aktif (Start All).
    echo.
    pause
)
