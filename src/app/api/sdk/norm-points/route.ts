/**
 * NormPoint API Routes - SDK Unified
 *
 * GET /api/sdk/norm-points - List norm points
 * POST /api/sdk/norm-points - Create norm point
 */

import { NextRequest, NextResponse } from 'next/server';
import { NormPointService } from '@/lib/sdk/modules/normPoints';
import type { NormPointFilters } from '@/lib/sdk/modules/normPoints/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters: NormPointFilters = {
      chapter: searchParams.get('chapter') || undefined,
      category: searchParams.get('category') || undefined,
      isMandatory: searchParams.get('isMandatory')
        ? searchParams.get('isMandatory') === 'true'
        : undefined,
      search: searchParams.get('search') || undefined,
    };

    const options = {
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 100,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!)
        : 0,
    };

    const service = new NormPointService();
    const normPoints = await service.list(filters, options);

    return NextResponse.json({ normPoints, count: normPoints.length });
  } catch (error) {
    console.error('Error in GET /api/sdk/norm-points:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener puntos de norma',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Creación de puntos de norma no implementada' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/norm-points:', error);
    return NextResponse.json(
      {
        error: 'Error al crear punto de norma',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
