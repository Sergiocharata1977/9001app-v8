// Types for user context aggregation

import { User } from './auth';
import { Personnel, Position, Department } from './rrhh';
import { ProcessDefinition, ProcessRecord } from './procesos';
import { QualityObjective, QualityIndicator } from './quality';

export interface UserContext {
  user: User;
  personnel: Personnel | null;
  position: Position | null;
  department: Department | null;
  procesos: ProcessDefinition[];
  objetivos: QualityObjective[];
  indicadores: QualityIndicator[];
  supervisor?: Personnel;
  processRecords?: ProcessRecord[]; // Trello-like records

  // FUTURE (when specific registros are implemented):
  // auditorias?: {
  //   pendientes: Auditoria[];
  //   vencidas: Auditoria[];
  //   completadas_mes: Auditoria[];
  // };
  // hallazgos?: {
  //   abiertos: Hallazgo[];
  //   requieren_seguimiento: Hallazgo[];
  //   por_severidad: Record<string, number>;
  // };
  // acciones_correctivas?: {
  //   en_progreso: AccionCorrectiva[];
  //   vencidas: AccionCorrectiva[];
  //   pendientes_validacion: AccionCorrectiva[];
  // };
}

export interface UserContextLight {
  user: User;
  personnel: Personnel | null;
  position: Position | null;
  department: Department | null;
}

export interface PersonnelWithAssignments extends Personnel {
  procesos_details?: ProcessDefinition[];
  objetivos_details?: QualityObjective[];
  indicadores_details?: QualityIndicator[];
}
