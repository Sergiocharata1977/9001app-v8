# Script para agregar contenedor con márgenes a los componentes Listing

Write-Host "Agregando contenedor con márgenes..." -ForegroundColor Cyan

# Función para agregar contenedor
function Add-Container {
    param($file)
    
    $content = Get-Content $file -Raw
    
    # Cambiar el div principal de space-y-6 a incluir container y márgenes
    $content = $content -replace '<div className="space-y-6">', '<div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">'
    
    Set-Content $file $content -NoNewline
}

# Aplicar a los 3 archivos
Add-Container "src/components/audits/AuditListing.tsx"
Write-Host "✓ AuditListing.tsx actualizado" -ForegroundColor Green

Add-Container "src/components/findings/FindingListing.tsx"
Write-Host "✓ FindingListing.tsx actualizado" -ForegroundColor Green

Add-Container "src/components/actions/ActionListing.tsx"
Write-Host "✓ ActionListing.tsx actualizado" -ForegroundColor Green

Write-Host ""
Write-Host "Contenedores agregados exitosamente!" -ForegroundColor Green
Write-Host "El contenido ahora tiene:" -ForegroundColor Yellow
Write-Host "  - Márgenes laterales (px-4)" -ForegroundColor White
Write-Host "  - Márgenes verticales (py-6)" -ForegroundColor White
Write-Host "  - Centrado automático (mx-auto)" -ForegroundColor White
Write-Host "  - Ancho máximo de 7xl (max-w-7xl)" -ForegroundColor White
