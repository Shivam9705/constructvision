#!/bin/bash
# start.sh — Production startup script for Render
# Runs Alembic migrations first, then starts the server.
# This ensures DB schema is always up to date on every deploy.

set -e  # Exit on any error

echo "🔧 Running database migrations..."
alembic upgrade head

echo "🚀 Starting ConstructVision AI API..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --workers 2 \
  --log-level info \
  --access-log
