import { Timestamp } from 'firebase/firestore';

export type AuditStatus = 'planned' | 'in_progress' | 'completed';

// Tipo para Firestore (con Timestamps)
export interface AuditFirestore {
  id: string;
  title: string;
  description: string;
  plannedDate: Timestamp;
  leadAuditor: string;
  status: AuditStatus;
  processes: string[];
  normPointCodes: string[];
  findings: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Tipo para cliente (con strings ISO)
export interface Audit {
  id: string;
  title: string;
  description: string;
  plannedDate: string;
  leadAuditor: string;
  status: AuditStatus;
  processes: string[];
  normPointCodes: string[];
  findings: string;
  createdAt: string;
  updatedAt: string;
}

// Para formularios (sin timestamps)
export interface AuditFormData {
  title: string;
  description: string;
  plannedDate: Date;
  leadAuditor: string;
}

// Para actualizar ejecución
export interface AuditExecutionData {
  processes: string[];
  normPointCodes: string[];
  findings: string;
}
