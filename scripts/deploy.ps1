# Script de Despliegue Manual PowerShell para Windows
# MeteoPrecisa Chile (Región: southamerica-west1 Santiago)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando proceso de despliegue para MeteoPrecisa Chile..." -ForegroundColor Green

$PROJECT_ID = "gen-lang-client-0695066948"
$REGION = "southamerica-west1"
$SERVICE_NAME = "meteoprecisa-app"

# 1. Compilar Frontend React
Write-Host "📦 [1/3] Compilando la aplicación React (frontend)..." -ForegroundColor Cyan
Set-Location frontend
cmd /c "npm install"
cmd /c "npm run build"
Set-Location ..

# 2. Desplegar Backend a Google Cloud Run
Write-Host "☁️ [2/3] Desplegando backend FastAPI a Google Cloud Run ($REGION)..." -ForegroundColor Cyan
gcloud run deploy $SERVICE_NAME `
  --source . `
  --region $REGION `
  --project $PROJECT_ID `
  --allow-unauthenticated

# 3. Desplegar Frontend a Firebase Hosting
Write-Host "🔥 [3/3] Desplegando assets compilados a Firebase Hosting..." -ForegroundColor Cyan
firebase deploy --only hosting --project $PROJECT_ID

Write-Host "🎉 ¡Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host "   • Aplicación Web: https://meteoprecisachile.web.app/app/"
Write-Host "   • Swagger API Docs: https://meteoprecisachile.web.app/docs"
