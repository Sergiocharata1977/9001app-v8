import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const rootCauseAnalysisSchema = z.object({
  method: z.string().min(1),
  rootCause: z.string().min(1),
  contributingFactors: z.array(z.string()).optional(),
  analysis: z.string().min(1),
});

/**
 * POST /api/findings/[id]/analyze
 * Analiza la causa raíz de un hallazgo (Fase 2: Tratamiento)
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

    const validationResult = rootCauseAnalysisSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await FindingService.analyzeRootCause(
      id,
      validationResult.data,
      userId
    );

    // Verificar recurrencia después del análisis
    await FindingService.checkRecurrence(id);

    return NextResponse.json(
      { message: 'Root cause analysis completed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/findings/[id]/analyze:', error);
    return NextResponse.json(
      { error: 'Failed to analyze root cause' },
      { status: 500 }
    );
  }
}
