/**
 * Audit Detail API Route - SDK Unified
 *
 * GET /api/sdk/audits/[id] - Get audit by ID
 * PUT /api/sdk/audits/[id] - Update audit
 * DELETE /api/sdk/audits/[id] - Delete audit
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/lib/sdk/modules/audits';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de auditoría requerido' },
        { status: 400 }
      );
    }

    const service = new AuditService();
    const audit = await service.getById(id);

    if (!audit) {
      return NextResponse.json(
        { error: 'Auditoría no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: audit }, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/sdk/audits/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al obtener auditoría',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID de auditoría requerido' },
        { status: 400 }
      );
    }

    const service = new AuditService();
    await service.update(id, body, 'system');

    return NextResponse.json(
      { message: 'Auditoría actualizada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in PUT /api/sdk/audits/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al actualizar auditoría',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de auditoría requerido' },
        { status: 400 }
      );
    }

    const service = new AuditService();
    await service.delete(id);

    return NextResponse.json(
      { message: 'Auditoría eliminada exitosamente', id },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error in DELETE /api/sdk/audits/${params.id}:`, error);
    return NextResponse.json(
      {
        error: 'Error al eliminar auditoría',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
