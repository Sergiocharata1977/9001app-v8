import { NextRequest, NextResponse } from 'next/server';
import { QualityObjectiveService } from '@/services/quality/QualityObjectiveService';
import { qualityObjectiveSchema } from '@/lib/validations/quality';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const objective = await QualityObjectiveService.getById(id);

    if (!objective) {
      return NextResponse.json(
        { error: 'Objetivo de calidad no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(objective);
  } catch (error) {
    console.error('Error in quality objective GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener objetivo de calidad' },
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
    const validatedData = qualityObjectiveSchema.partial().parse(body);

    const objective = await QualityObjectiveService.update(id, validatedData);

    return NextResponse.json(objective);
  } catch (error) {
    console.error('Error in quality objective PUT:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar objetivo de calidad' },
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
    await QualityObjectiveService.delete(id);

    return NextResponse.json({ message: 'Objetivo de calidad eliminado exitosamente' });
  } catch (error) {
    console.error('Error in quality objective DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar objetivo de calidad' },
      { status: 500 }
    );
  }
}