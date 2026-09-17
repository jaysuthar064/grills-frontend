@echo off
REM Double-click launcher for the local Grill On the Green WordPress backend.
title Grill On the Green - WordPress
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-wordpress.ps1" %*
if errorlevel 1 pause
