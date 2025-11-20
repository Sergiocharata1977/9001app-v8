import { OrganizationalStructureService } from '@/services/organizational-structure/OrganizationalStructureService';
import type {
    CreateOrganizationalStructureData,
    UpdateOrganizationalStructureData,
} from '@/types/organizational-structure';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/organizational-structure
 * Obtener la estructura organizacional vigente
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Obtener estructura específica por ID
      const structure = await OrganizationalStructureService.getById(id);
      if (!structure) {
        return NextResponse.json(
          { error: 'Estructura organizacional no encontrada' },
          { status: 404 }
        );
      }
      return NextResponse.json(structure);
    }

    // Obtener estructura vigente
    const structure = await OrganizationalStructureService.getCurrent();

    if (!structure) {
      return NextResponse.json(
        { error: 'No hay estructura organizacional definida' },
        { status: 404 }
      );
    }

    return NextResponse.json(structure);
  } catch (error) {
    console.error('[API] Error getting organizational structure:', error);
    return NextResponse.json(
      { error: 'Error al obtener estructura organizacional' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizational-structure
 * Crear nueva estructura organizacional
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body as CreateOrganizationalStructureData;

    const id = await OrganizationalStructureService.create(data);

    return NextResponse.json(
      { id, message: 'Estructura organizacional creada exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error creating organizational structure:', error);
    return NextResponse.json(
      { error: 'Error al crear estructura organizacional' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizational-structure
 * Actualizar estructura existente
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body as UpdateOrganizationalStructureData & { id: string };

    if (!id) {
      return NextResponse.json(
        { error: 'ID de la estructura es requerido' },
        { status: 400 }
      );
    }

    await OrganizationalStructureService.update(id, data);

    return NextResponse.json(
      { message: 'Estructura organizacional actualizada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error updating organizational structure:', error);
    return NextResponse.json(
      { error: 'Error al actualizar estructura organizacional' },
      { status: 500 }
    );
  }
}
