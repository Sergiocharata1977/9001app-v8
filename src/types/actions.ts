// Types for Actions Module

export interface Action {
  // Identificación
  id: string;
  actionNumber: string; // ACC-YYYY-XXX
  title: string;
  description: string;

  // FASE 2: TRATAMIENTO (Implementación)
  // Tipo y origen
  actionType: 'corrective' | 'preventive' | 'improvement';
  sourceType: 'audit' | 'employee' | 'customer' | 'finding';
  sourceId: string;
  findingId: string; // ID del hallazgo relacionado
  findingNumber: string; // Número del hallazgo

  // Fechas de tratamiento
  treatmentStartDate?: string; // Fecha de inicio de tratamiento
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;

  // Responsables e implementación
  responsiblePersonId: string; // Responsable de implementación
  responsiblePersonName: string;
  teamMembers?: TeamMember[]; // Grupo de trabajo

  // Fechas de compromiso
  implementationCommitmentDate?: string; // Fecha de compromiso de implementación
  executionDate?: string; // Fecha de ejecución

  // Estado y progreso
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number; // 0-100
  currentPhase: 'treatment' | 'control';

  // Plan de acción
  actionPlan?: ActionPlan;

  // Recursos requeridos
  requiredResources?: RequiredResources;

  // FASE 3: CONTROL
  // Verificación de efectividad
  effectivenessVerification?: EffectivenessVerification;

  // Documentos y comentarios
  documents: string[];
  comments: ActionComment[];

  // Trazabilidad
  traceabilityChain: string[];

  // Metadatos
  createdBy: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  userId: string;
  userName: string;
  role: string;
}

export interface ActionPlan {
  steps: ActionPlanStep[];
}

export interface ActionPlanStep {
  sequence: number;
  description: string;
  responsible: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  evidence?: string;
}

export interface RequiredResources {
  budget?: number;
  equipment?: string[];
  personnel?: string[];
  time?: number; // Horas estimadas
}

export interface EffectivenessVerification {
  responsiblePersonId: string; // Responsable de verificación
  responsiblePersonName: string;
  verificationCommitmentDate?: string; // Fecha de compromiso de verificación
  verificationExecutionDate?: string; // Fecha de ejecución de verificación
  method: string;
  criteria: string; // Criterio para considerar eficaz
  isEffective: boolean;
  result: string; // Resultado de la verificación
  evidence: string;
  comments?: string;
}

export interface ActionComment {
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
}

export interface ActionFilters {
  status?: string;
  actionType?: string;
  priority?: string;
  sourceType?: string;
  responsiblePersonId?: string;
  findingId?: string;
  year?: number;
  search?: string;
}

export interface ActionFormData {
  title: string;
  description: string;
  actionType: 'corrective' | 'preventive' | 'improvement';
  sourceType: 'audit' | 'employee' | 'customer' | 'finding';
  sourceId: string;
  findingId: string;
  findingNumber: string;
  plannedStartDate: string;
  plannedEndDate: string;
  responsiblePersonId: string;
  responsiblePersonName: string;
  teamMembers?: TeamMember[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionPlan?: ActionPlan;
  requiredResources?: RequiredResources;
  documents?: string[];
}

export interface CommentData {
  userId: string;
  userName: string;
  comment: string;
}

export interface ActionStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  effectiveness: number;
}
