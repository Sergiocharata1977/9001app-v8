import { NextRequest, NextResponse } from 'next/server';
import { MeasurementService } from '@/services/quality/MeasurementService';
import {
  measurementSchema,
  measurementFiltersSchema,
} from '@/lib/validations/quality';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = measurementFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      validation_status:
        (searchParams.get('validation_status') as any) || undefined,
      indicator_id: searchParams.get('indicator_id') || undefined,
      objective_id: searchParams.get('objective_id') || undefined,
      process_definition_id:
        searchParams.get('process_definition_id') || undefined,
      measured_by: searchParams.get('measured_by') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    });

    let measurements;

    if (filters.indicator_id) {
      measurements = await MeasurementService.getByIndicator(
        filters.indicator_id
      );
    } else if (filters.objective_id) {
      measurements = await MeasurementService.getByObjective(
        filters.objective_id
      );
    } else if (filters.process_definition_id) {
      measurements = await MeasurementService.getByProcess(
        filters.process_definition_id
      );
    } else {
      measurements = await MeasurementService.getAll();
    }

    // Apply additional filters
    if (filters.search) {
      measurements = measurements.filter(
        m =>
          m.notes?.toLowerCase().includes(filters.search!.toLowerCase()) ||
          m.measurement_method
            .toLowerCase()
            .includes(filters.search!.toLowerCase())
      );
    }

    if (filters.validation_status) {
      measurements = measurements.filter(
        m => m.validation_status === filters.validation_status
      );
    }

    if (filters.measured_by) {
      measurements = measurements.filter(
        m => m.measured_by === filters.measured_by
      );
    }

    if (filters.start_date) {
      measurements = measurements.filter(
        m => m.measurement_date >= filters.start_date!
      );
    }

    if (filters.end_date) {
      measurements = measurements.filter(
        m => m.measurement_date <= filters.end_date!
      );
    }

    return NextResponse.json(measurements);
  } catch (error) {
    console.error('Error in measurements GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener mediciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = measurementSchema.parse(body);

    const measurement = await MeasurementService.create(validatedData);

    return NextResponse.json(measurement, { status: 201 });
  } catch (error) {
    console.error('Error in measurements POST:', error);

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
      { error: 'Error al crear medición' },
      { status: 500 }
    );
  }
}
