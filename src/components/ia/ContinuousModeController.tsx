'use client';

import {
  ContinuousModeControllerProps,
  ContinuousModeState,
} from '@/types/chat';
import { Loader2, Mic, MicOff, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ContinuousModeController({
  onTranscript,
  onResponse,
  disabled = false,
  onStateChange,
  responseText = '',
}: ContinuousModeControllerProps) {
  const [state, setState] = useState<ContinuousModeState>('idle');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
      setIsListening(true);
      setState('listening');
      onStateChange?.('listening');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setState('processing');
        onStateChange?.('processing');
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setState('idle');
      onStateChange?.('idle');
    };

    recognition.onend = () => {
      setIsListening(false);
      setState('idle');
      onStateChange?.('idle');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript, onStateChange]);

  // Auto-play response when available
  useEffect(() => {
    if (responseText && state === 'processing') {
      setState('speaking');
      onStateChange?.('speaking');

      // Simulate speaking duration
      const duration = Math.min(responseText.length * 50, 10000);
      const timer = setTimeout(() => {
        setState('idle');
        onStateChange?.('idle');
        // Restart listening
        if (recognitionRef.current && !disabled) {
          recognitionRef.current.start();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [responseText, state, onStateChange, disabled]);

  const toggleListening = () => {
    if (!recognitionRef.current || disabled) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'listening':
        return <Mic className="w-5 h-5 animate-pulse text-red-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'speaking':
        return <Volume2 className="w-5 h-5 animate-pulse text-green-500" />;
      default:
        return <MicOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'listening':
        return 'Escuchando...';
      case 'processing':
        return 'Procesando...';
      case 'speaking':
        return 'Respondiendo...';
      default:
        return 'Modo continuo inactivo';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
        <div className="flex items-center gap-2">
          {getStateIcon()}
          <span className="text-sm font-medium text-gray-700">
            {getStateText()}
          </span>
        </div>
        <button
          onClick={toggleListening}
          disabled={disabled}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? 'Detener' : 'Iniciar'}
        </button>
      </div>

      {responseText && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-700 font-medium mb-1">
            Última respuesta:
          </p>
          <p className="text-sm text-green-800 line-clamp-2">{responseText}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        💡 Habla naturalmente. Di "detener" para pausar.
      </p>
    </div>
  );
}
