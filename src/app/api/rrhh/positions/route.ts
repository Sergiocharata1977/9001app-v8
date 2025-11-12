import { NextRequest, NextResponse } from 'next/server';
import { PositionService } from '@/services/rrhh/PositionService';
import {
  positionSchema,
  positionFiltersSchema,
  paginationSchema,
} from '@/lib/validations/rrhh';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = positionFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      departamento_id: searchParams.get('departamento_id') || undefined,
      reporta_a_id: searchParams.get('reporta_a_id') || undefined,
    });

    // Parse pagination
    const pagination = paginationSchema.parse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort: searchParams.get('sort') || undefined,
      order: searchParams.get('order') || 'desc',
    });

    const result = await PositionService.getAll();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in positions GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener puestos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = positionSchema.parse(body);

    const position = await PositionService.create(validatedData);

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    console.error('Error in positions POST:', error);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError'
    ) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear puesto' },
      { status: 500 }
    );
  }
}
