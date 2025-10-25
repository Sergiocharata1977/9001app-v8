// Tipos para el módulo de Recursos Humanos

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
  created_at: Date;
  updated_at: Date;
}

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
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
  updated_at: Date;
}

export interface PerformanceEvaluation {
  id: string;
  personnel_id: string;
  periodo: string;
  fecha_evaluacion: Date;
  evaluador_id: string;
  competencias: {
    nombre: string;
    puntaje: number; // 0-5
    comentario?: string;
  }[];
  resultado_global: 'bajo' | 'medio' | 'alto' | 'excelente';
  comentarios_generales?: string;
  plan_mejora?: string;
  estado: 'borrador' | 'publicado' | 'cerrado';
  created_at: Date;
  updated_at: Date;
}

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
  estado: 'Activo' | 'Inactivo';
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
}

export interface PerformanceEvaluationFormData {
  personnel_id: string;
  periodo: string;
  fecha_evaluacion: Date;
  evaluador_id: string;
  competencias: {
    nombre: string;
    puntaje: number;
    comentario?: string;
  }[];
  resultado_global: 'bajo' | 'medio' | 'alto' | 'excelente';
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
  estado?: 'Activo' | 'Inactivo';
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
