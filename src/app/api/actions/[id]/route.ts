import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// GET - Obtener acción por ID
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const action = await ActionService.getById(id);

    if (!action) {
      return NextResponse.json(
        { error: 'Acción no encontrada' },
        { status: 404 }
      );
    }

    // Serializar Timestamps
    const serializedAction = {
      ...action,
      planning: {
        ...action.planning,
        plannedDate: action.planning.plannedDate.toDate().toISOString(),
      },
      execution: action.execution
        ? {
            ...action.execution,
            executionDate:
              action.execution.executionDate?.toDate().toISOString() || null,
          }
        : null,
      controlPlanning: action.controlPlanning
        ? {
            ...action.controlPlanning,
            plannedDate: action.controlPlanning.plannedDate
              .toDate()
              .toISOString(),
          }
        : null,
      controlExecution: action.controlExecution
        ? {
            ...action.controlExecution,
            executionDate:
              action.controlExecution.executionDate?.toDate().toISOString() ||
              null,
          }
        : null,
      createdAt: action.createdAt.toDate().toISOString(),
      updatedAt: action.updatedAt.toDate().toISOString(),
    };

    return NextResponse.json(serializedAction);
  } catch (error) {
    console.error('Error in GET /api/actions/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener la acción' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Eliminar acción (soft delete)
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = 'temp-user-id';
    const userName = 'Usuario Temporal';

    const { id } = await params;
    await ActionService.delete(id, userId, userName);

    return NextResponse.json({ message: 'Acción eliminada exitosamente' });
  } catch (error) {
    console.error('Error in DELETE /api/actions/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la acción' },
      { status: 500 }
    );
  }
}
