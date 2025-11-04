# Script para crear definiciones de procesos con estructura correcta

Write-Host "Creando definiciones de procesos..." -ForegroundColor Cyan

# Hacer POST a la API para crear definiciones
$url = "http://localhost:3000/api/process-definitions"

$body = @{
    action = "seed"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    Write-Host "`n✅ Definiciones creadas exitosamente!" -ForegroundColor Green
    Write-Host $response.message -ForegroundColor White
} catch {
    Write-Host "`n❌ Error al crear definiciones:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
