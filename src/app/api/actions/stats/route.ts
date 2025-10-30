import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/actions/stats
 * Obtiene estadísticas de acciones
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year')
      ? parseInt(searchParams.get('year')!)
      : undefined;

    const stats = await ActionService.getStats(year);

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/actions/stats:', error);
    return NextResponse.json(
      { error: 'Failed to get action stats' },
      { status: 500 }
    );
  }
}
