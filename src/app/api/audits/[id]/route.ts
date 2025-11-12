import { AuditFormSchema } from '@/lib/validations/audits';
import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// GET - Obtener auditoría por ID
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const audit = await AuditService.getById(params.id);

    if (!audit) {
      return NextResponse.json(
        { error: 'Auditoría no encontrada' },
        { status: 404 }
      );
    }

    // Serializar Timestamps
    const serializedAudit = {
      ...audit,
      plannedDate: audit.plannedDate.toDate().toISOString(),
      executionDate: audit.executionDate?.toDate().toISOString() || null,
      normPointsVerification: audit.normPointsVerification.map(v => ({
        ...v,
        verifiedAt: v.verifiedAt?.toDate().toISOString() || null,
      })),
      openingMeeting: audit.openingMeeting
        ? {
            ...audit.openingMeeting,
            date: audit.openingMeeting.date.toDate().toISOString(),
          }
        : null,
      closingMeeting: audit.closingMeeting
        ? {
            ...audit.closingMeeting,
            date: audit.closingMeeting.date.toDate().toISOString(),
          }
        : null,
      reportDelivery: audit.reportDelivery
        ? {
            ...audit.reportDelivery,
            date: audit.reportDelivery.date.toDate().toISOString(),
          }
        : null,
      createdAt: audit.createdAt.toDate().toISOString(),
      updatedAt: audit.updatedAt.toDate().toISOString(),
    };

    return NextResponse.json({ audit: serializedAudit });
  } catch (error) {
    console.error('Error in GET /api/audits/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener la auditoría' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Actualizar auditoría
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = 'temp-user-id';
    const userName = 'Usuario Temporal';

    const body = await request.json();

    // Convertir fecha si existe
    if (body.plannedDate) {
      body.plannedDate = new Date(body.plannedDate);
    }

    // Validar datos parcialmente
    const validatedData = AuditFormSchema.partial().parse(body);

    await AuditService.update(params.id, validatedData, userId, userName);

    return NextResponse.json({ message: 'Auditoría actualizada exitosamente' });
  } catch (error: unknown) {
    console.error('Error in PUT /api/audits/[id]:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error al actualizar la auditoría' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Eliminar auditoría
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await AuditService.delete(params.id);

    return NextResponse.json({ message: 'Auditoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error in DELETE /api/audits/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la auditoría' },
      { status: 500 }
    );
  }
}
