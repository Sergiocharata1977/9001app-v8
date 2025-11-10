// API endpoint for Don Cándido chat

import { ClaudeService } from '@/lib/claude/client';
import { PromptService } from '@/lib/claude/prompts';
import { ValidationService } from '@/lib/claude/validators';
import { errorLogger, ErrorSeverity } from '@/lib/utils/ErrorLogger';
import {
  checkRateLimit,
  createRateLimitResponse,
} from '@/lib/utils/rate-limiter';
import { sanitizeInput, sanitizeOutput } from '@/lib/utils/sanitization';
import { ChatSessionService } from '@/services/chat/ChatSessionService';
import { UserContextService } from '@/services/context/UserContextService';
import { UsageTrackingService } from '@/services/tracking/UsageTrackingService';
import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  mensaje: string;
  userId: string;
  sessionId: string;
  modulo?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Parse request body ONCE at the beginning
  let body: ChatRequest;
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

  const { mensaje, userId, sessionId, modulo } = body;

  try {
    // Validate required parameters
    if (!mensaje || !userId || !sessionId) {
      errorLogger.logError(
        'Missing required parameters',
        { userId, sessionId, operation: 'chat' },
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
        { userId, sessionId, operation: 'chat' },
        ErrorSeverity.WARNING
      );
      return createRateLimitResponse(rateLimit.resetIn);
    }

    // Sanitize input
    const mensajeSanitizado = sanitizeInput(mensaje);

    console.log('[API /claude/chat] Processing request:', {
      userId,
      sessionId,
      messageLength: mensajeSanitizado.length,
      rateLimitRemaining: rateLimit.remaining,
    });

    // Validate query is about ISO 9001
    const validacion = ValidationService.validarConsulta(mensajeSanitizado);
    if (!validacion.valida) {
      // Return rejection message without calling Claude
      return NextResponse.json({
        respuesta: validacion.respuesta,
        tokens: { input: 0, output: 0 },
        tiempo_respuesta_ms: Date.now() - startTime,
      });
    }

    // Get user context
    console.log('[API /claude/chat] Fetching user context...');
    const contexto = await UserContextService.getUserFullContext(userId);

    // Detect intent (optional - can be enabled/disabled)
    const ENABLE_INTENT_DETECTION =
      process.env.ENABLE_INTENT_DETECTION === 'true';
    let detectedIntent = null;

    if (ENABLE_INTENT_DETECTION) {
      const { IntentDetectionService } = await import(
        '@/lib/claude/intent-detection'
      );

      // Quick check if it's likely a form or action request
      const isLikelyForm =
        IntentDetectionService.isLikelyFormRequest(mensajeSanitizado);
      const isLikelyAction =
        IntentDetectionService.isLikelyActionRequest(mensajeSanitizado);

      if (isLikelyForm || isLikelyAction) {
        console.log('[API /claude/chat] Detecting intent...');
        detectedIntent = await IntentDetectionService.detectIntent(
          mensajeSanitizado,
          contexto
        );
        console.log('[API /claude/chat] Intent detected:', detectedIntent);
      }
    }

    // Generate contextual prompt
    const systemPrompt = modulo
      ? PromptService.generarPromptModulo(modulo, contexto)
      : PromptService.generarPromptDonCandidos(contexto);

    // Get session history (last 5 messages)
    const session = await ChatSessionService.getSession(sessionId);
    const historial = session?.mensajes.slice(-5) || [];

    // Prepare messages for Claude
    const mensajesClaude = [
      ...historial.map(msg => ({
        role:
          msg.tipo === 'usuario' ? ('user' as const) : ('assistant' as const),
        content: msg.contenido,
      })),
      {
        role: 'user' as const,
        content: mensajeSanitizado,
      },
    ];

    // Call Claude API
    console.log('[API /claude/chat] Calling Claude API...');
    const response = await ClaudeService.enviarMensaje(
      systemPrompt,
      mensajesClaude,
      2000
    );

    const tiempo_respuesta_ms = Date.now() - startTime;

    // Sanitize output
    const respuestaSanitizada = sanitizeOutput(response.content);

    // Save user message to session
    await ChatSessionService.agregarMensaje(sessionId, {
      tipo: 'usuario',
      contenido: mensajeSanitizado,
      via: 'texto',
    });

    // Save assistant message to session
    await ChatSessionService.agregarMensaje(sessionId, {
      tipo: 'asistente',
      contenido: respuestaSanitizada,
      via: 'texto',
      tokens: response.usage,
    });

    // Track usage
    await UsageTrackingService.registrar({
      userId,
      sessionId,
      tipoOperacion: 'chat',
      tokens: response.usage,
      metadata: {
        modulo: modulo || 'general',
        tiempo_respuesta_ms,
      },
    });

    // Log usage and performance
    errorLogger.logClaudeUsage(
      userId,
      response.usage.input,
      response.usage.output,
      UsageTrackingService.calcularCosto(
        response.usage.input,
        response.usage.output
      ),
      tiempo_respuesta_ms
    );

    console.log('[API /claude/chat] Request completed:', {
      tiempo_respuesta_ms,
      tokens: response.usage,
      rateLimitRemaining: rateLimit.remaining,
    });

    // Return response
    return NextResponse.json({
      respuesta: respuestaSanitizada,
      tokens: response.usage,
      tiempo_respuesta_ms,
      rateLimitRemaining: rateLimit.remaining,
      intent: detectedIntent, // Include detected intent if available
    });
  } catch (error) {
    const tiempo_respuesta_ms = Date.now() - startTime;

    // Use body variable (already parsed) instead of reading request.json() again
    errorLogger.logError(
      error as Error,
      {
        userId: userId || 'unknown',
        sessionId: sessionId || 'unknown',
        operation: 'chat',
        metadata: { tiempo_respuesta_ms },
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
