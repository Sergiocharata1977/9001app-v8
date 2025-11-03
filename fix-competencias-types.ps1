# Script para arreglar errores de tipos después de cambios en Competencias

Write-Host "Arreglando errores de TypeScript en módulo de Competencias..." -ForegroundColor Cyan

# Este script documenta los cambios necesarios
# Ejecutar manualmente los cambios críticos

Write-Host "`n=== CAMBIOS NECESARIOS ===" -ForegroundColor Yellow

Write-Host "`n1. Rutas API con params (Next.js 15):" -ForegroundColor Green
Write-Host "   - src/app/api/rrhh/competencias/by-categoria/[categoria]/route.ts"
Write-Host "   - src/app/api/rrhh/competencias/by-puesto/[puestoId]/route.ts"
Write-Host "   - src/app/api/rrhh/evaluaciones/gaps/[personnelId]/route.ts"
Write-Host "   - src/app/api/rrhh/evaluaciones/history/[personnelId]/[competenceId]/route.ts"
Write-Host "   - src/app/api/rrhh/evaluaciones/recommend-trainings/[personnelId]/route.ts"
Write-Host "   - src/app/api/rrhh/puestos/[id]/competencias/[competenciaId]/route.ts"
Write-Host "   - src/app/api/rrhh/puestos/[id]/frecuencia-evaluacion/route.ts"
Write-Host "   - src/app/api/rrhh/trainings/[id]/competencias/route.ts"
Write-Host "   - src/app/api/rrhh/trainings/[id]/post-evaluation/route.ts"
Write-Host "   - src/app/api/rrhh/trainings/by-competence/[competenceId]/route.ts"
Write-Host "   Cambiar: { params }: { params: { id: string } }"
Write-Host "   Por: { params }: { params: Promise<{ id: string }> }"
Write-Host "   Y agregar: const { id } = await params;"

Write-Host "`n2. Componentes con nivelRequerido:" -ForegroundColor Green
Write-Host "   - src/components/rrhh/CompetenceCard.tsx (línea 80)"
Write-Host "   - src/components/rrhh/CompetenceSelector.tsx (línea 181)"
Write-Host "   - src/components/rrhh/PositionCompetencesSection.tsx (líneas 252, 289)"
Write-Host "   - src/components/rrhh/TrainingCompetencesList.tsx (línea 134)"
Write-Host "   Eliminar referencias a competence.nivelRequerido"

Write-Host "`n3. Servicios con organization_id:" -ForegroundColor Green
Write-Host "   - src/services/rrhh/CompetenceService.ts (líneas 100, 136)"
Write-Host "   Eliminar filtros por organization_id"

Write-Host "`n4. Tipos de formularios desactualizados:" -ForegroundColor Green
Write-Host "   - PositionFormData necesita: competenciasRequeridas, frecuenciaEvaluacion, nivel"
Write-Host "   - PersonnelFormData necesita: puestoId, competenciasActuales, etc."

Write-Host "`n=== DECISIÓN ===" -ForegroundColor Yellow
Write-Host "Opciones:"
Write-Host "A) Arreglar SOLO los errores críticos (params + nivelRequerido) - 30 min"
Write-Host "B) Arreglar TODOS los errores de tipos - 2 horas"
Write-Host "C) Comentar código problemático temporalmente - 10 min"
Write-Host "`nRecomendación: Opción A para subir rápido" -ForegroundColor Cyan
