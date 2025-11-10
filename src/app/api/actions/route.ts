import { ActionFormSchema } from '@/lib/validations/actions';
import { ActionService } from '@/services/actions/ActionService';
import type { ActionPriority, ActionStatus, ActionType } from '@/types/actions';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// GET - Listar acciones
// ============================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      status: (searchParams.get('status') as ActionStatus) || undefined,
      actionType: (searchParams.get('actionType') as ActionType) || undefined,
      priority: (searchParams.get('priority') as ActionPriority) || undefined,
      responsiblePersonId: searchParams.get('responsiblePersonId') || undefined,
      processId: searchParams.get('processId') || undefined,
      findingId: searchParams.get('findingId') || undefined,
      year: searchParams.get('year')
        ? parseInt(searchParams.get('year')!)
        : undefined,
      search: searchParams.get('search') || undefined,
    };

    const pageSize = searchParams.get('pageSize')
      ? parseInt(searchParams.get('pageSize')!)
      : 50;

    const result = await ActionService.list(filters, pageSize);

    // Serializar Timestamps a ISO strings
    const serializedActions = result.actions.map(action => ({
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
    }));

    return NextResponse.json({
      actions: serializedActions,
    });
  } catch (error) {
    console.error('Error in GET /api/actions:', error);
    return NextResponse.json(
      { error: 'Error al obtener las acciones' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Crear acción (Formulario 1: Planificación)
// ============================================

export async function POST(request: NextRequest) {
  try {
    const userId = 'temp-user-id';
    const userName = 'Usuario Temporal';

    const body = await request.json();

    // Convertir fechas de string a Date
    if (body.plannedExecutionDate) {
      body.plannedExecutionDate = new Date(body.plannedExecutionDate);
    }
    if (body.plannedVerificationDate) {
      body.plannedVerificationDate = new Date(body.plannedVerificationDate);
    }

    // Validar datos
    const validatedData = ActionFormSchema.parse(body);

    // Crear acción
    const actionId = await ActionService.create(
      validatedData,
      userId,
      userName
    );

    return NextResponse.json(
      { id: actionId, message: 'Acción creada exitosamente' },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error in POST /api/actions:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear la acción' },
      { status: 500 }
    );
  }
}
