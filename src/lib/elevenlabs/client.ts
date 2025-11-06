// ElevenLabs API Client for Text-to-Speech

export interface ElevenLabsConfig {
  apiKey: string;
  voiceId?: string;
}

export interface TextToSpeechOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

export class ElevenLabsService {
  private static apiKey: string | null = null;
  private static defaultVoiceId: string = 'kulszILr6ees0ArU8miO'; // Don Candido I (custom voice)

  /**
   * Initialize ElevenLabs client
   */
  private static initialize(): void {
    if (this.apiKey) {
      return;
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not set');
    }

    this.apiKey = apiKey;
    console.log('[ElevenLabsService] Initialized');
  }

  /**
   * Convert text to speech
   */
  static async textToSpeech(
    options: TextToSpeechOptions
  ): Promise<ArrayBuffer> {
    this.initialize();

    const {
      text,
      voiceId = this.defaultVoiceId,
      modelId = 'eleven_multilingual_v2',
      stability = 0.5,
      similarityBoost = 0.75,
    } = options;

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    try {
      console.log('[ElevenLabsService] Converting text to speech...');
      console.log('[ElevenLabsService] Text length:', text.length);
      console.log('[ElevenLabsService] Voice ID:', voiceId);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey!,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs API Error: ${response.status} ${error}`);
      }

      const audioBuffer = await response.arrayBuffer();
      console.log(
        '[ElevenLabsService] Audio generated:',
        audioBuffer.byteLength,
        'bytes'
      );

      return audioBuffer;
    } catch (error) {
      console.error('[ElevenLabsService] Error:', error);
      throw error;
    }
  }

  /**
   * Get available voices
   */
  static async getVoices(): Promise<unknown[]> {
    this.initialize();

    const url = 'https://api.elevenlabs.io/v1/voices';

    try {
      const response = await fetch(url, {
        headers: {
          'xi-api-key': this.apiKey!,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('[ElevenLabsService] Error getting voices:', error);
      throw error;
    }
  }

  /**
   * Set default voice ID
   */
  static setDefaultVoice(voiceId: string): void {
    this.defaultVoiceId = voiceId;
  }
}
