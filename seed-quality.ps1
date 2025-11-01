# Script para crear registros de ejemplo en módulos de calidad

Write-Host "🌱 Creando registros de ejemplo en módulos de calidad..." -ForegroundColor Cyan
Write-Host ""

# Ejecutar el script de seed usando tsx
npx tsx src/scripts/seed-quality-modules.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Registros creados exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Abre estas páginas para ver los registros:" -ForegroundColor Yellow
    Write-Host "   - http://localhost:3000/politicas"
    Write-Host "   - http://localhost:3000/reuniones-trabajo"
    Write-Host "   - http://localhost:3000/analisis-foda"
} else {
    Write-Host ""
    Write-Host "❌ Error al crear registros" -ForegroundColor Red
}
