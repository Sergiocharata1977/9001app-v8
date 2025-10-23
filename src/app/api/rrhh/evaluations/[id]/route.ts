import { NextRequest, NextResponse } from 'next/server';
import { EvaluationService } from '@/services/rrhh/EvaluationService';
import { performanceEvaluationSchema } from '@/lib/validations/rrhh';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluation = await EvaluationService.getById(id);

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error in evaluation GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener evaluación' },
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
    const validatedData = performanceEvaluationSchema.parse(body);

    const evaluation = await EvaluationService.update(id, validatedData);

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error in evaluation PUT:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar evaluación' },
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
    await EvaluationService.delete(id);

    return NextResponse.json({ message: 'Evaluación eliminada exitosamente' });
  } catch (error) {
    console.error('Error in evaluation DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar evaluación' },
      { status: 500 }
    );
  }
}

// PATCH for status updates
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'update_status' && body.status) {
      const evaluation = await EvaluationService.updateStatus(id, body.status);
      return NextResponse.json(evaluation);
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in evaluation PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar evaluación' },
      { status: 500 }
    );
  }
}