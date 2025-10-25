import { NextRequest, NextResponse } from 'next/server';
import { QualityIndicatorService } from '@/services/quality/QualityIndicatorService';
import { qualityIndicatorSchema, qualityIndicatorFiltersSchema } from '@/lib/validations/quality';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = qualityIndicatorFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as any || undefined,
      type: searchParams.get('type') as any || undefined,
      process_definition_id: searchParams.get('process_definition_id') || undefined,
      objective_id: searchParams.get('objective_id') || undefined,
      responsible_user_id: searchParams.get('responsible_user_id') || undefined,
    });

    let indicators;

    if (filters.process_definition_id) {
      indicators = await QualityIndicatorService.getByProcess(filters.process_definition_id);
    } else if (filters.objective_id) {
      indicators = await QualityIndicatorService.getByObjective(filters.objective_id);
    } else {
      indicators = await QualityIndicatorService.getAll();
    }

    // Apply additional filters
    if (filters.search) {
      indicators = indicators.filter(ind =>
        ind.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        ind.code.toLowerCase().includes(filters.search!.toLowerCase()) ||
        ind.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.status) {
      indicators = indicators.filter(ind => ind.status === filters.status);
    }

    if (filters.type) {
      indicators = indicators.filter(ind => ind.type === filters.type);
    }

    if (filters.responsible_user_id) {
      indicators = indicators.filter(ind => ind.responsible_user_id === filters.responsible_user_id);
    }

    return NextResponse.json(indicators);
  } catch (error) {
    console.error('Error in quality indicators GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener indicadores de calidad' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = qualityIndicatorSchema.parse(body);

    const indicator = await QualityIndicatorService.create(validatedData);

    return NextResponse.json(indicator, { status: 201 });
  } catch (error) {
    console.error('Error in quality indicators POST:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear indicador de calidad' },
      { status: 500 }
    );
  }
}