import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/findings/by-source/[sourceType]
 * Obtiene hallazgos por tipo de fuente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sourceType: string }> }
) {
  try {
    const { sourceType } = await params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');

    if (!sourceId) {
      return NextResponse.json(
        { error: 'sourceId is required' },
        { status: 400 }
      );
    }

    const findings = await FindingService.getBySource(
      sourceType,
      sourceId
    );

    return NextResponse.json({ findings }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/findings/by-source/[sourceType]:', error);
    return NextResponse.json(
      { error: 'Failed to get findings by source' },
      { status: 500 }
    );
  }
}
