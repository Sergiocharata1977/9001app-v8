import { AuditFormSchema } from '@/lib/validations/audits';
import { AuditService } from '@/services/audits/AuditService';
import type { AuditStatus, AuditType } from '@/types/audits';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// GET - Listar auditorías
// ============================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      status: (searchParams.get('status') as AuditStatus) || undefined,
      auditType: (searchParams.get('auditType') as AuditType) || undefined,
      year: searchParams.get('year')
        ? parseInt(searchParams.get('year')!)
        : undefined,
      search: searchParams.get('search') || undefined,
    };

    const pageSize = searchParams.get('pageSize')
      ? parseInt(searchParams.get('pageSize')!)
      : 50;

    const result = await AuditService.list(filters, pageSize);

    // Serializar Timestamps a ISO strings
    const serializedAudits = result.audits.map(audit => ({
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
    }));

    return NextResponse.json({
      audits: serializedAudits,
    });
  } catch (error) {
    console.error('Error in GET /api/audits:', error);
    return NextResponse.json(
      { error: 'Error al obtener las auditorías' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Crear auditoría
// ============================================

export async function POST(request: NextRequest) {
  try {
    const userId = 'temp-user-id';
    const userName = 'Usuario Temporal';

    const body = await request.json();

    // Convertir fecha de string a Date
    if (body.plannedDate) {
      body.plannedDate = new Date(body.plannedDate);
    }

    // Validar datos
    const validatedData = AuditFormSchema.parse(body);

    // Crear auditoría
    const auditId = await AuditService.create(validatedData, userId, userName);

    return NextResponse.json(
      { id: auditId, message: 'Auditoría creada exitosamente' },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error in POST /api/audits:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear la auditoría' },
      { status: 500 }
    );
  }
}
