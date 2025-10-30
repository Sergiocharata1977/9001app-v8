import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/findings/[id]/actions
 * Obtiene las acciones relacionadas con un hallazgo
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actions = await FindingService.getActions(id);

    return NextResponse.json({ actions }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/findings/[id]/actions:', error);
    return NextResponse.json(
      { error: 'Failed to get finding actions' },
      { status: 500 }
    );
  }
}
