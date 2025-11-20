'use client';

// Don Cándido Chat Component - Premium AI Advisor Design

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ContinuousModeState, Mensaje } from '@/types/chat';
import { Clock, Loader2, Minimize2, Send, Settings, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioPlayer } from './AudioPlayer';
import { ContinuousModeController } from './ContinuousModeController';
import { VoiceRecorder } from './VoiceRecorder';

interface DonCandidoChatProps {
  onClose: () => void;
  modulo?: string;
}

const QUICK_SUGGESTIONS = [
  { id: 1, text: 'Redactar hallazgo', icon: '📝' },
  { id: 2, text: 'Cláusula 4.1', icon: '📋' },
  { id: 3, text: 'Mejora continua', icon: '🔄' },
  { id: 4, text: 'Gestión de riesgos', icon: '⚠️' },
];

export function DonCandidoChat({ onClose, modulo }: DonCandidoChatProps) {
  const { usuario } = useCurrentUser();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Nuevas configuraciones
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Modo Continuo
  const [continuousModeEnabled, setContinuousModeEnabled] = useState(false);
  const [continuousModeState, setContinuousModeState] =
    useState<ContinuousModeState>('idle');
  const [lastResponse, setLastResponse] = useState<string>('');

  const [sessionHistory, setSessionHistory] = useState<
    Array<{
      id: string;
      titulo?: string;
      created_at: Date;
      updated_at?: Date;
      modulo?: string;
      mensajes?: Array<{ contenido: string }>;
    }>
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Mensaje inicial de Don Cándido (memoizado para evitar recreación)
  const mensajeInicial = useMemo<Mensaje>(
    () => ({
      id: 'inicial',
      tipo: 'asistente',
      contenido: `¡Hola! Soy DON CÁNDIDO, tu asesor experto en ISO 9001 con más de 20 años de experiencia.

Estoy aquí para ayudarte con:
• Normas y cláusulas ISO 9001
• Procesos de calidad
• Auditorías y hallazgos
• Mejora continua
• Gestión de riesgos

¿En qué puedo asesorarte hoy?`,
      timestamp: new Date(),
      via: 'texto',
    }),
    []
  );

  const cargarHistorial = useCallback(async () => {
    if (!usuario) return;

    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/ia/sessions?userId=${usuario.id}`);
      if (response.ok) {
        const data = await response.json();
        setSessionHistory(data.sessions || []);
      }
    } catch (error) {
      console.error('[DonCandidoChat] Error loading history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, [usuario]);

  const inicializarSesion = useCallback(async () => {
    if (!usuario) {
      console.log('[DonCandidoChat] Waiting for user...');
      return;
    }

    try {
      const response = await fetch('/api/ia/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: usuario.id,
          tipo: 'don-candido',
          modulo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      console.log('[DonCandidoChat] Session created:', data.sessionId);
    } catch (error) {
      console.error('[DonCandidoChat] Error creating session:', error);
      const errorMsg: Mensaje = {
        id: `error-${Date.now()}`,
        tipo: 'sistema',
        contenido:
          'Error al inicializar el chat. Por favor, recarga la página.',
        timestamp: new Date(),
        via: 'texto',
      };
      setMensajes(prev => [...prev, errorMsg]);
    }
  }, [usuario, modulo]);

  const reanudarSesion = useCallback(async (sessionIdToResume: string) => {
    try {
      const response = await fetch(`/api/ia/sessions/${sessionIdToResume}`);
      if (!response.ok) throw new Error('Failed to load session');

      const data = await response.json();
      setSessionId(sessionIdToResume);
      setMensajes(data.session.mensajes || []);
      setShowHistory(false);
      console.log('[DonCandidoChat] Session resumed:', sessionIdToResume);
    } catch (error) {
      console.error('[DonCandidoChat] Error resuming session:', error);
    }
  }, []);

  // Initialize messages on mount
  useEffect(() => {
    setMensajes([mensajeInicial]);
  }, [mensajeInicial]);

  // Check for resume session from localStorage
  useEffect(() => {
    const resumeSessionId = localStorage.getItem('resumeSessionId');
    if (resumeSessionId && usuario) {
      // Clear the flag
      localStorage.removeItem('resumeSessionId');
      // Resume the session
      reanudarSesion(resumeSessionId);
    }
  }, [usuario, reanudarSesion]);

  // Initialize session when user is available
  useEffect(() => {
    if (usuario && !sessionId) {
      inicializarSesion();
    }
  }, [usuario, sessionId, inicializarSesion]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (!inputMensaje.trim() || cargando || !sessionId || !usuario) {
      return;
    }

    const textoMensaje = inputMensaje.trim();

    // Add user message to UI
    const nuevoMensajeUsuario: Mensaje = {
      id: `user-${Date.now()}`,
      tipo: 'usuario',
      contenido: textoMensaje,
      timestamp: new Date(),
      via: 'texto',
    };

    setMensajes(prev => [...prev, nuevoMensajeUsuario]);
    setInputMensaje('');
    setCargando(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: textoMensaje,
          userId: usuario.id,
          sessionId,
          modulo,
          mode: 'fast',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Add assistant response to UI
      const respuestaAsistente: Mensaje = {
        id: `assistant-${Date.now()}`,
        tipo: 'asistente',
        contenido: data.respuesta,
        timestamp: new Date(),
        via: 'texto',
        tokens: data.tokens,
        autoPlay: autoPlayVoice,
      };

      setMensajes(prev => [...prev, respuestaAsistente]);

      // Update last response for continuous mode
      setLastResponse(data.respuesta);
    } catch (error) {
      console.error('[DonCandidoChat] Error sending message:', error);

      const errorMessage: Mensaje = {
        id: `error-${Date.now()}`,
        tipo: 'sistema',
        contenido:
          'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        timestamp: new Date(),
        via: 'texto',
      };
      setMensajes(prev => [...prev, errorMessage]);
    } finally {
      setCargando(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputMensaje(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  // Handlers para modo continuo
  const handleContinuousModeTranscript = useCallback(
    (text: string) => {
      console.log('[DonCandidoChat] Continuous mode transcript:', text);

      // Check for stop commands
      const stopCommands = ['detener', 'pausar', 'parar', 'stop'];
      if (stopCommands.some(cmd => text.toLowerCase().includes(cmd))) {
        setContinuousModeEnabled(false);
        return;
      }

      // Set the transcribed text and send automatically
      setInputMensaje(text);
      setTimeout(() => {
        enviarMensaje();
      }, 100);
    },
    [enviarMensaje]
  );

  const handleContinuousModeResponse = useCallback((text: string) => {
    console.log('[DonCandidoChat] Continuous mode response:', text);
    // Response is already handled by enviarMensaje
  }, []);

  const handleContinuousModeStateChange = useCallback(
    (state: ContinuousModeState) => {
      setContinuousModeState(state);
    },
    []
  );

  // Si está minimizado, mostrar solo el FAB
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-50 border-2 border-white"
        title="Abrir Don Cándido"
      >
        👷‍♂️
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden backdrop-blur-sm">
      {/* Header Minimalista */}
      <div className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white p-4 flex items-center gap-3 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shrink-0 border border-white/30">
            <span className="text-2xl">👷‍♂️</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight">DON CÁNDIDO</h3>
            <p className="text-xs opacity-90 font-medium">Asesor ISO 9001</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-green-300 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium opacity-90">Activo</span>
          </div>
        </div>

        {/* Controls */}
        <div className="relative z-10 flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) cargarHistorial();
            }}
            className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-lg transition-colors"
            title="Historial"
          >
            <Clock className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-lg transition-colors"
            title="Configuración"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-lg transition-colors"
            title="Minimizar"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Respuesta automática con voz
            </span>
            <button
              onClick={() => setAutoPlayVoice(!autoPlayVoice)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoPlayVoice ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoPlayVoice ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {autoPlayVoice
              ? '🔊 Don Cándido responderá automáticamente con voz'
              : '🔇 Debes hacer clic en el botón de audio para escuchar'}
          </p>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                Modo Conversación Continua
              </span>
              <button
                onClick={() => setContinuousModeEnabled(!continuousModeEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  continuousModeEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    continuousModeEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mt-2">
              {continuousModeEnabled
                ? '🎤 Modo continuo activo - Habla naturalmente'
                : '🎙️ Presiona el micrófono para cada mensaje'}
            </p>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 p-4 max-h-48 overflow-y-auto">
          <h4 className="font-semibold text-sm text-gray-700 mb-3">
            Conversaciones Anteriores
          </h4>
          {loadingHistory ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : sessionHistory.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay conversaciones anteriores
            </p>
          ) : (
            <div className="space-y-2">
              {sessionHistory.map(session => (
                <button
                  key={session.id}
                  onClick={() => reanudarSesion(session.id)}
                  className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {session.modulo || 'General'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(
                        session.updated_at || session.created_at
                      ).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {session.mensajes?.[
                      session.mensajes.length - 1
                    ]?.contenido?.substring(0, 50) || 'Sin mensajes'}
                    ...
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50">
        {/* Quick Actions - Show only if few messages */}
        {mensajes.length <= 2 && (
          <div className="flex gap-2 justify-center mb-4 flex-wrap">
            <button
              onClick={() => setInputMensaje('/form no-conformidad')}
              className="text-xs bg-white border border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-600 hover:text-green-700 px-3 py-1.5 rounded-full transition-all shadow-sm flex items-center gap-1"
            >
              <span>⚠️</span> Reportar No Conformidad
            </button>
            <button
              onClick={() => setInputMensaje('/form auditoria')}
              className="text-xs bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-700 px-3 py-1.5 rounded-full transition-all shadow-sm flex items-center gap-1"
            >
              <span>📋</span> Programar Auditoría
            </button>
          </div>
        )}

        {mensajes.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 ${
              msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.tipo === 'asistente' && (
              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shrink-0 border border-green-200">
                <span className="text-lg">👷‍♂️</span>
              </div>
            )}

            <div className={`flex flex-col max-w-[80%]`}>
              <div
                className={`px-4 py-3 rounded-2xl transition-all duration-200 ${
                  msg.tipo === 'usuario'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-none shadow-md'
                    : msg.tipo === 'sistema'
                      ? 'bg-yellow-50 text-yellow-800 rounded-bl-none border border-yellow-200'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                  {msg.contenido}
                </div>
                {msg.tipo === 'asistente' && (
                  <div className="mt-2 flex justify-end">
                    <AudioPlayer text={msg.contenido} autoPlay={msg.autoPlay} />
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {msg.tipo === 'usuario' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shrink-0 border border-blue-200">
                <span className="text-lg">👤</span>
              </div>
            )}
          </div>
        ))}

        {cargando && (
          <div className="flex gap-3 justify-start animate-in fade-in">
            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center border border-green-200">
              <span className="text-lg">👷‍♂️</span>
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200 flex items-center gap-2">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Suggestions - Show only on initial message */}
        {mensajes.length === 1 && !cargando && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-semibold mb-3 px-1">
              Sugerencias rápidas:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_SUGGESTIONS.map(suggestion => (
                <button
                  key={suggestion.id}
                  onClick={() => {
                    handleQuickSuggestion(suggestion.text);
                    setTimeout(() => enviarMensaje(), 100);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-xs font-medium text-gray-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-400 transition-all duration-200 flex items-center gap-2"
                >
                  <span>{suggestion.icon}</span>
                  <span className="truncate">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Floating Capsule */}
      <div className="p-4 border-t border-gray-200 bg-gradient-to-t from-white to-gray-50">
        {continuousModeEnabled ? (
          <ContinuousModeController
            onTranscript={handleContinuousModeTranscript}
            onResponse={handleContinuousModeResponse}
            disabled={cargando || !sessionId}
            onStateChange={handleContinuousModeStateChange}
            responseText={lastResponse}
          />
        ) : (
          <>
            <div className="flex gap-2 items-end">
              <VoiceRecorder
                onTranscript={text => setInputMensaje(text)}
                disabled={cargando || !sessionId}
                onListeningChange={setIsListening}
              />
              <div className="flex-1 relative">
                <Input
                  type="text"
                  value={inputMensaje}
                  onChange={e => setInputMensaje(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pregunta sobre ISO 9001..."
                  className="flex-1 rounded-full border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 px-4 py-2.5 text-sm"
                  disabled={cargando || !sessionId}
                />
              </div>
              <Button
                onClick={enviarMensaje}
                disabled={cargando || !inputMensaje.trim() || !sessionId}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full h-10 w-10 p-0 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 px-1">
              🎤 Usa el micrófono o escribe tu consulta
            </p>
          </>
        )}
      </div>
    </div>
  );
}
