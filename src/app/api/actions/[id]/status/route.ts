import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum([
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'on_hold',
  ]),
});

/**
 * PATCH /api/actions/[id]/status
 * Actualiza el estado de una acción
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = 'current-user-id'; // TODO: Get from token
    const body = await request.json();

    const validationResult = statusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await ActionService.updateStatus(
      id,
      validationResult.data.status,
      userId
    );

    return NextResponse.json(
      { message: 'Action status updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/actions/[id]/status:', error);
    return NextResponse.json(
      { error: 'Failed to update action status' },
      { status: 500 }
    );
  }
}
