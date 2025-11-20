'use client';

import { Loader2, Mic, Square } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  onRecordingStart?: () => void;
  onRecordingEnd?: () => void;
  onTranscriptionStart?: () => void;
  onTranscriptionEnd?: () => void;
  onListeningChange?: (isListening: boolean) => void;
}

interface TranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  latencyMs?: number;
}

export function VoiceRecorder({
  onTranscript,
  disabled,
  onRecordingStart,
  onRecordingEnd,
  onTranscriptionStart,
  onTranscriptionEnd,
  onListeningChange,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      'MediaRecorder' in window &&
      'navigator' in window &&
      'mediaDevices' in navigator
    );
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecordingAndTranscribe = useCallback(async () => {
    if (!mediaRecorderRef.current || !streamRef.current) return;

    try {
      // Stop recording
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());

      setIsRecording(false);
      onListeningChange?.(false);
      onRecordingEnd?.();

      console.log(
        '[VoiceRecorder] Recording stopped, starting transcription...'
      );
    } catch (error) {
      console.error('[VoiceRecorder] Error stopping recording:', error);
      setIsRecording(false);
      onListeningChange?.(false);
      onRecordingEnd?.();
    }
  }, [onRecordingEnd, onListeningChange]);

  const startRecording = useCallback(async () => {
    if (disabled || !isSupported) return;

    try {
      console.log('[VoiceRecorder] Requesting microphone access...');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Optimal for Whisper
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus', // Compatible with Whisper
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available (audio chunks)
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        try {
          setIsTranscribing(true);
          onTranscriptionStart?.();

          console.log('[VoiceRecorder] Processing audio for transcription...');

          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/webm',
          });

          // Create FormData for API
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          // Send to Whisper API
          const response = await fetch('/api/whisper/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Transcription failed');
          }

          const result: TranscriptionResponse = await response.json();

          console.log('[VoiceRecorder] Transcription successful:', result.text);
          onTranscript(result.text);
        } catch (error) {
          console.error('[VoiceRecorder] Transcription error:', error);
          // Could emit an error callback here if needed
        } finally {
          setIsTranscribing(false);
          onTranscriptionEnd?.();
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      onListeningChange?.(true);
      onRecordingStart?.();

      console.log('[VoiceRecorder] Recording started');
    } catch (error) {
      console.error('[VoiceRecorder] Error starting recording:', error);

      // Handle specific errors
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          console.error('[VoiceRecorder] Microphone access denied');
        } else if (error.name === 'NotFoundError') {
          console.error('[VoiceRecorder] No microphone found');
        }
      }
    }
  }, [
    disabled,
    isSupported,
    onRecordingStart,
    onTranscriptionStart,
    onTranscriptionEnd,
    onTranscript,
    onListeningChange,
  ]);

  const stopRecording = useCallback(() => {
    stopRecordingAndTranscribe();
  }, [stopRecordingAndTranscribe]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  }, []);

  // Handle component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  if (!isSupported) {
    return null;
  }

  const isProcessing = isRecording || isTranscribing;

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled || isTranscribing}
      className={`p-2.5 rounded-full transition-all duration-200 ${
        isRecording
          ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50'
          : isTranscribing
            ? 'bg-blue-500 text-white cursor-not-allowed shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={
        isTranscribing
          ? 'Transcribiendo...'
          : isRecording
            ? 'Detener grabación'
            : 'Grabar mensaje de voz'
      }
    >
      {isTranscribing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isRecording ? (
        <Square className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}
