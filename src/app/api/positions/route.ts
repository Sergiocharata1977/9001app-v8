import { NextRequest, NextResponse } from 'next/server';
import { PositionService } from '@/services/rrhh/PositionService';
import { PositionFormData } from '@/types/rrhh';

// GET /api/positions - Lista todos los puestos con conteo de personal
export async function GET() {
  try {
    const positions = await PositionService.getAllWithPersonnelCount();
    return NextResponse.json(positions);
  } catch (error) {
    console.error('Error getting positions:', error);
    return NextResponse.json(
      { error: 'Error al obtener puestos' },
      { status: 500 }
    );
  }
}

// POST /api/positions - Crear nuevo puesto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.nombre || body.nombre.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del puesto es requerido' },
        { status: 400 }
      );
    }

    const data: PositionFormData = {
      nombre: body.nombre,
      descripcion_responsabilidades: body.descripcion_responsabilidades,
      requisitos_experiencia: body.requisitos_experiencia,
      requisitos_formacion: body.requisitos_formacion,
      departamento_id: body.departamento_id,
      reporta_a_id: body.reporta_a_id,
    };

    const id = await PositionService.create(data);
    
    return NextResponse.json({ id, message: 'Puesto creado exitosamente' }, { status: 201 });
  } catch (error) {
    console.error('Error creating position:', error);
    const message = error instanceof Error ? error.message : 'Error al crear puesto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
