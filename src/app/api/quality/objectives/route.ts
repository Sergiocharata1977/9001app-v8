import { NextRequest, NextResponse } from 'next/server';
import { QualityObjectiveService } from '@/services/quality/QualityObjectiveService';
import { qualityObjectiveSchema, qualityObjectiveFiltersSchema } from '@/lib/validations/quality';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = qualityObjectiveFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as any || undefined,
      type: searchParams.get('type') as any || undefined,
      process_definition_id: searchParams.get('process_definition_id') || undefined,
      responsible_user_id: searchParams.get('responsible_user_id') || undefined,
    });

    let objectives;

    if (filters.process_definition_id) {
      objectives = await QualityObjectiveService.getByProcess(filters.process_definition_id);
    } else {
      objectives = await QualityObjectiveService.getAll();
    }

    // Apply additional filters
    if (filters.search) {
      objectives = objectives.filter(obj =>
        obj.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        obj.code.toLowerCase().includes(filters.search!.toLowerCase()) ||
        obj.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.status) {
      objectives = objectives.filter(obj => obj.status === filters.status);
    }

    if (filters.type) {
      objectives = objectives.filter(obj => obj.type === filters.type);
    }

    if (filters.responsible_user_id) {
      objectives = objectives.filter(obj => obj.responsible_user_id === filters.responsible_user_id);
    }

    return NextResponse.json(objectives);
  } catch (error) {
    console.error('Error in quality objectives GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener objetivos de calidad' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = qualityObjectiveSchema.parse(body);

    const objective = await QualityObjectiveService.create(validatedData);

    return NextResponse.json(objective, { status: 201 });
  } catch (error) {
    console.error('Error in quality objectives POST:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear objetivo de calidad' },
      { status: 500 }
    );
  }
}