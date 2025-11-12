import { NextRequest, NextResponse } from 'next/server';
import { TrainingService } from '@/services/rrhh/TrainingService';
import {
  trainingSchema,
  trainingFiltersSchema,
  paginationSchema,
} from '@/lib/validations/rrhh';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = trainingFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      estado: (searchParams.get('estado') as any) || undefined,
      modalidad: (searchParams.get('modalidad') as any) || undefined,
      fecha_inicio: searchParams.get('fecha_inicio')
        ? new Date(searchParams.get('fecha_inicio')!)
        : undefined,
      fecha_fin: searchParams.get('fecha_fin')
        ? new Date(searchParams.get('fecha_fin')!)
        : undefined,
    });

    // Parse pagination
    const pagination = paginationSchema.parse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort: searchParams.get('sort') || undefined,
      order: searchParams.get('order') || 'desc',
    });

    const result = await TrainingService.getPaginated(filters, pagination);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in trainings GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener capacitaciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = trainingSchema.parse(body);

    const training = await TrainingService.create(validatedData);

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    console.error('Error in trainings POST:', error);

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
      { error: 'Error al crear capacitación' },
      { status: 500 }
    );
  }
}
