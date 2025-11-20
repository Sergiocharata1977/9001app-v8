import { SGCScopeService } from '@/services/sgc-scope/SGCScopeService';
import type {
    CreateSGCScopeData,
    UpdateSGCScopeData,
} from '@/types/sgc-scope';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/sgc-scope
 * Obtener el alcance vigente del SGC
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Obtener alcance específico por ID
      const scope = await SGCScopeService.getById(id);
      if (!scope) {
        return NextResponse.json(
          { error: 'Alcance del SGC no encontrado' },
          { status: 404 }
        );
      }
      return NextResponse.json(scope);
    }

    // Obtener alcance vigente
    const scope = await SGCScopeService.getCurrentScope();

    if (!scope) {
      return NextResponse.json(
        { error: 'No hay alcance del SGC definido' },
        { status: 404 }
      );
    }

    return NextResponse.json(scope);
  } catch (error) {
    console.error('[API] Error getting SGC scope:', error);
    return NextResponse.json(
      { error: 'Error al obtener alcance del SGC' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sgc-scope
 * Crear nuevo alcance del SGC
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body as CreateSGCScopeData;

    const id = await SGCScopeService.create(data);

    return NextResponse.json(
      { id, message: 'Alcance del SGC creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error creating SGC scope:', error);
    return NextResponse.json(
      { error: 'Error al crear alcance del SGC' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sgc-scope
 * Actualizar alcance existente
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body as UpdateSGCScopeData & { id: string };

    if (!id) {
      return NextResponse.json(
        { error: 'ID del alcance es requerido' },
        { status: 400 }
      );
    }

    await SGCScopeService.update(id, data);

    return NextResponse.json(
      { message: 'Alcance del SGC actualizado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error updating SGC scope:', error);
    return NextResponse.json(
      { error: 'Error al actualizar alcance del SGC' },
      { status: 500 }
    );
  }
}
