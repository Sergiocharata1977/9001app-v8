import { EventFiltersSchema } from '@/lib/validations/calendar';
import { CalendarService } from '@/services/calendar/CalendarService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/calendar/events/range
 * Obtener eventos por rango de fechas
 * Query params: startDate, endDate, organizationId, + filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros requeridos
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'startDate y endDate son requeridos' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Fechas inválidas' }, { status: 400 });
    }

    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    // Construir filtros opcionales
    const filters: Record<string, unknown> = {};

    const type = searchParams.get('type');
    if (type) {
      filters.type = type.includes(',') ? type.split(',') : type;
    }

    const sourceModule = searchParams.get('sourceModule');
    if (sourceModule) {
      filters.sourceModule = sourceModule.includes(',')
        ? sourceModule.split(',')
        : sourceModule;
    }

    const status = searchParams.get('status');
    if (status) {
      filters.status = status.includes(',') ? status.split(',') : status;
    }

    const priority = searchParams.get('priority');
    if (priority) {
      filters.priority = priority.includes(',')
        ? priority.split(',')
        : priority;
    }

    const responsibleUserId = searchParams.get('responsibleUserId');
    if (responsibleUserId) {
      filters.responsibleUserId = responsibleUserId;
    }

    const processId = searchParams.get('processId');
    if (processId) {
      filters.processId = processId;
    }

    const isSystemGenerated = searchParams.get('isSystemGenerated');
    if (isSystemGenerated !== null) {
      filters.isSystemGenerated = isSystemGenerated === 'true';
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    // Validar filtros
    const validatedFilters = EventFiltersSchema.parse(filters);

    // Obtener eventos (sin organizationId ya que es single-tenant)
    const events = await CalendarService.getEventsByDateRange(
      startDate,
      endDate,
      validatedFilters
    );

    return NextResponse.json({
      events,
      count: events.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error) {
    console.error('Error in GET /api/calendar/events/range:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Filtros inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error al obtener eventos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
