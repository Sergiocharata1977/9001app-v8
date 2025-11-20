// Types for chat sessions and messages

import { UserContext } from './context';

export interface ChatSession {
  id: string;
  user_id: string;
  tipo: 'don-candidos' | 'asistente' | 'formulario';
  modulo?: string;
  estado: 'activo' | 'pausado' | 'completado';
  mensajes: Mensaje[];
  contexto_snapshot: UserContext; // Snapshot at session creation

  // Enhanced fields for Phase 2
  titulo?: string; // Auto-generated title
  resumen?: string; // AI-generated summary
  tags?: string[]; // Auto-tagged topics
  duracion_minutos?: number;
  modo_continuo_usado?: boolean;

  // Form state if type is 'formulario'
  form_state?: any; // Should be FormSessionState but avoiding circular dependency

  created_at: Date;
  updated_at: Date;
  last_accessed_at?: Date;
}

export interface Mensaje {
  id: string;
  tipo: 'usuario' | 'asistente' | 'sistema';
  contenido: string;
  timestamp: Date;
  via: 'texto' | 'voz' | 'imagen';
  tokens?: {
    input: number;
    output: number;
  };
  autoPlay?: boolean; // Para reproducción automática de voz
}

export interface UsoClaude {
  id: string;
  user_id: string;
  session_id?: string;
  tipo_operacion: 'chat' | 'formulario' | 'analisis_imagen' | 'reporte';
  tokens_input: number;
  tokens_output: number;
  costo_estimado: number;
  fecha: Date;
  metadata: {
    modulo?: string;
    tipo_consulta?: string;
    tiempo_respuesta_ms?: number;
  };
}

export interface UsageSummary {
  total_consultas: number;
  total_tokens_input: number;
  total_tokens_output: number;
  costo_total: number;
  promedio_tokens_por_consulta: number;
}

export interface LimitStatus {
  exceeded: boolean;
  consultas_restantes: number;
  tokens_restantes: number;
  costo_restante: number;
}

// Continuous Mode Types
export type ContinuousModeState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking';

export interface ContinuousModeControllerProps {
  onTranscript: (text: string) => void;
  onResponse: (text: string) => void;
  disabled?: boolean;
  onStateChange?: (state: ContinuousModeState) => void;
  responseText?: string;
}
