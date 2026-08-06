@echo off
echo Agregando cambios...
git add .
echo Creando commit...
set /p mensaje="Introduce el mensaje del commit (presiona enter para usar el por defecto): "
if "%mensaje%"=="" set mensaje="Actualizacion desde script"
git commit -m "%mensaje%"
echo Subiendo a GitHub...
git push
echo ==========================================================
echo Subida exitosa! GitHub Actions ha comenzado el despliegue.
echo Tu aplicacion se actualizara online en unos minutos.
echo ==========================================================
pause
