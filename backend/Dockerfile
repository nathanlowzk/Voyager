FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy code
COPY . .

# Expose port 8000
EXPOSE 5001

# Run with Gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5001", "app:app"]