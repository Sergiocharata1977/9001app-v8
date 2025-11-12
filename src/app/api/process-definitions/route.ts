import { ProcessDefinitionService } from '@/services/processRecords/ProcessDefinitionService';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/process-definitions - Get all process definitions
export async function GET() {
  try {
    const definitions = await ProcessDefinitionService.getAllActive();
    return NextResponse.json(definitions);
  } catch (error) {
    console.error('Error getting process definitions:', error);
    return NextResponse.json(
      { error: 'Error al obtener definiciones de procesos' },
      { status: 500 }
    );
  }
}

// POST /api/process-definitions - Create or seed definitions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'seed') {
      await ProcessDefinitionService.seedDefaults();
      return NextResponse.json({
        message: 'Definiciones creadas exitosamente',
      });
    }

    if (body.action === 'create') {
      const {
        codigo,
        nombre,
        descripcion,
        objetivo,
        alcance,
        funciones_involucradas,
        categoria,
        documento_origen_id,
        etapas_default,
        activo,
      } = body;

      const id = await ProcessDefinitionService.create({
        codigo,
        nombre,
        descripcion,
        objetivo,
        alcance,
        funciones_involucradas,
        categoria,
        documento_origen_id,
        etapas_default,
        activo,
      });

      return NextResponse.json(
        { id, message: 'Definición creada exitosamente' },
        { status: 201 }
      );
    }

    if (body.action === 'update') {
      const { id, ...updateData } = body;
      await ProcessDefinitionService.update(id, updateData);
      return NextResponse.json({
        message: 'Definición actualizada exitosamente',
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}
