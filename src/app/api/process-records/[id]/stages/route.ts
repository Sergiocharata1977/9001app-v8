import { processRecordStageSchema } from '@/lib/validations/processRecords';
import { ProcessRecordStageService } from '@/services/processRecords/ProcessRecordStageService';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/process-records/[id]/stages - Get all stages for a process record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stages = await ProcessRecordStageService.getByProcessRecordId(id);
    return NextResponse.json(stages);
  } catch (error) {
    console.error('Error getting stages:', error);
    return NextResponse.json(
      { error: 'Error al obtener etapas' },
      { status: 500 }
    );
  }
}

// POST /api/process-records/[id]/stages - Create new stage
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = processRecordStageSchema.parse(body);

    const stageId = await ProcessRecordStageService.create(id, validatedData);

    return NextResponse.json(
      { id: stageId, message: 'Etapa creada exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating stage:', error);
    const message =
      error instanceof Error ? error.message : 'Error al crear etapa';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/process-records/[id]/stages - Reorder stages
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { stages } = body;

    if (!Array.isArray(stages)) {
      return NextResponse.json(
        { error: 'Se requiere un array de etapas' },
        { status: 400 }
      );
    }

    await ProcessRecordStageService.reorder(stages);

    return NextResponse.json({ message: 'Etapas reordenadas exitosamente' });
  } catch (error) {
    console.error('Error reordering stages:', error);
    return NextResponse.json(
      { error: 'Error al reordenar etapas' },
      { status: 500 }
    );
  }
}
