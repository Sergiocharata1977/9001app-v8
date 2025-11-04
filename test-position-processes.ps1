# Script para probar la asignación de procesos a puestos

Write-Host "=== Probando Asignación de Procesos a Puestos ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que existan definiciones de procesos
Write-Host "1. Verificando definiciones de procesos..." -ForegroundColor Yellow
$processes = Invoke-RestMethod -Uri "http://localhost:3000/api/process-definitions" -Method Get
Write-Host "   Procesos encontrados: $($processes.Count)" -ForegroundColor Green
$processes | ForEach-Object {
    Write-Host "   - $($_.codigo): $($_.nombre)" -ForegroundColor Gray
}
Write-Host ""

# 2. Verificar que existan puestos
Write-Host "2. Verificando puestos..." -ForegroundColor Yellow
$positions = Invoke-RestMethod -Uri "http://localhost:3000/api/positions" -Method Get
Write-Host "   Puestos encontrados: $($positions.Count)" -ForegroundColor Green
$positions | ForEach-Object {
    Write-Host "   - $($_.nombre) (ID: $($_.id))" -ForegroundColor Gray
}
Write-Host ""

# 3. Instrucciones
Write-Host "=== Instrucciones ===" -ForegroundColor Cyan
Write-Host "1. Ve a: http://localhost:3000/dashboard/rrhh/positions" -ForegroundColor White
Write-Host "2. Haz clic en cualquier puesto" -ForegroundColor White
Write-Host "3. En la sección 'Procesos Asignados', haz clic en 'Editar Procesos'" -ForegroundColor White
Write-Host "4. Selecciona procesos del dropdown" -ForegroundColor White
Write-Host "5. Haz clic en 'Guardar'" -ForegroundColor White
Write-Host ""
Write-Host "Si el dropdown está vacío, ejecuta primero:" -ForegroundColor Yellow
Write-Host "  .\seed-process-definitions.ps1" -ForegroundColor Cyan
