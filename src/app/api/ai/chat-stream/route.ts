// API endpoint for Don Cándido chat con streaming (para voz ElevenLabs)

import { AIMode, AIRouter } from '@/lib/ai/AIRouter';
import { PromptService } from '@/lib/claude/prompts';
import { ValidationService } from '@/lib/claude/validators';
import { errorLogger, ErrorSeverity } from '@/lib/utils/ErrorLogger';
import {
  checkRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limiter';
import { sanitizeInput } from '@/lib/utils/sanitization';
import { ChatSessionService } from '@/services/chat/ChatSessionService';
import { UserContextService } from '@/services/context/UserContextService';
import { UsageTrackingService } from '@/services/tracking/UsageTrackingService';
import { NextRequest, NextResponse } from 'next/server';

interface ChatStreamRequest {
  mensaje: string;
  userId: string;
  sessionId: string;
  modulo?: string;
  mode?: AIMode; // 'fast' (Groq) o 'quality' (Claude)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Parse request body
  let body: ChatStreamRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: 'Invalid request body',
        message: 'Failed to parse JSON',
      },
      { status: 400 }
    );
  }

  const { mensaje, userId, sessionId, modulo, mode = 'fast' } = body;

  try {
    // Validate required parameters
    if (!mensaje || !userId || !sessionId) {
      errorLogger.logError(
        'Missing required parameters',
        { userId, sessionId, operation: 'chat-stream' },
        ErrorSeverity.WARNING
      );
      return NextResponse.json(
        {
          error: 'Parámetros requeridos faltantes',
          details: {
            mensaje: !mensaje ? 'requerido' : 'ok',
            userId: !userId ? 'requerido' : 'ok',
            sessionId: !sessionId ? 'requerido' : 'ok',
          },
        },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      errorLogger.logError(
        'Rate limit exceeded',
        { userId, sessionId, operation: 'chat-stream' },
        ErrorSeverity.WARNING
      );
      return createRateLimitResponse(rateLimit.resetIn);
    }

    // Sanitize input
    const mensajeSanitizado = sanitizeInput(mensaje);

    const providerInfo = AIRouter.getProviderInfo(mode);
    console.log('[API /ai/chat-stream] Processing request:', {
      userId,
      sessionId,
      messageLength: mensajeSanitizado.length,
      mode,
      provider: providerInfo.provider,
      rateLimitRemaining: rateLimit.remaining,
    });

    // Validate query is about ISO 9001
    const validacion = ValidationService.validarConsulta(mensajeSanitizado);
    if (!validacion.valida) {
      // Return rejection message as stream
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(validacion.respuesta));
          controller.close();
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Provider': providerInfo.provider,
          'X-Mode': mode,
        },
      });
    }

    // Get user context
    console.log('[API /ai/chat-stream] Fetching user context...');
    const contexto = await UserContextService.getUserFullContext(userId);

    // Generate contextual prompt
    const systemPrompt = modulo
      ? PromptService.generarPromptModulo(modulo, contexto)
      : PromptService.generarPromptDonCandidos(contexto);

    // Get session history (last 5 messages)
    const session = await ChatSessionService.getSession(sessionId);
    const historial = session?.mensajes.slice(-5) || [];

    // Prepare messages for AI
    const mensajesAI = historial.map(msg => ({
      role: msg.tipo === 'usuario' ? ('user' as const) : ('assistant' as const),
      content: msg.contenido,
    }));

    // Save user message to session
    await ChatSessionService.agregarMensaje(sessionId, {
      tipo: 'usuario',
      contenido: mensajeSanitizado,
      via: 'voz',
    });

    // Call AI via AIRouter with streaming
    console.log(
      `[API /ai/chat-stream] Calling ${providerInfo.provider} API with streaming...`
    );
    const aiStream = await AIRouter.chatStream(
      mensajeSanitizado,
      mensajesAI,
      systemPrompt,
      mode
    );

    // Transform stream to accumulate full response for saving
    let fullResponse = '';
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Decode chunk
        const decoder = new TextDecoder();
        const text = decoder.decode(chunk);

        // Parse SSE format (Server-Sent Events)
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(chunk);
              }
            } catch {
              // Si no es JSON, pasar el chunk tal cual
              controller.enqueue(chunk);
            }
          } else if (line.trim()) {
            controller.enqueue(new TextEncoder().encode(line + '\n'));
          }
        }
      },
      async flush() {
        // Save assistant message to session when stream ends
        const tiempo_respuesta_ms = Date.now() - startTime;

        await ChatSessionService.agregarMensaje(sessionId, {
          tipo: 'asistente',
          contenido: fullResponse,
          via: 'voz',
          tokens: { input: 0, output: 0 },
        });

        // Track usage
        await UsageTrackingService.registrar({
          userId,
          sessionId,
          tipoOperacion: 'chat',
          tokens: { input: 0, output: 0 },
          metadata: {
            modulo: modulo || 'general',
            tiempo_respuesta_ms,
            provider: providerInfo.provider,
            mode,
          },
        });

        console.log('[API /ai/chat-stream] Stream completed:', {
          tiempo_respuesta_ms,
          provider: providerInfo.provider,
          mode,
          responseLength: fullResponse.length,
        });
      },
    });

    const outputStream = aiStream.pipeThrough(transformStream);

    return new NextResponse(outputStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Provider': providerInfo.provider,
        'X-Mode': mode,
      },
    });
  } catch (error) {
    const tiempo_respuesta_ms = Date.now() - startTime;

    errorLogger.logError(
      error as Error,
      {
        userId: userId || 'unknown',
        sessionId: sessionId || 'unknown',
        operation: 'chat-stream',
        metadata: { tiempo_respuesta_ms, mode },
      },
      ErrorSeverity.ERROR
    );

    const userFriendlyMessage = errorLogger.getUserFriendlyMessage(
      error as Error
    );

    return NextResponse.json(
      {
        error: userFriendlyMessage,
        tiempo_respuesta_ms,
      },
      { status: 500 }
    );
  }
}
