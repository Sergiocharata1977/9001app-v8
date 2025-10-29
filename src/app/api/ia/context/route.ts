// API endpoint for getting user context

import { NextRequest, NextResponse } from 'next/server';
import { UserContextService } from '@/services/context/UserContextService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const light = searchParams.get('light') === 'true';

    // Validate userId parameter
    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }

    console.log('[API /ia/context] Getting context for user:', userId, {
      light,
    });

    // Get context (light or full)
    const contexto = light
      ? await UserContextService.getUserContextLight(userId)
      : await UserContextService.getUserFullContext(userId);

    return NextResponse.json({ contexto });
  } catch (error) {
    console.error('[API /ia/context] Error:', error);

    // Check if it's a user not found error
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          error: 'Usuario no encontrado',
          message: error.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST endpoint to refresh context (invalidate cache)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId requerido' }, { status: 400 });
    }

    console.log('[API /ia/context] Refreshing context for user:', userId);

    // Refresh context (invalidates cache)
    const contexto = await UserContextService.refreshContext(userId);

    return NextResponse.json({
      contexto,
      refreshed: true,
    });
  } catch (error) {
    console.error('[API /ia/context POST] Error:', error);

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
