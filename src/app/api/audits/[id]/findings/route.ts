import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/audits/[id]/findings
 * Obtiene los hallazgos relacionados con una auditoría
 */
export async function GET(
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

    const findings = await AuditService.getFindings(id);

    return NextResponse.json({ findings }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/audits/[id]/findings:', error);
    return NextResponse.json(
      { error: 'Failed to get audit findings' },
      { status: 500 }
    );
  }
}
