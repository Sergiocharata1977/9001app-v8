import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const phaseSchema = z.object({
  phase: z.enum(['detection', 'treatment', 'control']),
});

/**
 * PATCH /api/findings/[id]/phase
 * Actualiza la fase de un hallazgo
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

    const validationResult = phaseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await FindingService.updatePhase(id, validationResult.data.phase, userId);

    return NextResponse.json(
      { message: 'Finding phase updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/findings/[id]/phase:', error);
    return NextResponse.json(
      { error: 'Failed to update finding phase' },
      { status: 500 }
    );
  }
}
