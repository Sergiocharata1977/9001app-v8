# Script para configurar el frontend de Capacitaciones y Evaluaciones

Write-Host "=== Configurando Frontend de Capacitaciones y Evaluaciones ===" -ForegroundColor Cyan
Write-Host ""

# 1. Instalar date-fns
Write-Host "1. Instalando date-fns..." -ForegroundColor Yellow
npm install date-fns
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] date-fns instalado correctamente" -ForegroundColor Green
} else {
    Write-Host "   [ERROR] Error al instalar date-fns" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Verificar archivos creados
Write-Host "2. Verificando archivos creados..." -ForegroundColor Yellow

$archivos = @(
    "src/components/rrhh/TrainingCard.tsx",
    "src/components/rrhh/TrainingForm.tsx",
    "src/components/rrhh/TrainingListing.tsx",
    "src/components/rrhh/EvaluationCard.tsx",
    "src/components/rrhh/EvaluationForm.tsx",
    "src/components/rrhh/EvaluationListing.tsx",
    "src/app/(dashboard)/dashboard/rrhh/trainings/page.tsx",
    "src/app/(dashboard)/dashboard/rrhh/evaluations/page.tsx"
)

$todosExisten = $true
foreach ($archivo in $archivos) {
    if (Test-Path $archivo) {
        Write-Host "   [OK] $archivo" -ForegroundColor Green
    } else {
        Write-Host "   [X] $archivo NO EXISTE" -ForegroundColor Red
        $todosExisten = $false
    }
}
Write-Host ""

if (-not $todosExisten) {
    Write-Host "Algunos archivos no existen. Verifica la creacion de componentes." -ForegroundColor Red
    exit 1
}

# 3. Verificar tipos en rrhh.ts
Write-Host "3. Verificando tipos en rrhh.ts..." -ForegroundColor Yellow
$contenidoRrhh = Get-Content "src/types/rrhh.ts" -Raw
if ($contenidoRrhh -match "TrainingFilters" -and $contenidoRrhh -match "PaginatedResponse") {
    Write-Host "   [OK] Tipos agregados correctamente" -ForegroundColor Green
} else {
    Write-Host "   [X] Faltan tipos en rrhh.ts" -ForegroundColor Red
    Write-Host "   Ejecuta: Get-Content INSTRUCCIONES_FRONTEND_CAPACITACIONES.md" -ForegroundColor Yellow
}
Write-Host ""

# 4. Verificar CompetenceSelector
Write-Host "4. Verificando CompetenceSelector..." -ForegroundColor Yellow
if (Test-Path "src/components/rrhh/CompetenceSelector.tsx") {
    Write-Host "   [OK] CompetenceSelector existe" -ForegroundColor Green
} else {
    Write-Host "   [!] CompetenceSelector NO existe" -ForegroundColor Yellow
    Write-Host "   El formulario de capacitaciones puede tener errores" -ForegroundColor Yellow
    Write-Host "   Considera crear un selector simple o comentar esa seccion" -ForegroundColor Yellow
}
Write-Host ""

# 5. Resumen
Write-Host "=== RESUMEN ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Paginas disponibles:" -ForegroundColor White
Write-Host "  - Capacitaciones: http://localhost:3000/dashboard/rrhh/trainings" -ForegroundColor Cyan
Write-Host "  - Evaluaciones:   http://localhost:3000/dashboard/rrhh/evaluations" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor White
Write-Host "  1. Ejecuta: npm run dev" -ForegroundColor Yellow
Write-Host "  2. Navega a las paginas de arriba" -ForegroundColor Yellow
Write-Host "  3. Prueba crear, editar y eliminar registros" -ForegroundColor Yellow
Write-Host ""
Write-Host "Si hay errores:" -ForegroundColor White
Write-Host "  - Lee: INSTRUCCIONES_FRONTEND_CAPACITACIONES.md" -ForegroundColor Yellow
Write-Host "  - Verifica la consola del navegador (F12)" -ForegroundColor Yellow
Write-Host "  - Verifica la terminal del servidor" -ForegroundColor Yellow
Write-Host ""
Write-Host "[OK] Configuracion completada!" -ForegroundColor Green
