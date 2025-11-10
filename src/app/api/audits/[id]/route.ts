import { AuditFormSchema } from '@/lib/validations/audits';
import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/audits/[id] - Obtener auditoría por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const audit = await AuditService.getById(id);

    if (!audit) {
      return NextResponse.json(
        { error: 'Auditoría no encontrada' },
        { status: 404 }
      );
    }

    // Serializar Timestamps a strings ISO
    const serializedAudit = {
      ...audit,
      plannedDate: audit.plannedDate.toDate().toISOString(),
      createdAt: audit.createdAt.toDate().toISOString(),
      updatedAt: audit.updatedAt.toDate().toISOString(),
    };

    return NextResponse.json({ audit: serializedAudit });
  } catch (error) {
    console.error('Error fetching audit:', error);
    return NextResponse.json(
      { error: 'Error al obtener auditoría' },
      { status: 500 }
    );
  }
}

// PUT /api/audits/[id] - Actualizar auditoría
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validar datos
    const validatedData = AuditFormSchema.partial().parse({
      ...body,
      plannedDate: body.plannedDate ? new Date(body.plannedDate) : undefined,
    });

    await AuditService.update(id, validatedData);

    return NextResponse.json({ message: 'Auditoría actualizada exitosamente' });
  } catch (error: unknown) {
    console.error('Error updating audit:', error);

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
      { error: 'Error al actualizar auditoría' },
      { status: 500 }
    );
  }
}

// DELETE /api/audits/[id] - Eliminar auditoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await AuditService.delete(id);
    return NextResponse.json({ message: 'Auditoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting audit:', error);
    return NextResponse.json(
      { error: 'Error al eliminar auditoría' },
      { status: 500 }
    );
  }
}
