FROM python:3.11-slim

# HF Spaces runs on port 7860
ENV PORT=7860 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install OS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App source
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Create data directory for SQLite persistence (HF Spaces /data is persisted if enabled)
RUN mkdir -p /data

EXPOSE 7860

COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
