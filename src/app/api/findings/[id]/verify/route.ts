import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const verificationSchema = z.object({
  verifiedBy: z.string().min(1),
  verificationDate: z.string().min(1),
  verificationEvidence: z.string().min(1),
  verificationComments: z.string().optional(),
});

/**
 * POST /api/findings/[id]/verify
 * Verifica un hallazgo (Fase 3: Control)
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

    const validationResult = verificationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await FindingService.verify(id, validationResult.data, userId);

    return NextResponse.json(
      { message: 'Finding verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/findings/[id]/verify:', error);
    return NextResponse.json(
      { error: 'Failed to verify finding' },
      { status: 500 }
    );
  }
}
