import { auditFormDataSchema } from '@/lib/validations/audits';
import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/audits/[id]
 * Obtiene una auditoría por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const audit = await AuditService.getById(id);

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    return NextResponse.json({ audit }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/audits/[id]:', error);
    return NextResponse.json({ error: 'Failed to get audit' }, { status: 500 });
  }
}

/**
 * PUT /api/audits/[id]
 * Actualiza una auditoría
 */
export async function PUT(
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

    // Validar datos parciales
    const validationResult = auditFormDataSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await AuditService.update(id, validationResult.data, userId);

    return NextResponse.json(
      { message: 'Audit updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/audits/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update audit' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/audits/[id]
 * Elimina una auditoría (soft delete)
 */
export async function DELETE(
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

    await AuditService.delete(id, userId);

    return NextResponse.json(
      { message: 'Audit deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/audits/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete audit' },
      { status: 500 }
    );
  }
}
