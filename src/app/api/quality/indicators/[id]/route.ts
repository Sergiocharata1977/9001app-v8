import { NextRequest, NextResponse } from 'next/server';
import { QualityIndicatorService } from '@/services/quality/QualityIndicatorService';
import { qualityIndicatorSchema } from '@/lib/validations/quality';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const indicator = await QualityIndicatorService.getById(id);

    if (!indicator) {
      return NextResponse.json(
        { error: 'Indicador de calidad no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(indicator);
  } catch (error) {
    console.error('Error in quality indicator GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener indicador de calidad' },
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
    const validatedData = qualityIndicatorSchema.partial().parse(body);

    const indicator = await QualityIndicatorService.update(id, validatedData);

    return NextResponse.json(indicator);
  } catch (error) {
    console.error('Error in quality indicator PUT:', error);

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
      { error: 'Error al actualizar indicador de calidad' },
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
    await QualityIndicatorService.delete(id);

    return NextResponse.json({
      message: 'Indicador de calidad eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error in quality indicator DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar indicador de calidad' },
      { status: 500 }
    );
  }
}
