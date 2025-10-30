# Script para agregar contenedor con margenes a los componentes Listing

Write-Host "Agregando contenedor con margenes..." -ForegroundColor Cyan

# Funcion para agregar contenedor
function Add-Container {
    param($file)
    
    $content = Get-Content $file -Raw
    
    # Cambiar el div principal de space-y-6 a incluir container y margenes
    $content = $content -replace '<div className="space-y-6">', '<div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">'
    
    Set-Content $file $content -NoNewline
}

# Aplicar a los 3 archivos
Add-Container "src/components/audits/AuditListing.tsx"
Write-Host "AuditListing.tsx actualizado" -ForegroundColor Green

Add-Container "src/components/findings/FindingListing.tsx"
Write-Host "FindingListing.tsx actualizado" -ForegroundColor Green

Add-Container "src/components/actions/ActionListing.tsx"
Write-Host "ActionListing.tsx actualizado" -ForegroundColor Green

Write-Host ""
Write-Host "Contenedores agregados exitosamente!" -ForegroundColor Green
Write-Host "El contenido ahora tiene:" -ForegroundColor Yellow
Write-Host "  - Margenes laterales (px-4)" -ForegroundColor White
Write-Host "  - Margenes verticales (py-6)" -ForegroundColor White
Write-Host "  - Centrado automatico (mx-auto)" -ForegroundColor White
Write-Host "  - Ancho maximo de 7xl" -ForegroundColor White
