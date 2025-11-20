// Service for generating session titles using Groq AI

import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate a short, descriptive title for a chat session
 * based on the first user message
 */
export async function generateSessionTitle(
  firstUserMessage: string
): Promise<string> {
  try {
    console.log(
      '[TitleGenerator] Generating title for message:',
      firstUserMessage.substring(0, 50)
    );

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // Fast and free model
      messages: [
        {
          role: 'system',
          content: `Eres un asistente que genera títulos cortos y descriptivos para conversaciones.
Genera un título de máximo 6 palabras que resuma el tema principal del mensaje del usuario.
El título debe ser claro, conciso y en español.
Solo responde con el título, sin comillas ni puntuación adicional.`,
        },
        {
          role: 'user',
          content: `Genera un título corto para esta consulta: "${firstUserMessage}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 20,
    });

    const title =
      completion.choices[0]?.message?.content?.trim() ||
      'Conversación sin título';

    console.log('[TitleGenerator] Generated title:', title);

    return title;
  } catch (error) {
    console.error('[TitleGenerator] Error generating title:', error);
    // Fallback: Use first 50 chars of message
    return firstUserMessage.substring(0, 50) + '...';
  }
}

/**
 * Generate tags for a chat session based on the conversation content
 */
export async function generateSessionTags(
  messages: string[]
): Promise<string[]> {
  try {
    const conversationSummary = messages.slice(0, 5).join('\n');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente que identifica temas clave en conversaciones sobre ISO 9001.
Genera una lista de 3-5 tags relevantes separados por comas.
Los tags deben ser palabras clave en español relacionadas con ISO 9001, calidad, procesos, etc.
Solo responde con los tags separados por comas, sin numeración ni puntos.`,
        },
        {
          role: 'user',
          content: `Identifica los temas clave en esta conversación:\n${conversationSummary}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const tagsString = completion.choices[0]?.message?.content?.trim() || '';
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5);

    console.log('[TitleGenerator] Generated tags:', tags);

    return tags;
  } catch (error) {
    console.error('[TitleGenerator] Error generating tags:', error);
    return [];
  }
}
