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
  created_at: Date;
  updated_at: Date;
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
