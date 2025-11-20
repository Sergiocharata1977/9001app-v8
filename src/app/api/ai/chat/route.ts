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
import { DirectActionService } from '@/services/direct-actions';
import { DirectActionRequest } from '@/types/direct-actions';
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

    // --- FORM HANDLING LOGIC ---

    // 1. Check if user wants to start a form
    if (mensajeSanitizado.startsWith('/form ')) {
      const formType = mensajeSanitizado.replace('/form ', '').trim();
      const { ConversationalFormService } = await import(
        '@/services/forms/ConversationalFormService'
      );
      const { getFormDefinition } = await import(
        '@/config/conversational-forms'
      );

      const formDef = getFormDefinition(formType);

      if (formDef) {
        // Initialize form
        const formState = ConversationalFormService.initializeForm(formType);

        // Update session type and state
        // Note: We would need a method to update session type, but for now we'll just update the state
        // and treat it as a form session if form_state is present
        await ChatSessionService.updateFormState(sessionId, formState);

        // Get first question
        const question = ConversationalFormService.getNextQuestion(formState);
        const responseText = `📋 **Iniciando formulario: ${formDef.title}**\n\n${formDef.description}\n\n${question}`;

        // Save user message
        await ChatSessionService.agregarMensaje(sessionId, {
          tipo: 'usuario',
          contenido: mensajeSanitizado,
          via: 'texto',
        });

        // Save assistant response
        await ChatSessionService.agregarMensaje(sessionId, {
          tipo: 'asistente',
          contenido: responseText,
          via: 'texto',
          tokens: { input: 0, output: 0 },
        });

        return NextResponse.json({
          respuesta: responseText,
          tokens: { input: 0, output: 0 },
          tiempo_respuesta_ms: Date.now() - startTime,
          provider: 'system',
          mode,
        });
      }
    }

    // 2. Check if we are in an active form session
    if (session?.form_state && !session.form_state.isComplete) {
      const { ConversationalFormService } = await import(
        '@/services/forms/ConversationalFormService'
      );

      // Process user response
      const result = await ConversationalFormService.processResponse(
        session.form_state,
        mensajeSanitizado
      );

      // Update form state in DB
      await ChatSessionService.updateFormState(sessionId, result.updatedState);

      let responseText = '';

      if (result.isValid) {
        if (result.updatedState.isComplete) {
          // Form completed!
          responseText = `✅ **¡Formulario completado!**\n\nHe registrado la siguiente información:\n\n\`\`\`json\n${JSON.stringify(result.updatedState.collectedData, null, 2)}\n\`\`\`\n\n(En una versión futura, esto se guardaría en la base de datos)`;
          // TODO: Save to actual collection
        } else {
          // Ask next question
          const nextQuestion = ConversationalFormService.getNextQuestion(
            result.updatedState
          );
          responseText = `✅ Entendido.\n\n${nextQuestion}`;
        }
      } else {
        // Invalid response, ask again with feedback
        responseText = `⚠️ ${result.feedback}\n\n${ConversationalFormService.getNextQuestion(result.updatedState)}`;
      }

      // Save messages
      await ChatSessionService.agregarMensaje(sessionId, {
        tipo: 'usuario',
        contenido: mensajeSanitizado,
        via: 'texto',
      });

      await ChatSessionService.agregarMensaje(sessionId, {
        tipo: 'asistente',
        contenido: responseText,
        via: 'texto',
        tokens: { input: 0, output: 0 },
      });

      return NextResponse.json({
        respuesta: responseText,
        tokens: { input: 0, output: 0 },
        tiempo_respuesta_ms: Date.now() - startTime,
        provider: 'groq-form',
        mode,
      });
    }

    // --- END FORM HANDLING LOGIC ---

    // --- DIRECT ACTION HANDLING LOGIC ---

    // Check if user wants to execute a direct action
    if (mensajeSanitizado.startsWith('/action ')) {
      try {
        const actionCommand = mensajeSanitizado.replace('/action ', '').trim();

        // Parse action command (simple format: "type:entity:entityId:data")
        // Example: "complete:audit:AUD-2024-001"
        // Example: "assign:action:AC-2024-015:juan.perez@empresa.com"

        const parts = actionCommand.split(':');
        if (parts.length < 3) {
          const responseText =
            '⚠️ Formato de acción inválido. Usa: /action tipo:entidad:id[:datos]';

          await ChatSessionService.agregarMensaje(sessionId, {
            tipo: 'usuario',
            contenido: mensajeSanitizado,
            via: 'texto',
          });

          await ChatSessionService.agregarMensaje(sessionId, {
            tipo: 'asistente',
            contenido: responseText,
            via: 'texto',
            tokens: { input: 0, output: 0 },
          });

          return NextResponse.json({
            respuesta: responseText,
            tokens: { input: 0, output: 0 },
            tiempo_respuesta_ms: Date.now() - startTime,
            provider: 'system',
            mode,
          });
        }

        const actionType = parts[0] as any;
        const entity = parts[1] as any;
        const entityId = parts[2];
        const dataStr = parts[3];

        // Build action request
        const actionRequest: DirectActionRequest = {
          type: actionType,
          entity,
          entityId,
          data: dataStr ? JSON.parse(dataStr) : {},
          reason: `Solicitado por usuario en sesión de chat`,
        };

        // Create action request
        const actionResponse = await DirectActionService.createActionRequest(
          userId,
          sessionId,
          actionRequest
        );

        const responseText = `${actionResponse.message}\n\n**ID de Acción:** \`${actionResponse.actionId}\`\n\nPara confirmar, usa: /confirm ${actionResponse.actionId}`;

        await ChatSessionService.agregarMensaje(sessionId, {
          tipo: 'usuario',
          contenido: mensajeSanitizado,
          via: 'texto',
        });

        await ChatSessionService.agregarMensaje(sessionId, {
          tipo: 'asistente',
          contenido: responseText,
          via: 'texto',
          tokens: { input: 0, output: 0 },
        });

        return NextResponse.json({
          respuesta: responseText,
          tokens: { input: 0, output: 0 },
          tiempo_respuesta_ms: Date.now() - startTime,
          provider: 'system',
          mode,
          actionId: actionResponse.actionId,
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Error desconocido';
        const responseText = `❌ Error al procesar la acción: ${errorMsg}`;

        await ChatSessionService.agregarMensaje(sessionId, {
          tipo: 'usuario',
          contenido: mensajeSanitizado,
          via: 'texto',
        });

        await ChatSessionService.agregarMensaje(sessionId, {
          tipo: 'asistente',
          contenido: responseText,
          via: 'texto',
          tokens: { input: 0, output: 0 },
        });

        return NextResponse.json({
          respuesta: responseText,
          tokens: { input: 0, output: 0 },
          tiempo_respuesta_ms: Date.now() - startTime,
          provider: 'system',
          mode,
        });
      }
    }

    // Check if user is confirming an action
    if (mensajeSanitizado.startsWith('/confirm ')) {
      try {
        const actionId = mensajeSanitizado.replace('/confirm ', '').trim();

        const result = await DirectActionService.confirmAndExecuteAction(
          actionId,
          userId,
          true
        );

        const responseText = result.success
          ? `✅ ${result.message}`
          : `❌ ${result.message}`;

        await ChatSessionService.agregarMensaje(sessionId, {
          tipo: 'usuario',
          contenido: mensajeSanitizado,
          via: 'texto',
        });

        await ChatSessionService.agregarMensaje(sessionId, {
          tipo: 'asistente',
          contenido: responseText,
          via: 'texto',
          tokens: { input: 0, output: 0 },
        });

        return NextResponse.json({
          respuesta: responseText,
          tokens: { input: 0, output: 0 },
          tiempo_respuesta_ms: Date.now() - startTime,
          provider: 'system',
          mode,
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Error desconocido';
        const responseText = `❌ Error al confirmar la acción: ${errorMsg}`;

        await ChatSessionService.agregarMensaje(sessionId, {
          tipo: 'usuario',
          contenido: mensajeSanitizado,
          via: 'texto',
        });

        await ChatSessionService.agregarMensaje(sessionId, {
          tipo: 'asistente',
          contenido: responseText,
          via: 'texto',
          tokens: { input: 0, output: 0 },
        });

        return NextResponse.json({
          respuesta: responseText,
          tokens: { input: 0, output: 0 },
          tiempo_respuesta_ms: Date.now() - startTime,
          provider: 'system',
          mode,
        });
      }
    }

    // --- END DIRECT ACTION HANDLING LOGIC ---

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

    // Generate title for new sessions (first user message)
    if (session && session.mensajes.length === 0 && !session.titulo) {
      console.log('[API /ai/chat] Generating title for new session...');
      try {
        const { generateSessionTitle } = await import(
          '@/services/chat/TitleGeneratorService'
        );
        const titulo = await generateSessionTitle(mensajeSanitizado);
        await ChatSessionService.updateSessionTitle(sessionId, titulo);
        console.log('[API /ai/chat] Title generated:', titulo);
      } catch (error) {
        console.error('[API /ai/chat] Error generating title:', error);
        // Don't fail the request if title generation fails
      }
    }

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
