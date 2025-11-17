/**
 * Action Module Types
 * 
 * Tipos e interfaces para la gestión de acciones correctivas
 */

import type { BaseDocument } from '../../base/types';

/**
 * Estado de la acción
 */
export type ActionStatus = 
  | 'planificada'
  | 'en_ejecucion'
  | 'completada'
  | 'verificada'
  | 'cerrada';

/**
 * Documento de acción
 */
export interface Action extends BaseDocument {
  actionNumber: string;
  findingId: string;
  findingNumber: string;
  
  // Información básica
  title: string;
  description: string;
  responsiblePersonId: string;
  responsiblePersonName: string;
  
  // Fechas
  plannedDate: any; // Timestamp
  executionDate: any | null; // Timestamp
  verificationDate: any | null; // Timestamp
  
  // Ejecución
  executionDetails: string | null;
  executedBy: string | null;
  executedByName: string | null;
  
  // Verificación de efectividad
  effectivenessVerification: string | null;
  verifiedBy: string | null;
  verifiedByName: string | null;
  isEffective: boolean | null;
  
  // Estado y progreso
  status: ActionStatus;
  progress: number; // 0-100
  
  // Auditoría
  createdByName: string;
  updatedByName: string | null;
}

/**
 * Input para crear acción
 */
export interface CreateActionInput {
  findingId: string;
  findingNumber: string;
  title: string;
  description: string;
  responsiblePersonId: string;
  responsiblePersonName: string;
  plannedDate: Date;
}

/**
 * Input para actualizar ejecución
 */
export interface UpdateActionExecutionInput {
  executionDate: Date;
  executionDetails: string;
}

/**
 * Input para verificar efectividad
 */
export interface VerifyActionEffectivenessInput {
  effectivenessVerification: string;
  isEffective: boolean;
}

/**
 * Filtros para listar acciones
 */
export interface ActionFilters {
  status?: ActionStatus;
  findingId?: string;
  responsiblePersonId?: string;
  year?: number;
  search?: string;
}

/**
 * Estadísticas de acciones
 */
export interface ActionStats {
  total: number;
  byStatus: Record<ActionStatus, number>;
  averageProgress: number;
  effectiveCount: number;
  overdueCount: number;
}