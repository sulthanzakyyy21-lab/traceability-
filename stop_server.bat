@echo off
title Hentikan Server Traceability SJA (Port 3001)
echo Menghentikan proses server Traceability pada port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    echo Berhasil menghentikan proses PID: %%a
)
echo.
echo Server port 3001 telah dinonaktifkan.
timeout /t 2 >nul
