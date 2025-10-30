// Types for Findings Module

export interface Finding {
  // Identificación
  id: string;
  findingNumber: string; // HAL-YYYY-XXX
  title: string;
  description: string;

  // FASE 1: DETECCIÓN
  // Origen del hallazgo
  source: 'audit' | 'employee' | 'customer' | 'inspection' | 'supplier';
  sourceId: string; // ID del origen
  sourceName: string;
  sourceReference?: string;

  // Registro
  identifiedDate: string; // Fecha de registro
  reportedBy: string; // Quién reportó (ID)
  reportedByName: string;
  identifiedBy: string; // Quién registró (ID)
  identifiedByName: string;

  // Clasificación
  findingType: 'non_conformity' | 'observation' | 'improvement_opportunity';
  severity: 'critical' | 'major' | 'minor' | 'low';
  category:
    | 'quality'
    | 'safety'
    | 'environment'
    | 'process'
    | 'equipment'
    | 'documentation';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  // Descripción y consecuencia
  consequence?: string;

  // Acción inmediata (Corrección)
  immediateCorrection?: ImmediateCorrection;

  // Proceso y responsable
  processId?: string;
  processName?: string;
  responsiblePersonId?: string; // Responsable del tratamiento
  responsiblePersonName?: string;

  // Evidencia
  evidence: string;
  evidenceDocuments: string[];

  // FASE 2: TRATAMIENTO
  // Análisis de causa raíz
  rootCauseAnalysis?: RootCauseAnalysis;

  // ¿Requiere acción?
  requiresAction: boolean;

  // Fechas
  targetCloseDate?: string;
  actualCloseDate?: string;

  // Acciones relacionadas
  actionsCount: number;
  openActionsCount: number;
  completedActionsCount: number;

  // FASE 3: CONTROL (se completa cuando las acciones son verificadas)
  // Verificación
  verifiedBy?: string;
  verificationDate?: string;
  verificationEvidence?: string;
  isVerified: boolean;
  verificationComments?: string;

  // Estado y fase actual
  status: 'open' | 'in_analysis' | 'action_planned' | 'in_progress' | 'closed';
  currentPhase: 'detection' | 'treatment' | 'control';
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Recurrencia
  isRecurrent: boolean;
  previousFindingIds?: string[];
  recurrenceCount?: number;

  // Evaluación de impacto
  impactAssessment?: ImpactAssessment;

  // Trazabilidad
  traceabilityChain: string[];

  // Metadatos
  createdBy: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImmediateCorrection {
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  commitmentDate?: string; // Fecha de compromiso
  closureDate?: string; // Fecha de cierre
}

export interface RootCauseAnalysis {
  method: string; // 5 Por qué, Ishikawa, etc.
  rootCause: string; // Causa raíz (raíz del problema)
  contributingFactors?: string[];
  analysis: string;
}

export interface ImpactAssessment {
  customerImpact: boolean;
  regulatoryImpact: boolean;
  financialImpact: boolean;
  operationalImpact: boolean;
  description?: string;
}

export interface FindingFilters {
  source?: string;
  status?: string;
  severity?: string;
  findingType?: string;
  category?: string;
  responsiblePersonId?: string;
  year?: number;
  search?: string;
}

export interface FindingFormData {
  title: string;
  description: string;
  source: 'audit' | 'employee' | 'customer' | 'inspection' | 'supplier';
  sourceId: string;
  sourceName: string;
  sourceReference?: string;
  findingType: 'non_conformity' | 'observation' | 'improvement_opportunity';
  severity: 'critical' | 'major' | 'minor' | 'low';
  category:
    | 'quality'
    | 'safety'
    | 'environment'
    | 'process'
    | 'equipment'
    | 'documentation';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  processId?: string;
  location?: string;
  evidence: string;
  evidenceDocuments?: string[];
  responsiblePersonId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetCloseDate?: string;
  consequence?: string;
  impactAssessment?: ImpactAssessment;
}

export interface VerificationData {
  verifiedBy: string;
  verificationDate: string;
  verificationEvidence: string;
  verificationComments?: string;
}

export interface RecurrenceCheck {
  isRecurrent: boolean;
  relatedFindings: string[];
  count: number;
}

export interface FindingStats {
  total: number;
  bySource: Record<string, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  byPhase: Record<string, number>;
}
