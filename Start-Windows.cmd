@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Bitte Node.js 22 oder neuer installieren und erneut starten.
  pause
  exit /b 1
)
echo KVV Weichenheld startet. Im Browser http://localhost:3000 oeffnen.
echo Dieses Fenster zum Spielen offen lassen. Beenden mit Strg+C.
node scripts/serve.mjs
