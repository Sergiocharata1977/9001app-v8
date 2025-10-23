import { z } from 'zod';

// Department schemas
export const departmentSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  responsible_user_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const departmentFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  responsible_user_id: z.string().optional(),
  is_active: z.boolean(),
});

// Position schemas
export const positionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  descripcion_responsabilidades: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  requisitos_experiencia: z.string().max(500, 'Máximo 500 caracteres').optional(),
  requisitos_formacion: z.string().max(500, 'Máximo 500 caracteres').optional(),
  departamento_id: z.string().optional(),
  reporta_a_id: z.string().optional(),
});

export const positionFormSchema = positionSchema;

// Personnel schemas
export const personnelSchema = z.object({
  nombres: z.string().min(1, 'Los nombres son requeridos').max(50, 'Máximo 50 caracteres'),
  apellidos: z.string().min(1, 'Los apellidos son requeridos').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().max(20, 'Máximo 20 caracteres').optional(),
  documento_identidad: z.string().max(20, 'Máximo 20 caracteres').optional(),
  fecha_nacimiento: z.date().optional(),
  nacionalidad: z.string().max(50, 'Máximo 50 caracteres').optional(),
  direccion: z.string().max(200, 'Máximo 200 caracteres').optional(),
  telefono_emergencia: z.string().max(20, 'Máximo 20 caracteres').optional(),
  fecha_contratacion: z.date().optional(),
  numero_legajo: z.string().max(20, 'Máximo 20 caracteres').optional(),
  estado: z.enum(['Activo', 'Inactivo']).default('Activo'),
  meta_mensual: z.number().min(0, 'Debe ser mayor o igual a 0').default(0),
  comision_porcentaje: z.number().min(0, 'Debe ser mayor o igual a 0').max(100, 'Máximo 100%').default(0),
  supervisor_id: z.string().optional(),
  especialidad_ventas: z.string().max(100, 'Máximo 100 caracteres').optional(),
  fecha_inicio_ventas: z.date().optional(),
  tipo_personal: z.enum(['administrativo', 'ventas', 'técnico', 'supervisor', 'gerencial']).default('administrativo'),
  zona_venta: z.string().max(50, 'Máximo 50 caracteres').optional(),
});

export const personnelFormSchema = personnelSchema;

// Training schemas
export const trainingSchema = z.object({
  tema: z.string().min(1, 'El tema es requerido').max(150, 'Máximo 150 caracteres'),
  descripcion: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  fecha_inicio: z.date(),
  fecha_fin: z.date(),
  horas: z.number().min(0, 'Debe ser mayor o igual a 0').optional(),
  modalidad: z.enum(['presencial', 'virtual', 'mixta']),
  proveedor: z.string().max(150, 'Máximo 150 caracteres').optional(),
  costo: z.number().min(0, 'Debe ser mayor o igual a 0').optional(),
  estado: z.enum(['planificada', 'en_curso', 'completada', 'cancelada']).default('planificada'),
  certificado_url: z.string().url('URL inválida').optional().or(z.literal('')),
  participantes: z.array(z.string()).default([]),
});

export const trainingFormSchema = trainingSchema;

// Performance Evaluation schemas
export const competencySchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  puntaje: z.number().min(0, 'Mínimo 0').max(5, 'Máximo 5'),
  comentario: z.string().optional(),
});

export const performanceEvaluationSchema = z.object({
  personnel_id: z.string().min(1, 'El personal es requerido'),
  periodo: z.string().min(1, 'El período es requerido'),
  fecha_evaluacion: z.date(),
  evaluador_id: z.string().min(1, 'El evaluador es requerido'),
  competencias: z.array(competencySchema).min(1, 'Debe tener al menos una competencia'),
  resultado_global: z.enum(['bajo', 'medio', 'alto', 'excelente']),
  comentarios_generales: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  plan_mejora: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  estado: z.enum(['borrador', 'publicado', 'cerrado']).default('borrador'),
});

export const performanceEvaluationFormSchema = performanceEvaluationSchema;

// Filter schemas
export const departmentFiltersSchema = z.object({
  search: z.string().optional(),
  is_active: z.boolean().optional(),
  responsible_user_id: z.string().optional(),
});

export const positionFiltersSchema = z.object({
  search: z.string().optional(),
  departamento_id: z.string().optional(),
  reporta_a_id: z.string().optional(),
});

export const personnelFiltersSchema = z.object({
  search: z.string().optional(),
  estado: z.enum(['Activo', 'Inactivo']).optional(),
  tipo_personal: z.enum(['administrativo', 'ventas', 'técnico', 'supervisor', 'gerencial']).optional(),
  supervisor_id: z.string().optional(),
});

export const trainingFiltersSchema = z.object({
  search: z.string().optional(),
  estado: z.enum(['planificada', 'en_curso', 'completada', 'cancelada']).optional(),
  modalidad: z.enum(['presencial', 'virtual', 'mixta']).optional(),
  fecha_inicio: z.date().optional(),
  fecha_fin: z.date().optional(),
});

export const performanceEvaluationFiltersSchema = z.object({
  search: z.string().optional(),
  estado: z.enum(['borrador', 'publicado', 'cerrado']).optional(),
  periodo: z.string().optional(),
  personnel_id: z.string().optional(),
  evaluador_id: z.string().optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type DepartmentFormData = z.infer<typeof departmentFormSchema>;
export type PositionFormData = z.infer<typeof positionFormSchema>;
export type PersonnelFormData = z.infer<typeof personnelFormSchema>;
export type TrainingFormData = z.infer<typeof trainingFormSchema>;
export type PerformanceEvaluationFormData = z.infer<typeof performanceEvaluationFormSchema>;

export type DepartmentFilters = z.infer<typeof departmentFiltersSchema>;
export type PositionFilters = z.infer<typeof positionFiltersSchema>;
export type PersonnelFilters = z.infer<typeof personnelFiltersSchema>;
export type TrainingFilters = z.infer<typeof trainingFiltersSchema>;
export type PerformanceEvaluationFilters = z.infer<typeof performanceEvaluationFiltersSchema>;

export type PaginationParams = z.infer<typeof paginationSchema>;