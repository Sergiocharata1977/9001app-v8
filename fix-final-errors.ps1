# Script final para corregir los últimos 2 errores

Write-Host "Corrigiendo errores finales..." -ForegroundColor Cyan

# Error 1: AuditListing - agregar || undefined a selectedAudit
$file1 = "src/components/audits/AuditListing.tsx"
$content1 = Get-Content $file1 -Raw
$content1 = $content1 -replace 'initialData=\{selectedAudit\}', 'initialData={selectedAudit || undefined}'
Set-Content $file1 $content1 -NoNewline
Write-Host "Corregido AuditListing.tsx - agregado || undefined" -ForegroundColor Green

# Error 2: FindingListing - agregar prop open
$file2 = "src/components/findings/FindingListing.tsx"
$content2 = Get-Content $file2 -Raw
$content2 = $content2 -replace '<FindingFormDialog\s+initialData', '<FindingFormDialog
          open={showForm}
          initialData'
Set-Content $file2 $content2 -NoNewline
Write-Host "Corregido FindingListing.tsx - agregada prop open" -ForegroundColor Green

Write-Host ""
Write-Host "Todos los errores corregidos!" -ForegroundColor Green
Write-Host "Ejecuta: npm run type-check" -ForegroundColor Cyan
