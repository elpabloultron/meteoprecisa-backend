# Multi-Stage Dockerfile para MeteoPrecisa Chile (Cloud Run + React)

# ----------------------------------------------------------------------
# Etapa 1: Compilar Frontend React (Vite)
# ----------------------------------------------------------------------
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# ----------------------------------------------------------------------
# Etapa 2: Servidor Python FastAPI (Producción)
# ----------------------------------------------------------------------
FROM python:3.11-slim AS production

WORKDIR /app

# Dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código del proyecto
COPY . .

# Copiar la build del frontend compilada a frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Puerto dinámico de Google Cloud Run
ENV PORT=8000
EXPOSE 8000

# Servidor ASGI FastAPI Uvicorn
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
