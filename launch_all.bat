@echo off
echo Starting Antigravity System...
REM Launch Manager in a separate window
start "Antigravity Manager" cmd /c "start_manager.bat"

echo Waiting for services to initialize...
timeout /t 8

echo Starting Aider...
call start_aider_antigravity.bat
