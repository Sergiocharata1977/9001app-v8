// Types for Audits Module

export interface Audit {
  // Identificación
  id: string;
  auditNumber: string; // AUD-YYYY-XXX
  title: string;
  description?: string;

  // Clasificación
  auditType: 'internal' | 'external' | 'supplier' | 'customer';
  auditScope: 'full' | 'partial' | 'follow_up';
  isoClausesCovered: string[]; // ['4.1', '5.2', '8.1']

  // Fechas
  plannedDate: string; // ISO date string
  actualStartDate?: string;
  actualEndDate?: string;
  duration?: number; // En horas

  // Equipo auditor
  leadAuditorId: string;
  leadAuditorName: string;
  auditTeam: AuditTeamMember[];

  // Estado y calificación
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  overallRating?:
    | 'excellent'
    | 'good'
    | 'satisfactory'
    | 'needs_improvement'
    | 'unsatisfactory';

  // Contadores de hallazgos (actualizados automáticamente)
  findingsCount: number;
  criticalFindings: number;
  majorFindings: number;
  minorFindings: number;
  observations: number;

  // Seguimiento
  followUpRequired: boolean;
  followUpDate?: string;
  correctionDeadline?: string;

  // Trazabilidad
  traceabilityChain: string[]; // IDs relacionados

  // Metadatos
  createdBy: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditTeamMember {
  auditorId: string;
  auditorName: string;
  role: 'lead' | 'assistant' | 'observer';
}

export interface AuditFilters {
  status?: string;
  auditType?: string;
  year?: number;
  leadAuditorId?: string;
  search?: string;
}

export interface AuditFormData {
  title: string;
  description?: string;
  auditType: 'internal' | 'external' | 'supplier' | 'customer';
  auditScope: 'full' | 'partial' | 'follow_up';
  isoClausesCovered?: string[];
  plannedDate: string;
  duration?: number;
  leadAuditorId: string;
  leadAuditorName: string;
  auditTeam?: AuditTeamMember[];
  followUpRequired?: boolean;
  followUpDate?: string;
  correctionDeadline?: string;
}

export interface AuditStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byRating: Record<string, number>;
  totalFindings: number;
  criticalFindings: number;
}
