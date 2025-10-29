# Script para verificar tipos de TypeScript rápidamente
Write-Host "🔍 Verificando tipos de TypeScript..." -ForegroundColor Cyan

# Ejecutar TypeScript check
npx tsc --noEmit 2>&1 | Select-Object -First 50

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No hay errores de tipos!" -ForegroundColor Green
} else {
    Write-Host "❌ Se encontraron errores de tipos" -ForegroundColor Red
}
