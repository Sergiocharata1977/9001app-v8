'use client';

import { SilenceDetector } from '@/lib/voice/silence-detector';
import { useEffect, useRef, useState } from 'react';

export type ContinuousModeState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking';

export interface ContinuousModeControllerProps {
  enabled: boolean;
  onStateChange: (state: ContinuousModeState) => void;
  onSilenceDetected: () => void;
  onVoiceActivity: () => void;
  silenceThreshold?: number;
  silenceDuration?: number;
}

export function ContinuousModeController({
  enabled,
  onStateChange,
  onSilenceDetected,
  onVoiceActivity,
  silenceThreshold = 30,
  silenceDuration = 1500,
}: ContinuousModeControllerProps) {
  const [currentState, setCurrentState] = useState<ContinuousModeState>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const silenceDetectorRef = useRef<SilenceDetector | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startContinuousMode = async () => {
    try {
      console.log('[ContinuousModeController] Starting continuous mode...');

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Create silence detector
      const detector = new SilenceDetector({
        threshold: silenceThreshold,
        duration: silenceDuration,
      });
      silenceDetectorRef.current = detector;

      // Start detection
      await detector.startDetection(
        stream,
        handleSilenceDetected,
        handleVoiceActivity
      );

      // Set initial state
      updateState('listening');

      console.log('[ContinuousModeController] Continuous mode started');
    } catch (error) {
      console.error(
        '[ContinuousModeController] Error starting continuous mode:',
        error
      );
      stopContinuousMode();
    }
  };

  const stopContinuousMode = () => {
    console.log('[ContinuousModeController] Stopping continuous mode...');

    // Stop silence detector
    if (silenceDetectorRef.current) {
      silenceDetectorRef.current.stopDetection();
      silenceDetectorRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    updateState('idle');
    setAudioLevel(0);

    console.log('[ContinuousModeController] Continuous mode stopped');
  };

  const handleSilenceDetected = () => {
    console.log('[ContinuousModeController] Silence detected');
    onSilenceDetected();
  };

  const handleVoiceActivity = () => {
    console.log('[ContinuousModeController] Voice activity detected');
    onVoiceActivity();
  };

  const updateState = (newState: ContinuousModeState) => {
    setCurrentState(newState);
    onStateChange(newState);
  };

  const updateAudioLevel = () => {
    if (silenceDetectorRef.current) {
      const level = silenceDetectorRef.current.getCurrentAudioLevel();
      setAudioLevel(level);
    }

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  // Public methods exposed via ref
  const setProcessing = () => updateState('processing');
  const setSpeaking = () => updateState('speaking');
  const setListening = () => updateState('listening');

  // Initialize silence detector
  useEffect(() => {
    if (enabled) {
      startContinuousMode();
    } else {
      stopContinuousMode();
    }

    return () => {
      stopContinuousMode();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Update audio level visualization
  useEffect(() => {
    if (enabled && currentState === 'listening') {
      updateAudioLevel();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, currentState]);

  // Expose methods to parent
  useEffect(() => {
    if (enabled) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__continuousModeController = {
        setProcessing,
        setSpeaking,
        setListening,
      };
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__continuousModeController;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return (
    <div className="continuous-mode-indicator">
      {enabled && (
        <div className="flex items-center gap-2">
          {/* State indicator */}
          <div className="flex items-center gap-2">
            {currentState === 'listening' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">Escuchando...</span>
              </div>
            )}
            {currentState === 'processing' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">Procesando...</span>
              </div>
            )}
            {currentState === 'speaking' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">Hablando...</span>
              </div>
            )}
          </div>

          {/* Audio level visualization */}
          {currentState === 'listening' && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-green-500 rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.min(20, ((audioLevel / 50) * 20 * (i + 1)) / 5)}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper hook to control continuous mode from parent components
export function useContinuousModeController() {
  const setProcessing = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__continuousModeController?.setProcessing();
  };

  const setSpeaking = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__continuousModeController?.setSpeaking();
  };

  const setListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__continuousModeController?.setListening();
  };

  return {
    setProcessing,
    setSpeaking,
    setListening,
  };
}
