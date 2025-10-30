import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum([
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'postponed',
  ]),
});

/**
 * PATCH /api/audits/[id]/status
 * Actualiza el estado de una auditoría
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = 'current-user-id'; // TODO: Obtener del token
    const body = await request.json();

    // Validar datos
    const validationResult = statusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await AuditService.updateStatus(id, validationResult.data.status, userId);

    return NextResponse.json(
      { message: 'Audit status updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/audits/[id]/status:', error);
    return NextResponse.json(
      { error: 'Failed to update audit status' },
      { status: 500 }
    );
  }
}
