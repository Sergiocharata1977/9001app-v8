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
      { error: 'Error al obtener polÃ­ticas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // TODO: Obtener userId del contexto de autenticación
    const userId = 'system-user'; // Placeholder temporal
    const politica = await PoliticaService.create(data, userId);
    return NextResponse.json(politica, { status: 201 });
  } catch (error) {
    console.error('Error creating politica:', error);
    return NextResponse.json(
      { error: 'Error al crear política' },
      { status: 500 }
    );
  }
}
