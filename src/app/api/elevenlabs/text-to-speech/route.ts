// API endpoint for ElevenLabs Text-to-Speech

import { ElevenLabsService } from '@/lib/elevenlabs/client';
import { NextRequest, NextResponse } from 'next/server';

interface TTSRequest {
  text: string;
  voiceId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, voiceId } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log(
      '[API /elevenlabs/text-to-speech] Converting text to speech...'
    );
    console.log('[API /elevenlabs/text-to-speech] Text length:', text.length);

    // Convert text to speech
    const audioBuffer = await ElevenLabsService.textToSpeech({
      text,
      voiceId,
    });

    // Return audio as response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('[API /elevenlabs/text-to-speech] Error:', error);

    return NextResponse.json(
      {
        error: 'Error generating speech',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
