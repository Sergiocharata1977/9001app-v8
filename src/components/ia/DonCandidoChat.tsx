'use client';

// Don Cándido Chat Component

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Mensaje } from '@/types/chat';

interface DonCandidoChatProps {
  onClose: () => void;
  modulo?: string;
}

export function DonCandidoChat({ onClose, modulo }: DonCandidoChatProps) {
  const { usuario } = useCurrentUser();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mensaje inicial de Don Cándido (memoizado para evitar recreación)
  const mensajeInicial = useMemo<Mensaje>(() => ({
    id: 'inicial',
    tipo: 'asistente',
    contenido: `👷‍♂️ ¡Hola! Soy DON CÁNDIDO, tu asesor experto en ISO 9001 con más de 20 años de experiencia.

Estoy aquí para ayudarte con:
• Normas y cláusulas ISO 9001
• Procesos de calidad
• Auditorías y hallazgos
• Mejora continua
• Gestión de riesgos

¿En qué puedo asesorarte hoy?`,
    timestamp: new Date(),
    via: 'texto'
  }), []);

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
          modulo
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      console.log('[DonCandidoChat] Session created:', data.sessionId);
    } catch (error) {
      console.error('[DonCandidoChat] Error creating session:', error);
      // Show error in chat
      const errorMsg: Mensaje = {
        id: `error-${Date.now()}`,
        tipo: 'sistema',
        contenido: 'Error al inicializar el chat. Por favor, recarga la página.',
        timestamp: new Date(),
        via: 'texto'
      };
      setMensajes(prev => [...prev, errorMsg]);
    }
  }, [usuario, modulo]);

  // Initialize messages on mount
  useEffect(() => {
    setMensajes([mensajeInicial]);
  }, [mensajeInicial]);

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
      via: 'texto'
    };

    setMensajes(prev => [...prev, nuevoMensajeUsuario]);
    setInputMensaje('');
    setCargando(true);

    try {
      const response = await fetch('/api/claude/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: textoMensaje,
          userId: usuario.id,
          sessionId,
          modulo
        })
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
        tokens: data.tokens
      };

      setMensajes(prev => [...prev, respuestaAsistente]);
    } catch (error) {
      console.error('[DonCandidoChat] Error sending message:', error);
      
      // Add error message
      const errorMessage: Mensaje = {
        id: `error-${Date.now()}`,
        tipo: 'sistema',
        contenido: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        timestamp: new Date(),
        via: 'texto'
      };
      setMensajes(prev => [...prev, errorMessage]);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
          <span className="text-2xl">👷‍♂️</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">DON CÁNDIDO</h3>
          <p className="text-sm opacity-90">Asesor ISO 9001</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {mensajes.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.tipo === 'asistente' && (
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-lg">👷‍♂️</span>
              </div>
            )}

            <div className={`flex flex-col max-w-[80%]`}>
              <div
                className={`p-3 rounded-lg ${
                  msg.tipo === 'usuario'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : msg.tipo === 'sistema'
                    ? 'bg-yellow-100 text-yellow-800 rounded-bl-none border border-yellow-300'
                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.contenido}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>

            {msg.tipo === 'usuario' && (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-lg">👤</span>
              </div>
            )}
          </div>
        ))}

        {cargando && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-lg">👷‍♂️</span>
            </div>
            <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm border border-gray-200">
              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputMensaje}
            onChange={(e) => setInputMensaje(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre ISO 9001..."
            className="flex-1"
            disabled={cargando || !sessionId}
          />
          <Button
            onClick={enviarMensaje}
            disabled={cargando || !inputMensaje.trim() || !sessionId}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Solo consultas sobre ISO 9001, procesos y gestión de calidad
        </p>
      </div>
    </div>
  );
}
