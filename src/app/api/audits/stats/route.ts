import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/audits/stats
 * Obtiene estadísticas de auditorías
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener año de query params
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year')
      ? parseInt(searchParams.get('year')!)
      : undefined;

    const stats = await AuditService.getStats(year);

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/audits/stats:', error);
    return NextResponse.json(
      { error: 'Failed to get audit stats' },
      { status: 500 }
    );
  }
}
