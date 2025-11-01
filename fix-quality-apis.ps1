# Script para corregir las APIs de los módulos de calidad

Write-Host "Corrigiendo APIs de módulos de calidad..." -ForegroundColor Green

# Recrear API de políticas
$politicasRoute = @'
import { NextRequest, NextResponse } from 'next/server';
import { PoliticaService } from '@/services/politicas/PoliticaService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const estado = searchParams.get('estado');
    const organizationId = searchParams.get('organization_id') || 'default-org';

    const politicas = await PoliticaService.getAll({ organization_id: organizationId, estado: estado || undefined });
    return NextResponse.json(politicas);
  } catch (error) {
    console.error('Error fetching politicas:', error);
    return NextResponse.json(
      { error: 'Error al obtener políticas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const politica = await PoliticaService.create(data);
    return NextResponse.json(politica, { status: 201 });
  } catch (error) {
    console.error('Error creating politica:', error);
    return NextResponse.json(
      { error: 'Error al crear política' },
      { status: 500 }
    );
  }
}
'@

$politicasRoute | Out-File -FilePath "src/app/api/politicas/route.ts" -Encoding UTF8

Write-Host "✓ API de políticas corregida" -ForegroundColor Cyan

# Recrear API de reuniones
$reunionesRoute = @'
import { NextRequest, NextResponse } from 'next/server';
import { ReunionTrabajoService } from '@/services/reuniones-trabajo/ReunionTrabajoService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get('tipo');
    const estado = searchParams.get('estado');
    const organizationId = searchParams.get('organization_id') || 'default-org';

    const reuniones = await ReunionTrabajoService.getAll({ organization_id: organizationId, tipo: tipo || undefined, estado: estado || undefined });
    return NextResponse.json(reuniones);
  } catch (error) {
    console.error('Error fetching reuniones:', error);
    return NextResponse.json(
      { error: 'Error al obtener reuniones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const reunion = await ReunionTrabajoService.create(data);
    return NextResponse.json(reunion, { status: 201 });
  } catch (error) {
    console.error('Error creating reunion:', error);
    return NextResponse.json(
      { error: 'Error al crear reunión' },
      { status: 500 }
    );
  }
}
'@

$reunionesRoute | Out-File -FilePath "src/app/api/reuniones-trabajo/route.ts" -Encoding UTF8

Write-Host "✓ API de reuniones corregida" -ForegroundColor Cyan

Write-Host "`nTodas las APIs corregidas exitosamente!" -ForegroundColor Green
