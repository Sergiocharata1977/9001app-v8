import { FindingFormSchema } from '@/lib/validations/findings';
import { FindingService } from '@/services/findings/FindingService';
import type { FindingStatus } from '@/types/findings';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/findings - Listar hallazgos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: (searchParams.get('status') as FindingStatus) || undefined,
      processId: searchParams.get('processId') || undefined,
      sourceId: searchParams.get('sourceId') || undefined,
      year: searchParams.get('year')
        ? parseInt(searchParams.get('year')!)
        : undefined,
      search: searchParams.get('search') || undefined,
      requiresAction: searchParams.get('requiresAction')
        ? searchParams.get('requiresAction') === 'true'
        : undefined,
    };

    const { findings } = await FindingService.list(filters);

    return NextResponse.json({ findings });
  } catch (error) {
    console.error('Error in GET /api/findings:', error);
    return NextResponse.json(
      { error: 'Error al obtener hallazgos' },
      { status: 500 }
    );
  }
}

// POST /api/findings - Crear hallazgo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validatedData = FindingFormSchema.parse(body);

    // Crear hallazgo
    const findingId = await FindingService.create(
      validatedData,
      'system',
      body.userName || 'Usuario'
    );

    return NextResponse.json({ id: findingId }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/findings:', error);
    return NextResponse.json(
      { error: 'Error al crear hallazgo' },
      { status: 500 }
    );
  }
}
