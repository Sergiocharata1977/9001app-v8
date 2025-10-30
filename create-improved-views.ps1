# Script para crear las vistas mejoradas de Auditorías, Hallazgos y Acciones

Write-Host "Creando componentes de vistas mejoradas..." -ForegroundColor Cyan

# Crear directorio temporal
$tempDir = "temp_components"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

Write-Host "Archivos creados en carpeta temporal: $tempDir" -ForegroundColor Green
Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Guarda todos los archivos abiertos en tu editor" -ForegroundColor Yellow
Write-Host "2. Luego ejecuta: ./apply-improved-views.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Los componentes incluyen:" -ForegroundColor Cyan
Write-Host "  - AuditListing.tsx (Grid, List, Kanban)" -ForegroundColor White
Write-Host "  - AuditKanban.tsx" -ForegroundColor White
Write-Host "  - FindingListing.tsx (Grid, List, Kanban)" -ForegroundColor White
Write-Host "  - FindingKanban.tsx" -ForegroundColor White
Write-Host "  - ActionListing.tsx (Grid, List, Kanban)" -ForegroundColor White
Write-Host "  - ActionKanban.tsx" -ForegroundColor White
