import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const immediateCorrectionSchema = z.object({
  description: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'completed']),
  commitmentDate: z.string().optional(),
  closureDate: z.string().optional(),
});

/**
 * POST /api/findings/[id]/correction
 * Agrega corrección inmediata a un hallazgo
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

    const validationResult = immediateCorrectionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await FindingService.addImmediateCorrection(
      id,
      validationResult.data,
      userId
    );

    return NextResponse.json(
      { message: 'Immediate correction added successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/findings/[id]/correction:', error);
    return NextResponse.json(
      { error: 'Failed to add immediate correction' },
      { status: 500 }
    );
  }
}
