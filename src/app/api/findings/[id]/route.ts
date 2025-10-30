import { findingFormDataSchema } from '@/lib/validations/findings';
import { FindingService } from '@/services/findings/FindingService';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/findings/[id]
 * Obtiene un hallazgo por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const finding = await FindingService.getById(id);

    if (!finding) {
      return NextResponse.json({ error: 'Finding not found' }, { status: 404 });
    }

    return NextResponse.json({ finding }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/findings/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to get finding' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/findings/[id]
 * Actualiza un hallazgo
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = 'current-user-id'; // TODO: Get from token
    const body = await request.json();

    const validationResult = findingFormDataSchema.partial().safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await FindingService.update(id, validationResult.data, userId);

    return NextResponse.json(
      { message: 'Finding updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/findings/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update finding' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/findings/[id]
 * Elimina un hallazgo (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = 'current-user-id'; // TODO: Get from token

    await FindingService.delete(id, userId);

    return NextResponse.json(
      { message: 'Finding deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/findings/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete finding' },
      { status: 500 }
    );
  }
}
