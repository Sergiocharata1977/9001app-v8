# Script para migrar definiciones de procesos existentes
# Agrega el campo 'responsable' a todas las definiciones

Write-Host "Iniciando migración de definiciones de procesos..." -ForegroundColor Cyan

# Ejecutar el script de migración
npm run migrate:process-definitions

Write-Host "`nMigración completada!" -ForegroundColor Green
