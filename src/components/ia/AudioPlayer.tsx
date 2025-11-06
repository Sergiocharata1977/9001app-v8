'use client';

import { Pause, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  text: string;
  voiceId?: string;
  autoPlay?: boolean;
}

export function AudioPlayer({
  text,
  voiceId,
  autoPlay = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async () => {
    if (isPlaying) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[AudioPlayer] Requesting audio...');

      const response = await fetch('/api/elevenlabs/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voiceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Error generating audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('[AudioPlayer] Audio received, playing...');

      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setError('Error al reproducir el audio');
        setIsPlaying(false);
        setIsLoading(false);
      };

      await audio.play();
    } catch (err) {
      console.error('[AudioPlayer] Error:', err);
      setError('Error al generar el audio');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoPlay && text) {
      playAudio();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [text, autoPlay]);

  return (
    <button
      type="button"
      onClick={playAudio}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-colors ${
        isPlaying
          ? 'bg-green-500 text-white hover:bg-green-600'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isPlaying ? 'Detener audio' : 'Escuchar respuesta'}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </button>
  );
}
