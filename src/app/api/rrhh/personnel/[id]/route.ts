import { NextRequest, NextResponse } from 'next/server';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { personnelSchema } from '@/lib/validations/rrhh';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const personnel = await PersonnelService.getById(id);

    if (!personnel) {
      return NextResponse.json(
        { error: 'Personal no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Error in personnel GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener personal' },
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
    const validatedData = personnelSchema.parse(body);

    const personnel = await PersonnelService.update(id, validatedData);

    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Error in personnel PUT:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar personal' },
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
    await PersonnelService.delete(id);

    return NextResponse.json({ message: 'Personal eliminado exitosamente' });
  } catch (error) {
    console.error('Error in personnel DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar personal' },
      { status: 500 }
    );
  }
}

// PATCH for toggling status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'toggle_status') {
      const personnel = await PersonnelService.toggleStatus(id);
      return NextResponse.json(personnel);
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in personnel PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar personal' },
      { status: 500 }
    );
  }
}