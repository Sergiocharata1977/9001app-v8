import { FindingService } from '@/services/findings/FindingService';
import type { FindingStatus } from '@/types/findings';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/findings/stats - Obtener estadísticas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: (searchParams.get('status') as FindingStatus) || undefined,
      processId: searchParams.get('processId') || undefined,
      year: searchParams.get('year')
        ? parseInt(searchParams.get('year')!)
        : undefined,
    };

    const stats = await FindingService.getStats(filters);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in GET /api/findings/stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
