@echo off
cd /d "C:\visual projects\antihuynti\AntigravityManager"
echo Starting Antigravity Manager...
echo Please wait, opening dashboard...
start http://localhost:8320
node manager.js
pause
