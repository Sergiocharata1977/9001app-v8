import { ProcessDefinitionService } from '@/services/processRecords/ProcessDefinitionService';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/process-definitions/[id] - Get single process definition with document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const definition = await ProcessDefinitionService.getByIdWithDocument(id);

    if (!definition) {
      return NextResponse.json(
        { error: 'Definición no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(definition);
  } catch (error) {
    console.error('Error getting process definition:', error);
    return NextResponse.json(
      { error: 'Error al obtener definición' },
      { status: 500 }
    );
  }
}

// PATCH /api/process-definitions/[id] - Update process definition
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await ProcessDefinitionService.update(id, body);
    return NextResponse.json({
      message: 'Definición actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error updating process definition:', error);
    return NextResponse.json(
      { error: 'Error al actualizar definición' },
      { status: 500 }
    );
  }
}

// DELETE /api/process-definitions/[id] - Delete process definition
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await ProcessDefinitionService.delete(id);
    return NextResponse.json({ message: 'Definición eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting process definition:', error);
    return NextResponse.json(
      { error: 'Error al eliminar definición' },
      { status: 500 }
    );
  }
}
