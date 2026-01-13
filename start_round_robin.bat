@echo off
echo Starting Primary Instance (Port 8317)...
start "Primary Instance (Paid)" /d "C:\visual projects\antihuynti\CLIProxyAPIPlus" CLIProxyAPIPlus.exe

echo Starting Secondary Instance (Port 8318)...
start "Secondary Instance (Free)" /d "C:\visual projects\antihuynti\CLIProxyAPIPlus_Secondary" CLIProxyAPIPlus.exe

echo Starting Load Balancer (Port 8319)...
cd /d "C:\visual projects\antihuynti\CLIProxyAPIPlus"
node lb.js

pause
