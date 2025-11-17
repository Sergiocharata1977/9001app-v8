/**
 * Audits API Routes
 *
 * Endpoints for managing audits using the SDK
 */

import { AuditService } from '@/lib/sdk/modules/audits';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// GET - List audits
// ============================================

export async function GET(req: NextRequest) {
  try {
    const auditService = new AuditService();
    const searchParams = req.nextUrl.searchParams;

    const filters: Record<string, unknown> = {};

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status');
    }

    if (searchParams.get('auditType')) {
      filters.auditType = searchParams.get('auditType');
    }

    const limit = searchParams.get('pageSize')
      ? parseInt(searchParams.get('pageSize')!)
      : 50;

    const audits = await auditService.list(filters, { limit });

    return NextResponse.json({
      success: true,
      data: audits,
    });
  } catch (error) {
    console.error('Error listing audits:', error);
    return NextResponse.json(
      { success: false, error: 'Error al listar auditorías' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Create audit
// ============================================

export async function POST(req: NextRequest) {
  try {
    const auditService = new AuditService();
    const body = await req.json();

    // Convert date string to Date
    if (body.plannedDate) {
      body.plannedDate = new Date(body.plannedDate);
    }

    // TODO: Get real user ID from auth
    const userId = 'temp-user-id';

    const auditId = await auditService.createAndReturnId(body, userId);

    return NextResponse.json(
      {
        success: true,
        data: { id: auditId },
        message: 'Auditoría creada exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating audit:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear auditoría' },
      { status: 500 }
    );
  }
}
