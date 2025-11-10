// API endpoint for specific session

import { ChatSessionService } from '@/services/chat/ChatSessionService';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    sessionId: string;
  }>;
}

// GET /api/ia/sessions/[sessionId] - Get specific session
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    console.log('[API /ia/sessions/[sessionId]] Getting session:', sessionId);

    // Get session
    const session = await ChatSessionService.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update last accessed time
    await ChatSessionService.updateLastAccessed(sessionId);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('[API /ia/sessions/[sessionId]] Error:', error);
    return NextResponse.json(
      {
        error: 'Error getting session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
