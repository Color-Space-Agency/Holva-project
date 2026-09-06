@echo off
title Holva Factory CRM - Local Server
cd /d "%~dp0"
echo ===================================================
echo       HOLVA FACTORY CRM - LOCAL RUNNER
echo ===================================================
echo Server ishga tushirilmoqda: http://localhost:3000
echo Brauzer avtomatik ochiladi...
echo.

timeout /t 3 /nobreak >nul
start "" http://localhost:3000

call npm run dev
pause
