#!/bin/zsh

set -e

cd "$(dirname "$0")"

if [ -z "$1" ]; then
  echo "Bitte gib eine Commit-Message an."
  echo 'Beispiel: ./publish.sh "Button-Text verbessert"'
  exit 1
fi

git add .
git commit -m "$1"
git push
