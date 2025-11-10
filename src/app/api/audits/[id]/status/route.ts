import { AuditStatusSchema } from '@/lib/validations/audits';
import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/audits/[id]/status - Cambiar estado de auditoría
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = AuditStatusSchema.parse(body.status);

    await AuditService.updateStatus(id, status);

    return NextResponse.json({ message: 'Estado actualizado exitosamente' });
  } catch (error: unknown) {
    console.error('Error updating audit status:', error);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError'
    ) {
      return NextResponse.json(
        {
          error: 'Estado inválido',
          details: 'errors' in error ? error.errors : [],
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar estado' },
      { status: 500 }
    );
  }
}
