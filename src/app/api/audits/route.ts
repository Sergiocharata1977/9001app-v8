import { auditFormDataSchema } from '@/lib/validations/audits';
import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/audits
 * Obtiene todas las auditorías con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener filtros de query params
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      auditType: searchParams.get('auditType') || undefined,
      leadAuditorId: searchParams.get('leadAuditorId') || undefined,
      year: searchParams.get('year')
        ? parseInt(searchParams.get('year')!)
        : undefined,
    };

    const audits = await AuditService.getAll(filters);

    return NextResponse.json({ audits }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/audits:', error);
    return NextResponse.json(
      { error: 'Failed to get audits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audits
 * Crea una nueva auditoría
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener usuario actual (simplificado, deberías usar tu sistema de auth)
    const userId = 'current-user-id'; // TODO: Obtener del token

    const body = await request.json();

    // Validar datos
    const validationResult = auditFormDataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const auditId = await AuditService.create(validationResult.data, userId);

    return NextResponse.json(
      { message: 'Audit created successfully', id: auditId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/audits:', error);
    return NextResponse.json(
      { error: 'Failed to create audit' },
      { status: 500 }
    );
  }
}
