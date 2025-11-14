/**
 * Servicio para integración con Groq AI
 * Groq ofrece inferencia ultra-rápida de modelos LLM (2-3 segundos vs 28 de Claude)
 * Compatible con API de OpenAI
 */

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChatRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GroqService {
  private static readonly API_URL =
    'https://api.groq.com/openai/v1/chat/completions';
  private static readonly DEFAULT_MODEL = 'llama-3.3-70b-versatile'; // Más nuevo y potente (Nov 2024)
  // Otros modelos disponibles:
  // - 'llama-3.1-70b-versatile' (anterior, también bueno)
  // - 'llama-3.1-8b-instant' (más rápido, menos capaz)
  // - 'mixtral-8x7b-32768' (buen balance)
  // - 'gemma2-9b-it' (alternativa)

  /**
   * Enviar mensaje a Groq con streaming
   */
  static async enviarMensajeStream(
    mensajeUsuario: string,
    historialConversacion: GroqMessage[] = [],
    systemPrompt?: string
  ): Promise<ReadableStream> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error(
        'GROQ_API_KEY no está configurada en las variables de entorno'
      );
    }

    // Construir mensajes
    const messages: GroqMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Agregar historial
    messages.push(...historialConversacion);

    // Agregar mensaje actual
    messages.push({
      role: 'user',
      content: mensajeUsuario,
    });

    const requestBody: GroqChatRequest = {
      model: this.DEFAULT_MODEL,
      messages,
      temperature: 0.8, // Más creatividad y naturalidad
      max_tokens: 3000, // Más espacio para respuestas detalladas
      top_p: 0.95, // Mejor balance entre coherencia y variedad
      stream: true,
    };

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error de Groq API: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error('No se recibió stream de respuesta');
    }

    return response.body;
  }

  /**
   * Enviar mensaje a Groq sin streaming (respuesta completa)
   */
  static async enviarMensaje(
    mensajeUsuario: string,
    historialConversacion: GroqMessage[] = [],
    systemPrompt?: string
  ): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error(
        'GROQ_API_KEY no está configurada en las variables de entorno'
      );
    }

    // Construir mensajes
    const messages: GroqMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Agregar historial
    messages.push(...historialConversacion);

    // Agregar mensaje actual
    messages.push({
      role: 'user',
      content: mensajeUsuario,
    });

    const requestBody: GroqChatRequest = {
      model: this.DEFAULT_MODEL,
      messages,
      temperature: 0.8, // Más creatividad y naturalidad (0.7 -> 0.8)
      max_tokens: 3000, // Más espacio para respuestas detalladas (2048 -> 3000)
      top_p: 0.95, // Mejor balance entre coherencia y variedad
      stream: false,
    };

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error de Groq API: ${response.status} - ${error}`);
    }

    const data: GroqChatResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No se recibió respuesta de Groq');
    }

    return data.choices[0].message.content;
  }

  /**
   * Convertir historial de Claude a formato Groq
   */
  static convertirHistorialClaudeAGroq(
    historialClaude: Array<{ role: string; content: string }>
  ): GroqMessage[] {
    return historialClaude.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));
  }

  /**
   * Obtener información de uso (tokens)
   */
  static async obtenerUso(): Promise<{
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }> {
    // Groq no tiene endpoint de uso, retornar estimado
    return {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
  }
}

export type { GroqChatRequest, GroqChatResponse, GroqMessage };
