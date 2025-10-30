import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const effectivenessVerificationSchema = z.object({
  responsiblePersonId: z.string().min(1),
  responsiblePersonName: z.string().min(1),
  verificationCommitmentDate: z.string().optional(),
  verificationExecutionDate: z.string().optional(),
  method: z.string().min(1),
  criteria: z.string().min(1),
  isEffective: z.boolean(),
  result: z.string().min(1),
  evidence: z.string().min(1),
  comments: z.string().optional(),
});

/**
 * POST /api/actions/[id]/verify
 * Verifica la efectividad de una acción (Fase 3: Control)
 */
export async function POST(
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

    const validationResult = effectivenessVerificationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await ActionService.verifyEffectiveness(
      id,
      validationResult.data,
      userId
    );

    return NextResponse.json(
      { message: 'Action effectiveness verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/actions/[id]/verify:', error);
    return NextResponse.json(
      { error: 'Failed to verify action effectiveness' },
      { status: 500 }
    );
  }
}
