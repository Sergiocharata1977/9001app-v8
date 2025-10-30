import { actionFormDataSchema } from '@/lib/validations/actions';
import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/actions
 * Obtiene todas las acciones con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      actionType: searchParams.get('actionType') || undefined,
      priority: searchParams.get('priority') || undefined,
      responsiblePersonId: searchParams.get('responsiblePersonId') || undefined,
      findingId: searchParams.get('findingId') || undefined,
    };

    const actions = await ActionService.getAll(filters);

    return NextResponse.json({ actions }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/actions:', error);
    return NextResponse.json(
      { error: 'Failed to get actions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/actions
 * Crea una nueva acción
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = 'current-user-id'; // TODO: Get from token
    const body = await request.json();

    const validationResult = actionFormDataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const actionId = await ActionService.create(validationResult.data, userId);

    return NextResponse.json(
      { message: 'Action created successfully', id: actionId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/actions:', error);
    return NextResponse.json(
      { error: 'Failed to create action' },
      { status: 500 }
    );
  }
}
