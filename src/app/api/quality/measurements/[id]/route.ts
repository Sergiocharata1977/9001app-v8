import { NextRequest, NextResponse } from 'next/server';
import { MeasurementService } from '@/services/quality/MeasurementService';
import { measurementSchema } from '@/lib/validations/quality';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const measurement = await MeasurementService.getById(id);

    if (!measurement) {
      return NextResponse.json(
        { error: 'Medición no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(measurement);
  } catch (error) {
    console.error('Error in measurement GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener medición' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = measurementSchema.partial().parse(body);

    const measurement = await MeasurementService.update(id, validatedData);

    return NextResponse.json(measurement);
  } catch (error) {
    console.error('Error in measurement PUT:', error);

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
      { error: 'Error al actualizar medición' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await MeasurementService.delete(id);

    return NextResponse.json({ message: 'Medición eliminada exitosamente' });
  } catch (error) {
    console.error('Error in measurement DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar medición' },
      { status: 500 }
    );
  }
}

// Additional endpoints for validation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, validatedBy, notes } = body;

    if (action === 'validate') {
      const measurement = await MeasurementService.validateMeasurement(
        id,
        validatedBy,
        notes
      );
      return NextResponse.json(measurement);
    } else if (action === 'reject') {
      const measurement = await MeasurementService.rejectMeasurement(
        id,
        validatedBy,
        notes
      );
      return NextResponse.json(measurement);
    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in measurement PATCH:', error);
    return NextResponse.json(
      { error: 'Error al procesar la validación de medición' },
      { status: 500 }
    );
  }
}
