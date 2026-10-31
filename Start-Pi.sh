#!/bin/sh
set -eu
cd "$(dirname "$0")"
node scripts/serve.mjs &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT INT TERM
sleep 2
if command -v chromium >/dev/null 2>&1; then
  chromium --kiosk --no-first-run --disable-session-crashed-bubble http://localhost:3000
elif command -v chromium-browser >/dev/null 2>&1; then
  chromium-browser --kiosk --no-first-run --disable-session-crashed-bubble http://localhost:3000
else
  echo 'Chromium fehlt. Bitte installieren oder http://localhost:3000 im Browser öffnen.'
  wait "$server_pid"
fi
