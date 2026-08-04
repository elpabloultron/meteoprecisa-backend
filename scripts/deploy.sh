#!/bin/bash
# Script de Despliegue Manual a Google Cloud Run & Firebase Hosting
# MeteoPrecisa Chile (Región: southamerica-west1 Santiago)

set -e

echo "🚀 Iniciando proceso de despliegue para MeteoPrecisa Chile..."

PROJECT_ID="gen-lang-client-0695066948"
REGION="southamerica-west1"
SERVICE_NAME="meteoprecisa-app"

# 1. Compilar Frontend React
echo "📦 [1/3] Compilando la aplicación React (frontend)..."
cd frontend
npm install
npm run build
cd ..

# 2. Desplegar Backend a Google Cloud Run
echo "☁️ [2/3] Desplegando backend FastAPI a Google Cloud Run ($REGION)..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated

# 3. Desplegar Frontend a Firebase Hosting
echo "🔥 [3/3] Desplegando assets compilados a Firebase Hosting..."
firebase deploy --only hosting --project $PROJECT_ID

echo "🎉 ¡Despliegue completado exitosamente!"
echo "   • Aplicación Web: https://meteoprecisachile.web.app/app/"
echo "   • Swagger API Docs: https://meteoprecisachile.web.app/docs"
