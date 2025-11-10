import { AuditFormSchema } from '@/lib/validations/audits';
import { AuditService } from '@/services/audits/AuditService';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/audits - Listar todas las auditorías
export async function GET() {
  try {
    const audits = await AuditService.getAll();

    // Serializar Timestamps a strings ISO (manejar datos antiguos y nuevos)
    const serializedAudits = audits.map(audit => {
      const serializeDate = (date: unknown): string => {
        if (!date) return new Date().toISOString();
        if (typeof date === 'string') return date;
        if (
          typeof date === 'object' &&
          date !== null &&
          'toDate' in date &&
          typeof date.toDate === 'function'
        ) {
          return date.toDate().toISOString();
        }
        if (date instanceof Date) return date.toISOString();
        return new Date().toISOString();
      };

      return {
        ...audit,
        plannedDate: serializeDate(audit.plannedDate),
        createdAt: serializeDate(audit.createdAt),
        updatedAt: serializeDate(audit.updatedAt),
      };
    });

    return NextResponse.json({ audits: serializedAudits });
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json(
      { error: 'Error al obtener auditorías' },
      { status: 500 }
    );
  }
}

// POST /api/audits - Crear nueva auditoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received audit data:', body);

    // Validar que plannedDate existe y es válido
    if (!body.plannedDate) {
      return NextResponse.json(
        { error: 'La fecha planificada es requerida' },
        { status: 400 }
      );
    }

    // Convertir plannedDate a Date object
    const plannedDate = new Date(body.plannedDate);
    if (isNaN(plannedDate.getTime())) {
      return NextResponse.json(
        { error: 'Fecha planificada inválida' },
        { status: 400 }
      );
    }

    // Validar datos con Zod
    const validatedData = AuditFormSchema.parse({
      ...body,
      plannedDate,
    });

    console.log('Validated data:', validatedData);

    // Crear auditoría en Firestore
    const auditId = await AuditService.create(validatedData);
    console.log('Created audit with ID:', auditId);

    return NextResponse.json(
      { id: auditId, message: 'Auditoría creada exitosamente' },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating audit:', error);

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
      { error: 'Error al crear auditoría' },
      { status: 500 }
    );
  }
}
