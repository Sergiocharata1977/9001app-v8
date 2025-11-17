/**
 * Action Statistics API Route - SDK Unified
 * 
 * GET /api/sdk/actions/stats - Get action statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { ActionService } from '@/lib/sdk/modules/actions';
import type { ActionFilters } from '@/lib/sdk/modules/actions/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filters from query parameters
    const filters: ActionFilters = {
      status: (searchParams.get('status') as any) || undefined,
      responsiblePersonId: searchParams.get('responsiblePersonId') || undefined,
      findingId: searchParams.get('findingId') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
    };

    const service = new ActionService();
    const stats = await service.getStats(filters);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in GET /api/sdk/actions/stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de acciones', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
