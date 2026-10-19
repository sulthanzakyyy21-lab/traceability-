@echo off
title Traceability SJA Server (Port 3001)
cd /d "%~dp0"
echo ====================================================
echo   Traceability System - PT. Santos Jaya Abadi
echo   Server berjalan di: http://localhost:3001
echo   (Tutup jendela ini atau tekan Ctrl+C untuk mematikan)
echo ====================================================
echo.
set PORT=3001
node server/index.js
pause
