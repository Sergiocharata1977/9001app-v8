// Types for Process Records System with Kanban

import { Timestamp } from 'firebase/firestore';

// Process Definition (Template)
export interface ProcessDefinition {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  objetivo: string;
  alcance: string;
  funciones_involucradas: string[];
  categoria: string;
  documento_origen_id?: string;
  puesto_responsable_id?: string; // Relación con puesto
  etapas_default: string[];
  activo: boolean;
  created_at: Date | Timestamp;
  updated_at: Date | Timestamp;
}

export interface ProcessDefinitionFormData {
  codigo: string;
  nombre: string;
  descripcion: string;
  objetivo: string;
  alcance: string;
  funciones_involucradas: string[];
  categoria: string;
  documento_origen_id?: string;
  puesto_responsable_id?: string; // Relación con puesto
  etapas_default: string[];
  activo: boolean;
}

// Process Record (Instance)
export interface ProcessRecord {
  id: string;
  nombre: string;
  descripcion: string;
  process_definition_id: string;
  process_definition_nombre?: string;
  status: 'activo' | 'pausado' | 'completado' | 'cancelado';
  fecha_inicio: Date | Timestamp;
  fecha_fin?: Date | Timestamp;
  responsable_id: string;
  responsable_nombre: string;
  created_by: string;
  created_at: Date | Timestamp;
  updated_at: Date | Timestamp;
}

export interface ProcessRecordFormData {
  nombre: string;
  descripcion: string;
  process_definition_id: string;
  status: 'activo' | 'pausado' | 'completado' | 'cancelado';
  fecha_inicio: Date;
  responsable_id: string;
  responsable_nombre: string;
}

// Process Record Stage (Kanban Column)
export interface ProcessRecordStage {
  id: string;
  process_record_id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  orden: number;
  es_etapa_final: boolean;
  created_at: Date | Timestamp;
  updated_at: Date | Timestamp;
}

export interface ProcessRecordStageFormData {
  nombre: string;
  descripcion?: string;
  color: string;
  orden: number;
  es_etapa_final: boolean;
}

// Process Record Task (Kanban Card)
export interface ProcessRecordTask {
  id: string;
  process_record_id: string;
  stage_id: string;
  stage_nombre?: string;
  titulo: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  asignado_a_id?: string;
  asignado_a_nombre?: string;
  fecha_vencimiento?: Date | Timestamp;
  etiquetas: string[];
  archivos_adjuntos: string[];
  comentarios_count: number;
  orden: number;
  created_by: string;
  created_at: Date | Timestamp;
  updated_at: Date | Timestamp;
}

export interface ProcessRecordTaskFormData {
  titulo: string;
  descripcion: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  asignado_a_id?: string;
  asignado_a_nombre?: string;
  fecha_vencimiento?: Date;
  etiquetas: string[];
}

// Process Record Comment
export interface ProcessRecordComment {
  id: string;
  task_id: string;
  process_record_id: string;
  autor_id: string;
  autor_nombre: string;
  contenido: string;
  created_at: Date | Timestamp;
}

export interface ProcessRecordCommentFormData {
  contenido: string;
}

// Stats for Kanban Board
export interface KanbanStats {
  totalCards: number;
  pendingCards: number;
  inProgressCards: number;
  completedCards: number;
}

// Kanban Board Data (for UI)
export interface KanbanBoardData {
  record: ProcessRecord;
  stages: ProcessRecordStage[];
  tasksByStage: Map<string, ProcessRecordTask[]>;
  stats: KanbanStats;
}
