// API endpoint for chat sessions management

import { ChatSessionService } from '@/services/chat/ChatSessionService';
import { UserContextService } from '@/services/context/UserContextService';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/ia/sessions - Get user's session history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const modulo = searchParams.get('modulo');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    console.log('[API /ia/sessions] Getting sessions for user:', userId, {
      limit,
      offset,
      search,
      modulo,
    });

    // Get sessions with filters
    const sessions = await ChatSessionService.getUserSessions(userId, {
      limit,
      offset,
      search,
      modulo,
    });

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error('[API /ia/sessions] Error:', error);
    return NextResponse.json(
      {
        error: 'Error getting sessions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/ia/sessions - Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tipo, modulo } = body;

    if (!userId || !tipo) {
      return NextResponse.json(
        { error: 'userId and tipo are required' },
        { status: 400 }
      );
    }

    console.log('[API /ia/sessions] Creating session:', {
      userId,
      tipo,
      modulo,
    });

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

    return NextResponse.json({
      success: true,
      sessionId,
      contexto,
    });
  } catch (error) {
    console.error('[API /ia/sessions] Error:', error);
    return NextResponse.json(
      {
        error: 'Error creating session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/ia/sessions - Delete session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'sessionId and userId are required' },
        { status: 400 }
      );
    }

    console.log('[API /ia/sessions] Deleting session:', sessionId);

    // Delete session
    await ChatSessionService.deleteSession(sessionId, userId);

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('[API /ia/sessions] Error:', error);
    return NextResponse.json(
      {
        error: 'Error deleting session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
