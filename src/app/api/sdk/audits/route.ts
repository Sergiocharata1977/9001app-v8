/**
 * Audits API Route - SDK Unified
 *
 * GET /api/sdk/audits - List audits
 * POST /api/sdk/audits - Create audit
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/lib/sdk/modules/audits';
import { CreateAuditSchema } from '@/lib/sdk/modules/audits/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const service = new AuditService();
    let audits;

    if (status) {
      audits = await service.getByStatus(status);
    } else {
      audits = await service.list({}, { limit, offset });
    }

    return NextResponse.json(
      { data: audits, count: audits.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/sdk/audits:', error);
    return NextResponse.json(
      { error: 'Error al obtener auditorías', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateAuditSchema.parse(body);

    const service = new AuditService();
    const id = await service.createAndReturnId(validated, 'system');

    return NextResponse.json(
      { id, message: 'Auditoría creada exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/audits:', error);
    return NextResponse.json(
      { error: 'Error al crear auditoría', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
