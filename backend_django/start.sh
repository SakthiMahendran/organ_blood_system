#!/bin/bash
set -e

echo "==> Running migrations..."
python manage.py migrate --noinput

echo "==> Seeding demo data (skipped if already exists)..."
python manage.py seed_demo

echo "==> Starting Gunicorn on port ${PORT:-7860}..."
exec gunicorn config.wsgi:application \
    --bind "0.0.0.0:${PORT:-7860}" \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
