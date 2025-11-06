import { findingFormDataSchema } from '@/lib/validations/findings';
import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/findings
 * Obtiene todos los hallazgos con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      source: searchParams.get('source') || undefined,
      status: searchParams.get('status') || undefined,
      severity: searchParams.get('severity') || undefined,
      responsiblePersonId: searchParams.get('responsiblePersonId') || undefined,
    };

    const findings = await FindingService.getAll(filters);

    return NextResponse.json({ findings }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/findings:', error);
    return NextResponse.json(
      { error: 'Failed to get findings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/findings
 * Crea un nuevo hallazgo
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = 'current-user-id'; // TODO: Get from token
    const body = await request.json();

    const validationResult = findingFormDataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const findingId = await FindingService.create(
      { ...validationResult.data, sourceId: validationResult.data.sourceId || "", sourceName: validationResult.data.sourceName || "", riskLevel: validationResult.data.riskLevel || "low" },
      userId
    );

    return NextResponse.json(
      { message: 'Finding created successfully', id: findingId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/findings:', error);
    return NextResponse.json(
      { error: 'Failed to create finding' },
      { status: 500 }
    );
  }
}
