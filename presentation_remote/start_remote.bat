@echo off
title OptiLoad Wireless Presenter Remote
color 0b
echo ================================================================
echo           Starting Wireless Presentation Controller
echo ================================================================
echo.
cd /d "%~dp0"
python server.py
pause
