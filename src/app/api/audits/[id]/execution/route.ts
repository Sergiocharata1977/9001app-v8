import { AuditExecutionSchema } from '@/lib/validations/audits';
import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/audits/[id]/execution - Actualizar ejecución de auditoría
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = AuditExecutionSchema.parse(body);

    await AuditService.updateExecution(id, validatedData);

    return NextResponse.json({
      message: 'Ejecución actualizada exitosamente',
    });
  } catch (error: unknown) {
    console.error('Error updating audit execution:', error);

    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError'
    ) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: 'errors' in error ? error.errors : [],
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar ejecución' },
      { status: 500 }
    );
  }
}
