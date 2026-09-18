#!/bin/bash
set -e
cd "$(dirname "$0")/backend"
if [ ! -f .env ]; then
  echo "ERROR: .env file missing. Copy .env.example and add your GEMINI_API_KEY"
  exit 1
fi
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
