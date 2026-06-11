FROM python:3.12-slim

WORKDIR /app

# System deps for psycopg2 + Pillow
RUN apt-get update && apt-get install -y \
    libpq-dev gcc libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (better Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create runtime dirs
RUN mkdir -p uploads exports

# Make start script executable
RUN chmod +x start.sh

EXPOSE 8000

# Use start.sh so migrations always run before the server
CMD ["./start.sh"]
