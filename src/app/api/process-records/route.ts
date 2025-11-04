import { processRecordSchema } from '@/lib/validations/processRecords';
import { ProcessRecordService } from '@/services/processRecords/ProcessRecordService';
import { ProcessRecordStageService } from '@/services/processRecords/ProcessRecordStageService';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/process-records - Get all process records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const definitionId = searchParams.get('definition_id');

    let records;

    if (status) {
      records = await ProcessRecordService.getByStatus(status as any);
    } else if (definitionId) {
      records = await ProcessRecordService.getByDefinitionId(definitionId);
    } else {
      records = await ProcessRecordService.getAll();
    }

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error getting process records:', error);
    return NextResponse.json(
      { error: 'Error al obtener registros de procesos' },
      { status: 500 }
    );
  }
}

// POST /api/process-records - Create new process record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate data
    const validatedData = processRecordSchema.parse({
      ...body,
      fecha_inicio: new Date(body.fecha_inicio),
    });

    // Get user ID from session (you'll need to implement this)
    const userId = body.created_by || 'system';

    // Create process record
    const recordId = await ProcessRecordService.create(validatedData, userId);

    // Create default stages if provided
    if (body.etapas_default && Array.isArray(body.etapas_default)) {
      await ProcessRecordStageService.createFromDefaults(
        recordId,
        body.etapas_default
      );
    }

    return NextResponse.json(
      { id: recordId, message: 'Registro de proceso creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating process record:', error);
    const message =
      error instanceof Error ? error.message : 'Error al crear registro';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
