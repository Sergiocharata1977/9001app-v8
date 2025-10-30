import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const progressSchema = z.object({
  progress: z.number().min(0).max(100),
});

/**
 * PATCH /api/actions/[id]/progress
 * Actualiza el progreso de una acción
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

    const validationResult = progressSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await ActionService.updateProgress(
      id,
      validationResult.data.progress,
      userId
    );

    return NextResponse.json(
      { message: 'Action progress updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/actions/[id]/progress:', error);
    return NextResponse.json(
      { error: 'Failed to update action progress' },
      { status: 500 }
    );
  }
}
