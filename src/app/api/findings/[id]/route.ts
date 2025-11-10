import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/findings/[id] - Obtener hallazgo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const finding = await FindingService.getById(id);

    if (!finding) {
      return NextResponse.json(
        { error: 'Hallazgo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ finding });
  } catch (error) {
    console.error('Error in GET /api/findings/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener hallazgo' },
      { status: 500 }
    );
  }
}

// DELETE /api/findings/[id] - Eliminar hallazgo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await FindingService.delete(id, 'system', body.userName || 'Usuario');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/findings/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar hallazgo' },
      { status: 500 }
    );
  }
}
