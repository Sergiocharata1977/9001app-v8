// API endpoint for Don Cándido chat con AIRouter (Groq/Claude)

import { AIMode, AIRouter } from '@/lib/ai/AIRouter';
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
  mode?: AIMode; // 'fast' (Groq) o 'quality' (Claude)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Parse request body
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

  const { mensaje, userId, sessionId, modulo, mode = 'fast' } = body;

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

    const providerInfo = AIRouter.getProviderInfo(mode);
    console.log('[API /ai/chat] Processing request:', {
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
      // Return rejection message without calling AI
      return NextResponse.json({
        respuesta: validacion.respuesta,
        tokens: { input: 0, output: 0 },
        tiempo_respuesta_ms: Date.now() - startTime,
        provider: providerInfo.provider,
      });
    }

    // Get user context
    console.log('[API /ai/chat] Fetching user context...');
    const contexto = await UserContextService.getUserFullContext(userId);

    // Detect intent (optional)
    const ENABLE_INTENT_DETECTION =
      process.env.ENABLE_INTENT_DETECTION === 'true';
    let detectedIntent = null;

    if (ENABLE_INTENT_DETECTION) {
      const { IntentDetectionService } = await import(
        '@/lib/claude/intent-detection'
      );

      const isLikelyForm =
        IntentDetectionService.isLikelyFormRequest(mensajeSanitizado);
      const isLikelyAction =
        IntentDetectionService.isLikelyActionRequest(mensajeSanitizado);

      if (isLikelyForm || isLikelyAction) {
        console.log('[API /ai/chat] Detecting intent...');
        detectedIntent = await IntentDetectionService.detectIntent(
          mensajeSanitizado,
          contexto
        );
        console.log('[API /ai/chat] Intent detected:', detectedIntent);
      }
    }

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

    // Call AI via AIRouter
    console.log(`[API /ai/chat] Calling ${providerInfo.provider} API...`);
    const respuestaAI = await AIRouter.chat(
      mensajeSanitizado,
      mensajesAI,
      systemPrompt,
      mode
    );

    const tiempo_respuesta_ms = Date.now() - startTime;

    // Sanitize output
    const respuestaSanitizada = sanitizeOutput(respuestaAI);

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
      tokens: { input: 0, output: 0 }, // Groq no retorna tokens en la respuesta
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

    console.log('[API /ai/chat] Request completed:', {
      tiempo_respuesta_ms,
      provider: providerInfo.provider,
      mode,
      rateLimitRemaining: rateLimit.remaining,
    });

    // Return response
    return NextResponse.json({
      respuesta: respuestaSanitizada,
      tokens: { input: 0, output: 0 },
      tiempo_respuesta_ms,
      rateLimitRemaining: rateLimit.remaining,
      provider: providerInfo.provider,
      mode,
      intent: detectedIntent,
    });
  } catch (error) {
    const tiempo_respuesta_ms = Date.now() - startTime;

    errorLogger.logError(
      error as Error,
      {
        userId: userId || 'unknown',
        sessionId: sessionId || 'unknown',
        operation: 'chat',
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
