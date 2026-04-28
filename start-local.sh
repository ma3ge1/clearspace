#!/bin/zsh

set -e

cd "$(dirname "$0")"

echo "Installiere Abhaengigkeiten falls noetig..."
npm install
echo ""
echo "Mindfog startet lokal auf:"
echo "http://localhost:4173"
echo ""
echo "Zum Beenden: Ctrl+C"
echo ""

npm run dev
