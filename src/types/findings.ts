import { Timestamp } from 'firebase/firestore';

// ============================================
// ENUMS Y TIPOS
// ============================================

export type FindingStatus =
  | 'registrado'
  | 'accion_planificada'
  | 'accion_ejecutada'
  | 'analisis_completado'
  | 'cerrado';

export type FindingPhase =
  | 'registered'
  | 'immediate_action_planned'
  | 'immediate_action_executed'
  | 'root_cause_analyzed';

// ============================================
// FASES DEL HALLAZGO
// ============================================

// Fase 1: Alta del Hallazgo (se crea en el formulario inicial)
export interface FindingRegistration {
  origin: string;
  name: string;
  description: string;
  processId: string | null;
  processName: string | null;
}

// Fase 2: Planificación de Acción Inmediata (Formulario 2)
export interface FindingImmediateActionPlanning {
  responsiblePersonId: string;
  responsiblePersonName: string;
  plannedDate: Timestamp;
  comments: string | null;
}

// Fase 3: Ejecución de la Acción Inmediata (Formulario 3)
export interface FindingImmediateActionExecution {
  executionDate: Timestamp;
  correction: string;
  executedBy: string;
  executedByName: string;
}

// Fase 4: Análisis de Causa Raíz (Formulario 4)
export interface FindingRootCauseAnalysis {
  analysis: string;
  requiresAction: boolean;
  analyzedBy: string;
  analyzedByName: string;
  analyzedDate: Timestamp;
}

// ============================================
// MODELO PRINCIPAL
// ============================================

export interface Finding {
  // Identificación
  id: string;
  findingNumber: string;

  // Fase 1: Registro del Hallazgo
  registration: FindingRegistration;

  // Fase 2: Planificación de Acción Inmediata
  immediateActionPlanning: FindingImmediateActionPlanning | null;

  // Fase 3: Ejecución de Acción Inmediata
  immediateActionExecution: FindingImmediateActionExecution | null;

  // Fase 4: Análisis de Causa Raíz
  rootCauseAnalysis: FindingRootCauseAnalysis | null;

  // Estado general
  status: FindingStatus;
  currentPhase: FindingPhase;
  progress: number; // 0, 25, 50, 75, 100

  // Metadatos
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  createdByName: string;
  updatedBy: string | null;
  updatedByName: string | null;
  isActive: boolean;
}

// ============================================
// FORMULARIOS
// ============================================

// Formulario 1: Alta del Hallazgo (Modal)
export interface FindingFormData {
  origin: string;
  name: string;
  description: string;
  processId: string;
  processName: string;
}

// Formulario 2: Planificación de Acción Inmediata
export interface FindingImmediateActionPlanningFormData {
  responsiblePersonId: string;
  responsiblePersonName: string;
  plannedDate: Date;
  comments?: string;
}

// Formulario 3: Ejecución de Acción Inmediata
export interface FindingImmediateActionExecutionFormData {
  executionDate: Date;
  correction: string;
}

// Formulario 4: Análisis de Causa Raíz
export interface FindingRootCauseAnalysisFormData {
  analysis: string;
  requiresAction: boolean;
}

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================

export interface FindingFilters {
  status?: FindingStatus;
  processId?: string;
  year?: number;
  search?: string;
  requiresAction?: boolean;
}

// ============================================
// ESTADÍSTICAS
// ============================================

export interface FindingStats {
  total: number;
  byStatus: Record<FindingStatus, number>;
  byProcess: Record<string, number>;
  averageProgress: number;
  requiresActionCount: number;
  closedCount: number;
}

// ============================================
// LABELS Y CONFIGURACIÓN
// ============================================

export const FINDING_STATUS_LABELS: Record<FindingStatus, string> = {
  registrado: 'Registrado',
  accion_planificada: 'Acción Planificada',
  accion_ejecutada: 'Acción Ejecutada',
  analisis_completado: 'Análisis Completado',
  cerrado: 'Cerrado',
};

// ============================================
// COLORES PARA UI
// ============================================

export const FINDING_STATUS_COLORS: Record<FindingStatus, string> = {
  registrado: 'bg-gray-100 text-gray-800',
  accion_planificada: 'bg-blue-100 text-blue-800',
  accion_ejecutada: 'bg-yellow-100 text-yellow-800',
  analisis_completado: 'bg-purple-100 text-purple-800',
  cerrado: 'bg-green-100 text-green-800',
};

// ============================================
// HELPERS
// ============================================

export function getProgressByStatus(status: FindingStatus): number {
  switch (status) {
    case 'registrado':
      return 0;
    case 'accion_planificada':
      return 25;
    case 'accion_ejecutada':
      return 50;
    case 'analisis_completado':
      return 75;
    case 'cerrado':
      return 100;
    default:
      return 0;
  }
}

export function getNextStatus(
  currentStatus: FindingStatus
): FindingStatus | null {
  switch (currentStatus) {
    case 'registrado':
      return 'accion_planificada';
    case 'accion_planificada':
      return 'accion_ejecutada';
    case 'accion_ejecutada':
      return 'analisis_completado';
    case 'analisis_completado':
      return 'cerrado';
    case 'cerrado':
      return null;
    default:
      return null;
  }
}
