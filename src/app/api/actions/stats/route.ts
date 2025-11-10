import { ActionService } from '@/services/actions/ActionService';
import type { ActionPriority, ActionStatus, ActionType } from '@/types/actions';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// GET - Obtener estadísticas de acciones
// ============================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      status: (searchParams.get('status') as ActionStatus) || undefined,
      actionType: (searchParams.get('actionType') as ActionType) || undefined,
      priority: (searchParams.get('priority') as ActionPriority) || undefined,
      responsiblePersonId: searchParams.get('responsiblePersonId') || undefined,
      processId: searchParams.get('processId') || undefined,
      findingId: searchParams.get('findingId') || undefined,
      year: searchParams.get('year')
        ? parseInt(searchParams.get('year')!)
        : undefined,
    };

    const stats = await ActionService.getStats(filters);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in GET /api/actions/stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
