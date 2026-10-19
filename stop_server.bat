@echo off
title Hentikan Server Traceability SJA (Port 3001)
echo ====================================================
echo   Menghentikan Server Traceability (Port 3001)
echo ====================================================
echo.

netstat -ano | findstr :3001 | findstr LISTENING >nul
if %errorlevel% neq 0 goto ALREADY_STOPPED

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
    echo Berhasil menghentikan proses server (PID: %%a).
)
echo.
echo [SUKSES] Server pada port 3001 telah berhasil dimatikan.
goto DONE

:ALREADY_STOPPED
echo [INFO] Server memang sedang TIDAK AKTIF (sudah mati).
goto DONE

:DONE
echo.
echo ====================================================
pause
