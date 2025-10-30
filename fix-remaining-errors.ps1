# Script para corregir los 2 errores restantes

Write-Host "Corrigiendo errores restantes..." -ForegroundColor Cyan

# Error 1: AuditListing - cambiar 'audit' a 'initialData'
$file1 = "src/components/audits/AuditListing.tsx"
$content1 = Get-Content $file1 -Raw
$content1 = $content1 -replace 'audit=\{selectedAudit \|\| undefined\}', 'initialData={selectedAudit || undefined}'
Set-Content $file1 $content1 -NoNewline
Write-Host "Corregido AuditListing.tsx - cambio de audit a initialData" -ForegroundColor Green

# Error 2: FindingListing - cambiar onCancel a onClose
$file2 = "src/components/findings/FindingListing.tsx"
$content2 = Get-Content $file2 -Raw
$content2 = $content2 -replace 'onCancel=\{handleFormCancel\}', 'onClose={handleFormCancel}'
Set-Content $file2 $content2 -NoNewline
Write-Host "Corregido FindingListing.tsx - cambio de onCancel a onClose" -ForegroundColor Green

Write-Host ""
Write-Host "Errores corregidos. Ejecuta: npm run type-check" -ForegroundColor Yellow
