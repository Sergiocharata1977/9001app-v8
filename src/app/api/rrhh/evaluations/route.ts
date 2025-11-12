import { NextRequest, NextResponse } from 'next/server';
import { EvaluationService } from '@/services/rrhh/EvaluationService';
import {
  performanceEvaluationSchema,
  performanceEvaluationFiltersSchema,
  paginationSchema,
} from '@/lib/validations/rrhh';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = performanceEvaluationFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      estado: (searchParams.get('estado') as any) || undefined,
      periodo: searchParams.get('periodo') || undefined,
      personnel_id: searchParams.get('personnel_id') || undefined,
      evaluador_id: searchParams.get('evaluador_id') || undefined,
    });

    // Parse pagination
    const pagination = paginationSchema.parse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort: searchParams.get('sort') || undefined,
      order: searchParams.get('order') || 'desc',
    });

    const result = await EvaluationService.getPaginated(filters, pagination);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in evaluations GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener evaluaciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = performanceEvaluationSchema.parse(body);

    const evaluation = await EvaluationService.create(validatedData);

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error('Error in evaluations POST:', error);

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
      { error: 'Error al crear evaluación' },
      { status: 500 }
    );
  }
}
