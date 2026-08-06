param (
    [string]$Mensaje = "Refactorización y mejoras arquitectónicas (Frontend + Backend)"
)

Write-Host "Agregando cambios..." -ForegroundColor Cyan
git add .

Write-Host "Creando commit..." -ForegroundColor Cyan
git commit -m $Mensaje

Write-Host "Subiendo a GitHub..." -ForegroundColor Cyan
git push

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "¡Subida exitosa! GitHub Actions ha comenzado el despliegue." -ForegroundColor Green
Write-Host "Tu aplicación se actualizará online en unos minutos." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
