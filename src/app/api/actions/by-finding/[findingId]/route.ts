import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/actions/by-finding/[findingId]
 * Obtiene acciones por hallazgo
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ findingId: string }> }
) {
  try {
    const { findingId } = await params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actions = await ActionService.getByFinding(findingId);

    return NextResponse.json({ actions }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/actions/by-finding/[findingId]:', error);
    return NextResponse.json(
      { error: 'Failed to get actions by finding' },
      { status: 500 }
    );
  }
}
