@echo off
title Status Server Traceability SJA (Port 3001)
echo ====================================================
echo   Pengecekan Status Server - PT. Santos Jaya Abadi
echo ====================================================
echo.

netstat -ano | findstr :3001 | findstr LISTENING >nul
if %errorlevel% equ 0 goto IS_ACTIVE
goto IS_INACTIVE

:IS_ACTIVE
echo [STATUS] SERVER SEDANG AKTIF!
echo - Alamat URL : http://localhost:3001
echo - Port       : 3001 [LISTENING]
echo.
echo Web siap digunakan. Buka http://localhost:3001 di browser Anda.
goto DONE

:IS_INACTIVE
echo [STATUS] SERVER SEDANG MATI / TIDAK AKTIF!
echo - Port 3001 tidak mendeteksi proses yang berjalan.
echo.
echo Cara menyalakan server:
echo - Dobel klik file "start_server.bat" atau ketik "npm start" di terminal.
goto DONE

:DONE
echo.
echo ====================================================
pause
