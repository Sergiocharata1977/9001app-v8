import { actionFormDataSchema } from '@/lib/validations/actions';
import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/actions/[id]
 * Obtiene una acción por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const action = await ActionService.getById(id);

    if (!action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    return NextResponse.json({ action }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/actions/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to get action' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/actions/[id]
 * Actualiza una acción
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = 'current-user-id'; // TODO: Get from token
    const body = await request.json();

    const validationResult = actionFormDataSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { id } = await params;
    await ActionService.update(id, validationResult.data, userId);

    return NextResponse.json(
      { message: 'Action updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/actions/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update action' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/actions/[id]
 * Elimina una acción (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = 'current-user-id'; // TODO: Get from token

    const { id } = await params;
    await ActionService.delete(id, userId);

    return NextResponse.json(
      { message: 'Action deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/actions/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete action' },
      { status: 500 }
    );
  }
}
