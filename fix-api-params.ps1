# Script para corregir params en rutas API de Next.js 15
# Convierte { params: { id: string } } a { params: Promise<{ id: string }> }

$files = @(
    "src/app/api/audits/[id]/status/route.ts",
    "src/app/api/audits/[id]/findings/route.ts",
    "src/app/api/findings/[id]/route.ts",
    "src/app/api/findings/[id]/verify/route.ts",
    "src/app/api/findings/[id]/phase/route.ts",
    "src/app/api/findings/[id]/correction/route.ts",
    "src/app/api/findings/[id]/analyze/route.ts",
    "src/app/api/findings/[id]/actions/route.ts",
    "src/app/api/actions/[id]/route.ts",
    "src/app/api/actions/[id]/verify/route.ts",
    "src/app/api/actions/[id]/status/route.ts",
    "src/app/api/actions/[id]/progress/route.ts",
    "src/app/api/actions/[id]/comments/route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Procesando: $file"
        $content = Get-Content $file -Raw
        
        # Reemplazar el tipo de params
        $content = $content -replace '\{ params \}: \{ params: \{ id: string \} \}', '{ params }: { params: Promise<{ id: string }> }'
        
        # Agregar await params después de try {
        $content = $content -replace '(\s+try \{)\s+', "`$1`n    const { id } = await params;`n    "
        
        # Reemplazar params.id con id
        $content = $content -replace 'params\.id', 'id'
        
        Set-Content $file $content -NoNewline
        Write-Host "✓ Corregido: $file"
    } else {
        Write-Host "✗ No encontrado: $file"
    }
}

Write-Host "`nProceso completado!"
