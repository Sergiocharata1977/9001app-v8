import { OrganizationalContextService } from '@/services/organizational-context/OrganizationalContextService';
import type {
    CreateOrganizationalContextData,
    UpdateOrganizationalContextData,
} from '@/types/organizational-context';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/organizational-context
 * Obtener el contexto organizacional vigente
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Obtener contexto específico por ID
      const context = await OrganizationalContextService.getById(id);
      if (!context) {
        return NextResponse.json(
          { error: 'Contexto organizacional no encontrado' },
          { status: 404 }
        );
      }
      return NextResponse.json(context);
    }

    // Obtener contexto vigente
    const context = await OrganizationalContextService.getCurrent();

    if (!context) {
      return NextResponse.json(
        { error: 'No hay contexto organizacional definido' },
        { status: 404 }
      );
    }

    return NextResponse.json(context);
  } catch (error) {
    console.error('[API] Error getting organizational context:', error);
    return NextResponse.json(
      { error: 'Error al obtener contexto organizacional' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizational-context
 * Crear nuevo contexto organizacional
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body as CreateOrganizationalContextData;

    const id = await OrganizationalContextService.create(data);

    return NextResponse.json(
      { id, message: 'Contexto organizacional creado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error creating organizational context:', error);
    return NextResponse.json(
      { error: 'Error al crear contexto organizacional' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizational-context
 * Actualizar contexto existente
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body as UpdateOrganizationalContextData & { id: string };

    if (!id) {
      return NextResponse.json(
        { error: 'ID del contexto es requerido' },
        { status: 400 }
      );
    }

    await OrganizationalContextService.update(id, data);

    return NextResponse.json(
      { message: 'Contexto organizacional actualizado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error updating organizational context:', error);
    return NextResponse.json(
      { error: 'Error al actualizar contexto organizacional' },
      { status: 500 }
    );
  }
}
