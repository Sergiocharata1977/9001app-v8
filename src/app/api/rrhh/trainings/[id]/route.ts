import { NextRequest, NextResponse } from 'next/server';
import { TrainingService } from '@/services/rrhh/TrainingService';
import { trainingSchema } from '@/lib/validations/rrhh';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const training = await TrainingService.getById(id);

    if (!training) {
      return NextResponse.json(
        { error: 'Capacitación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(training);
  } catch (error) {
    console.error('Error in training GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener capacitación' },
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
    const validatedData = trainingSchema.parse(body);

    const training = await TrainingService.update(id, validatedData);

    return NextResponse.json(training);
  } catch (error) {
    console.error('Error in training PUT:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar capacitación' },
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
    await TrainingService.delete(id);

    return NextResponse.json({ message: 'Capacitación eliminada exitosamente' });
  } catch (error) {
    console.error('Error in training DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar capacitación' },
      { status: 500 }
    );
  }
}

// PATCH for status updates and participant management
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'update_status' && body.status) {
      const training = await TrainingService.updateStatus(id, body.status);
      return NextResponse.json(training);
    }

    if (body.action === 'add_participant' && body.participant_id) {
      const training = await TrainingService.addParticipant(id, body.participant_id);
      return NextResponse.json(training);
    }

    if (body.action === 'remove_participant' && body.participant_id) {
      const training = await TrainingService.removeParticipant(id, body.participant_id);
      return NextResponse.json(training);
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in training PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar capacitación' },
      { status: 500 }
    );
  }
}