# Script para corregir errores de TypeScript en los componentes Listing

Write-Host "Corrigiendo errores de TypeScript..." -ForegroundColor Cyan

# Error 1: ActionListing - onCancel no existe, debe ser onClose y agregar open
$file1 = "src/components/actions/ActionListing.tsx"
$content1 = Get-Content $file1 -Raw
$content1 = $content1 -replace 'onCancel=\{handleFormCancel\}', 'open={showForm}
          onClose={handleFormCancel}'
Set-Content $file1 $content1 -NoNewline
Write-Host "Corregido ActionListing.tsx" -ForegroundColor Green

# Error 2: AuditListing - selectedAudit puede ser null
$file2 = "src/components/audits/AuditListing.tsx"
$content2 = Get-Content $file2 -Raw
$content2 = $content2 -replace 'audit=\{selectedAudit\}', 'audit={selectedAudit || undefined}'
Set-Content $file2 $content2 -NoNewline
Write-Host "Corregido AuditListing.tsx" -ForegroundColor Green

# Error 3: FindingListing - selectedFinding puede ser null
$file3 = "src/components/findings/FindingListing.tsx"
$content3 = Get-Content $file3 -Raw
$content3 = $content3 -replace 'initialData=\{selectedFinding\}', 'initialData={selectedFinding || undefined}'
Set-Content $file3 $content3 -NoNewline
Write-Host "Corregido FindingListing.tsx" -ForegroundColor Green

Write-Host ""
Write-Host "Todos los errores corregidos" -ForegroundColor Yellow
Write-Host "Ejecuta: npm run type-check" -ForegroundColor Cyan
