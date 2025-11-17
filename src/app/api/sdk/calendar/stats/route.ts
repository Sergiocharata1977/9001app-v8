/**
 * Calendar Statistics API Route - SDK Unified
 * 
 * GET /api/sdk/calendar/stats - Get calendar statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { CalendarService } from '@/lib/sdk/modules/calendar';

export async function GET(request: NextRequest) {
  try {
    const service = new CalendarService();
    const stats = await service.getStats();

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in GET /api/sdk/calendar/stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de calendario', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
