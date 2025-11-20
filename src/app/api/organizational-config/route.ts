import { OrganizationalConfigService } from '@/services/organizational-config/OrganizationalConfigService';
import type {
    CreateOrganizationalConfigData,
    UpdateOrganizationalConfigData,
} from '@/types/organizational-config';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/organizational-config
 * Obtener la configuración organizacional única
 */
export async function GET() {
  try {
    const config = await OrganizationalConfigService.getConfig();

    if (!config) {
      return NextResponse.json(
        { error: 'Configuración organizacional no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('[API] Error getting organizational config:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración organizacional' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizational-config
 * Crear o actualizar la configuración organizacional
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body as CreateOrganizationalConfigData;

    await OrganizationalConfigService.createOrUpdate(data);

    return NextResponse.json(
      { message: 'Configuración organizacional guardada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error creating/updating organizational config:', error);
    return NextResponse.json(
      { error: 'Error al guardar configuración organizacional' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/organizational-config
 * Actualizar configuración existente
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const data = body as UpdateOrganizationalConfigData;

    await OrganizationalConfigService.update(data);

    return NextResponse.json(
      { message: 'Configuración organizacional actualizada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error updating organizational config:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuración organizacional' },
      { status: 500 }
    );
  }
}
