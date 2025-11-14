/**
 * Router de IA - Permite elegir entre diferentes proveedores de IA
 * según el caso de uso (velocidad vs calidad)
 */

import { ClaudeService } from '@/lib/claude/client';
import { GroqMessage, GroqService } from '@/lib/groq/GroqService';

export type AIProvider = 'groq' | 'claude';
export type AIMode = 'fast' | 'quality';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIRouter {
  /**
   * Determinar qué proveedor usar según el modo
   */
  private static getProvider(mode: AIMode): AIProvider {
    // Por defecto, usar Groq para velocidad
    const defaultProvider =
      (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'groq';

    if (mode === 'fast') {
      return 'groq'; // Siempre Groq para respuestas rápidas
    }

    if (mode === 'quality') {
      return 'claude'; // Claude para análisis complejos
    }

    return defaultProvider;
  }

  /**
   * Enviar mensaje con streaming
   */
  static async chatStream(
    mensaje: string,
    historial: AIMessage[] = [],
    systemPrompt?: string,
    mode: AIMode = 'fast'
  ): Promise<ReadableStream> {
    const provider = this.getProvider(mode);

    console.log(`[AIRouter] Usando ${provider} en modo ${mode}`);

    if (provider === 'groq') {
      const groqHistorial: GroqMessage[] = historial.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      return GroqService.enviarMensajeStream(
        mensaje,
        groqHistorial,
        systemPrompt
      );
    } else {
      // Claude no tiene streaming nativo, convertir respuesta a stream
      const claudeHistorial = historial
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      const response = await ClaudeService.enviarMensaje(
        systemPrompt || '',
        claudeHistorial,
        2000
      );

      // Convertir respuesta a stream
      const encoder = new TextEncoder();
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(response.content));
          controller.close();
        },
      });
    }
  }

  /**
   * Enviar mensaje sin streaming (respuesta completa)
   */
  static async chat(
    mensaje: string,
    historial: AIMessage[] = [],
    systemPrompt?: string,
    mode: AIMode = 'fast'
  ): Promise<string> {
    const provider = this.getProvider(mode);

    console.log(`[AIRouter] Usando ${provider} en modo ${mode}`);

    if (provider === 'groq') {
      const groqHistorial: GroqMessage[] = historial.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      return GroqService.enviarMensaje(mensaje, groqHistorial, systemPrompt);
    } else {
      // Claude
      const claudeHistorial = historial
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      const response = await ClaudeService.enviarMensaje(
        systemPrompt || '',
        claudeHistorial,
        2000
      );

      return response.content;
    }
  }

  /**
   * Obtener información del proveedor actual
   */
  static getProviderInfo(mode: AIMode): {
    provider: AIProvider;
    latency: string;
    cost: string;
    quality: string;
  } {
    const provider = this.getProvider(mode);

    if (provider === 'groq') {
      return {
        provider: 'groq',
        latency: '2-3 segundos',
        cost: 'Muy bajo',
        quality: 'Alta',
      };
    } else {
      return {
        provider: 'claude',
        latency: '20-30 segundos',
        cost: 'Alto',
        quality: 'Muy alta',
      };
    }
  }

  /**
   * Verificar si un proveedor está disponible
   */
  static isProviderAvailable(provider: AIProvider): boolean {
    if (provider === 'groq') {
      return !!process.env.GROQ_API_KEY;
    } else if (provider === 'claude') {
      return !!process.env.ANTHROPIC_API_KEY;
    }
    return false;
  }

  /**
   * Obtener lista de proveedores disponibles
   */
  static getAvailableProviders(): AIProvider[] {
    const providers: AIProvider[] = [];

    if (this.isProviderAvailable('groq')) {
      providers.push('groq');
    }

    if (this.isProviderAvailable('claude')) {
      providers.push('claude');
    }

    return providers;
  }
}

export type { AIMessage };
