// API endpoint for managing chat sessions

import { NextRequest, NextResponse } from 'next/server';
import { UserContextService } from '@/services/context/UserContextService';
import { ChatSessionService } from '@/services/chat/ChatSessionService';
import { ChatSession } from '@/types/chat';

interface CreateSessionRequest {
  userId: string;
  tipo: ChatSession['tipo'];
  modulo?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CreateSessionRequest = await request.json();
    const { userId, tipo, modulo } = body;

    // Validate required parameters
    if (!userId || !tipo) {
      return NextResponse.json(
        {
          error: 'Parámetros requeridos faltantes',
          details: {
            userId: !userId ? 'requerido' : 'ok',
            tipo: !tipo ? 'requerido' : 'ok'
          }
        },
        { status: 400 }
      );
    }

    console.log('[API /ia/sessions] Creating session:', { userId, tipo, modulo });

    // Get user context
    const contexto = await UserContextService.getUserFullContext(userId);

    // Create session
    const sessionId = await ChatSessionService.createSession(
      userId,
      tipo,
      contexto,
      modulo
    );

    console.log('[API /ia/sessions] Session created:', sessionId);

    // Return session ID and context
    return NextResponse.json({
      sessionId,
      contexto
    });

  } catch (error) {
    console.error('[API /ia/sessions] Error:', error);

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requerido' },
        { status: 400 }
      );
    }

    console.log('[API /ia/sessions] Getting sessions for user:', userId);

    const sessions = await ChatSessionService.getUserSessions(userId, limit);

    return NextResponse.json({
      sessions,
      count: sessions.length
    });

  } catch (error) {
    console.error('[API /ia/sessions GET] Error:', error);

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
