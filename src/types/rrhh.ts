// Tipos para el módulo de Recursos Humanos

// ===== NUEVOS TIPOS PARA SISTEMA DE COMPETENCIAS =====

export interface Competence {
  id: string; // Auto-generado por Firestore
  nombre: string; // Ej: "Trabajo en equipo", "Interpretación de planos"
  categoria: CompetenceCategory; // 'tecnica' | 'blanda' | 'seguridad' | 'iso_9001' | 'otra'
  descripcion: string; // Descripción detallada
  fuente: string; // 'interna' | 'iso_9001' | 'cliente' | 'legal'
  referenciaNorma?: string; // Ej: "ISO 9001:2015 7.2" (opcional)
  activo: boolean; // default true
  created_at: Date;
  updated_at: Date;
}

export type CompetenceCategory =
  | 'tecnica'
  | 'blanda'
  | 'seguridad'
  | 'iso_9001'
  | 'otra';

export interface CompetenceFormData {
  nombre: string;
  categoria: CompetenceCategory;
  descripcion: string;
  fuente: string;
  referenciaNorma?: string;
  activo?: boolean;
}

export interface CompetenceFilters {
  search?: string;
  categoria?: CompetenceCategory;
  activo?: boolean;
  organization_id?: string;
}

// ===== TIPOS PARA ANÁLISIS DE BRECHAS =====

export interface CompetenceEvaluation {
  competenciaId: string; // ID de la competencia
  nombreCompetencia: string; // Nombre (desnormalizado para reportes)
  nivelRequerido: number; // Nivel que requiere el puesto (1-5)
  nivelEvaluado: number; // Nivel alcanzado por el empleado (1-5)
  observaciones?: string; // Comentarios del evaluador (opcional)
  brecha: number; // Calculado: nivelRequerido - nivelEvaluado
}

export interface CompetenceGap {
  personnelId: string;
  personnelName: string;
  puestoId: string;
  puestoName: string;
  competenciaId: string;
  competenciaNombre: string;
  nivelRequerido: number;
  nivelActual: number;
  brecha: number; // nivelRequerido - nivelActual
  severidad: 'critica' | 'media' | 'baja'; // Basado en tamaño de brecha
  capacitacionesSugeridas: string[]; // IDs de trainings recomendados
  fechaUltimaEvaluacion?: Date;
}

// ===== TIPOS PARA SISTEMA DE ALERTAS =====

export interface EvaluationAlert {
  personnelId: string;
  personnelName: string;
  puestoId: string;
  puestoName: string;
  ultimaEvaluacion?: Date;
  proximaEvaluacion: Date;
  diasRestantes: number; // Días hasta próxima evaluación
  estado: 'proxima' | 'vencida'; // proxima: <30 días, vencida: <0 días
  frecuenciaEvaluacion: number; // Meses
}

// ===== TIPOS PARA REPORTES =====

export interface CompetenceReport {
  organizationId: string;
  fechaGeneracion: Date;
  periodo: string;
  totalEmpleados: number;
  totalCompetencias: number;
  coberturaPromedio: number;
  brechasCriticas: number;
  brechasMedias: number;
  brechasBajas: number;
  capacitacionesPendientes: number;
}

export interface CoverageMetrics {
  totalEmpleados: number;
  empleadosConBrechas: number;
  porcentajeCobertura: number;
  brechasPorSeveridad: {
    critica: number;
    media: number;
    baja: number;
  };
  capacitacionesSugeridas: number;
}

// ===== MODIFICACIONES A TIPOS EXISTENTES =====

export interface Department {
  id: string;
  name: string;
  description?: string;
  responsible_user_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Position {
  id: string;
  nombre: string;
  descripcion_responsabilidades?: string;
  requisitos_experiencia?: string;
  requisitos_formacion?: string;
  departamento_id?: string;
  reporta_a_id?: string;

  // Asignaciones de contexto para IA Don Cándido
  procesos_asignados?: string[]; // Array de ProcessDefinition IDs
  objetivos_asignados?: string[]; // Array de QualityObjective IDs
  indicadores_asignados?: string[]; // Array de QualityIndicator IDs

  // ===== NUEVOS CAMPOS PARA SISTEMA DE COMPETENCIAS =====
  competenciasRequeridas: string[]; // Array de IDs de competencias
  frecuenciaEvaluacion: number; // Meses (ej: 6, 12, 24)
  nivel: PositionLevel; // 'operativo' | 'tecnico' | 'gerencial'

  created_at: Date;
  updated_at: Date;
}

export type PositionLevel = 'operativo' | 'tecnico' | 'gerencial';

export interface Personnel {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  documento_identidad?: string;
  fecha_nacimiento?: Date;
  nacionalidad?: string;
  direccion?: string;
  telefono_emergencia?: string;
  fecha_contratacion?: Date;
  numero_legajo?: string;
  estado: 'Activo' | 'Inactivo' | 'Licencia';
  meta_mensual: number;
  comision_porcentaje: number;
  supervisor_id?: string;
  especialidad_ventas?: string;
  fecha_inicio_ventas?: Date;
  tipo_personal:
    | 'administrativo'
    | 'ventas'
    | 'técnico'
    | 'supervisor'
    | 'gerencial';
  zona_venta?: string;
  // Campos adicionales para UI
  foto?: string;
  puesto?: string;
  departamento?: string;
  supervisor_nombre?: string; // Nombre del supervisor para UI
  fecha_ingreso?: Date | { seconds: number; nanoseconds: number };
  salario?: string;
  certificaciones?: string[];
  ultima_evaluacion?: Date | { seconds: number; nanoseconds: number };

  // NEW FIELDS for IA Context:
  procesos_asignados?: string[]; // Array of processDefinition IDs
  objetivos_asignados?: string[]; // Array of qualityObjective IDs
  indicadores_asignados?: string[]; // Array of qualityIndicator IDs

  // ===== NUEVOS CAMPOS PARA SISTEMA DE COMPETENCIAS =====
  puestoId?: string; // MODIFICAR: de texto a ID referencia (opcional por ahora)
  competenciasActuales?: CompetenceStatus[]; // AGREGAR: Estado actual de competencias
  capacitacionesRealizadas?: string[]; // AGREGAR: IDs de trainings completados
  evaluaciones?: string[]; // AGREGAR: IDs de evaluaciones

  created_at: Date;
  updated_at: Date;
}

export interface CompetenceStatus {
  competenciaId: string;
  nivelAlcanzado: number;
  fechaUltimaEvaluacion: Date;
}

export interface Training {
  id: string;
  tema: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  horas?: number;
  modalidad: 'presencial' | 'virtual' | 'mixta';
  proveedor?: string;
  costo?: number;
  estado: 'planificada' | 'en_curso' | 'completada' | 'cancelada';
  certificado_url?: string;
  participantes: string[];

  // ===== NUEVOS CAMPOS PARA VINCULACIÓN CON COMPETENCIAS =====
  competenciasDesarrolladas?: string[]; // IDs de competencias que desarrolla (opcional)
  evaluacionPosterior?: boolean; // ¿Requiere evaluación post-capacitación? (opcional)
  evaluacionPosteriorId?: string; // ID de evaluación post (si existe)

  created_at: Date;
  updated_at: Date;
}

export interface PerformanceEvaluation {
  id: string;
  personnel_id: string;
  periodo: string;
  fecha_evaluacion: Date;
  evaluador_id: string;

  // ===== MODIFICACIÓN: ESTRUCTURA MEJORADA DE COMPETENCIAS =====
  competencias: CompetenceEvaluation[]; // MODIFICAR estructura

  // ===== NUEVOS CAMPOS =====
  puestoId?: string; // AGREGAR: Referencia al puesto (opcional por ahora)
  resultado_global: EvaluationResult; // MODIFICAR enum
  fechaProximaEvaluacion?: Date; // AGREGAR: Calculado automáticamente (opcional)

  comentarios_generales?: string;
  plan_mejora?: string;
  estado: 'borrador' | 'publicado' | 'cerrado';
  created_at: Date;
  updated_at: Date;
}

export type EvaluationResult = 'Apto' | 'No Apto' | 'Requiere Capacitación';

// Tipos para formularios
export interface DepartmentFormData {
  name: string;
  description?: string;
  responsible_user_id?: string;
  is_active: boolean;
}

export interface PositionFormData {
  nombre: string;
  descripcion_responsabilidades?: string;
  requisitos_experiencia?: string;
  requisitos_formacion?: string;
  departamento_id?: string;
  reporta_a_id?: string;

  // ===== NUEVOS CAMPOS =====
  competenciasRequeridas?: string[];
  frecuenciaEvaluacion?: number;
  nivel?: PositionLevel;
}

// Tipo extendido con datos expandidos y conteo de personal
export interface PositionWithAssignments extends Position {
  procesos_details?: unknown[]; // ProcessDefinition[] - evitamos import circular
  objetivos_details?: unknown[]; // QualityObjective[] - evitamos import circular
  indicadores_details?: unknown[]; // QualityIndicator[] - evitamos import circular
  personnel_count?: number; // Cantidad de personas en este puesto
}

// Form data para asignaciones de contexto
export interface PositionAssignmentsFormData {
  procesos_asignados: string[];
  objetivos_asignados: string[];
  indicadores_asignados: string[];
}

export interface PersonnelFormData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  documento_identidad?: string;
  fecha_nacimiento?: Date;
  nacionalidad?: string;
  direccion?: string;
  telefono_emergencia?: string;
  fecha_contratacion?: Date;
  numero_legajo?: string;
  estado: 'Activo' | 'Inactivo' | 'Licencia';
  meta_mensual: number;
  comision_porcentaje: number;
  supervisor_id?: string;
  especialidad_ventas?: string;
  fecha_inicio_ventas?: Date;
  tipo_personal:
    | 'administrativo'
    | 'ventas'
    | 'técnico'
    | 'supervisor'
    | 'gerencial';
  zona_venta?: string;
  // Campos adicionales para UI
  foto?: string;
  puesto?: string;
  departamento?: string;
  supervisor?: string;
  fecha_ingreso?: Date;
  salario?: string;
  certificaciones?: string[];

  // NEW FIELDS for IA Context:
  procesos_asignados?: string[];
  objetivos_asignados?: string[];
  indicadores_asignados?: string[];

  // ===== NUEVOS CAMPOS PARA SISTEMA DE COMPETENCIAS =====
  puestoId?: string;
  competenciasActuales?: CompetenceStatus[];
  capacitacionesRealizadas?: string[];
  evaluaciones?: string[];
}

export interface TrainingFormData {
  tema: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  horas?: number;
  modalidad: 'presencial' | 'virtual' | 'mixta';
  proveedor?: string;
  costo?: number;
  estado: 'planificada' | 'en_curso' | 'completada' | 'cancelada';
  certificado_url?: string;
  participantes: string[];

  // ===== NUEVOS CAMPOS =====
  competenciasDesarrolladas?: string[]; // Opcional
  evaluacionPosterior?: boolean; // Opcional
}

export interface PerformanceEvaluationFormData {
  personnel_id: string;
  periodo: string;
  fecha_evaluacion: Date;
  evaluador_id: string;

  // ===== MODIFICACIÓN: ESTRUCTURA MEJORADA =====
  competencias: CompetenceEvaluation[];

  // ===== NUEVOS CAMPOS =====
  puestoId?: string; // Opcional por ahora
  resultado_global: EvaluationResult;
  fechaProximaEvaluacion?: Date; // Opcional

  comentarios_generales?: string;
  plan_mejora?: string;
  estado: 'borrador' | 'publicado' | 'cerrado';
}

// Tipos para filtros y búsqueda
export interface DepartmentFilters {
  search?: string;
  is_active?: boolean;
  responsible_user_id?: string;
}

export interface PositionFilters {
  search?: string;
  departamento_id?: string;
  reporta_a_id?: string;
}

export interface PersonnelFilters {
  search?: string;
  estado?: 'Activo' | 'Inactivo' | 'Licencia';
  tipo_personal?:
    | 'administrativo'
    | 'ventas'
    | 'técnico'
    | 'supervisor'
    | 'gerencial';
  supervisor_id?: string;
}

export interface TrainingFilters {
  search?: string;
  estado?: 'planificada' | 'en_curso' | 'completada' | 'cancelada';
  modalidad?: 'presencial' | 'virtual' | 'mixta';
  fecha_inicio?: Date;
  fecha_fin?: Date;
}

export interface PerformanceEvaluationFilters {
  search?: string;
  estado?: 'borrador' | 'publicado' | 'cerrado';
  periodo?: string;
  personnel_id?: string;
  evaluador_id?: string;
}

// Tipos para paginación
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para estadísticas del dashboard
export interface RRHHStats {
  total_personnel: number;
  active_personnel: number;
  total_departments: number;
  active_departments: number;
  total_positions: number;
  active_trainings: number;
  pending_evaluations: number;
  completed_trainings: number;
}

// Tipos para relaciones extendidas
export interface PersonnelWithRelations extends Personnel {
  department?: Department;
  position?: Position;
  supervisor?: Personnel;
  subordinates?: Personnel[];
}

export interface TrainingWithRelations extends Training {
  participants_data?: Personnel[];
}

export interface PerformanceEvaluationWithRelations
  extends PerformanceEvaluation {
  personnel_data?: Personnel;
  evaluador_data?: Personnel;
}

// Tipos para Kanban
export interface KanbanItem {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  assignee?: string;
  dueDate?: string;
  progress?: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  maxItems?: number;
  allowDrop: boolean;
  order: number;
}

// Tipos para filtros y paginación
export interface TrainingFilters {
  search?: string;
  estado?: Training['estado'];
  modalidad?: Training['modalidad'];
  fecha_inicio?: Date;
  fecha_fin?: Date;
}

export interface PerformanceEvaluationFilters {
  search?: string;
  estado?: PerformanceEvaluation['estado'];
  periodo?: string;
  personnel_id?: string;
  evaluador_id?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
