@echo off
cd /d "%~dp0"
title Black Sapphire Systems
echo.
echo  Starting site... (first time may take a few seconds)
echo.
call npm run dev
