/**
 * Alcance del Sistema de Gestión de Calidad (Cláusula 4.3 ISO 9001)
 * Define los límites, productos/servicios cubiertos y exclusiones del SGC
 */

export interface SGCScope {
  id: string;
  
  // ===== ALCANCE =====
  descripcion_alcance: string;
  limites_sgc: string;
  
  // ===== PRODUCTOS Y SERVICIOS =====
  productos_servicios_cubiertos: Array<{
    nombre: string;
    descripcion: string;
    tipo: 'producto' | 'servicio';
  }>;
  
  // ===== PROCESOS =====
  procesos_incluidos: string[]; // IDs de ProcessDefinition
  procesos_excluidos?: Array<{
    proceso_id: string;
    proceso_nombre: string;
    justificacion_exclusion: string;
  }>;
  
  // ===== UBICACIONES =====
  ubicaciones_cubiertas: Array<{
    nombre: string;
    direccion?: string;
    tipo: 'sede_principal' | 'sucursal' | 'planta' | 'almacen' | 'oficina';
  }>;
  
  // ===== EXCLUSIONES ISO 9001 =====
  requisitos_no_aplicables?: Array<{
    clausula_iso: string; // Ej: "8.3"
    titulo_clausula: string; // Ej: "Diseño y desarrollo"
    justificacion: string;
  }>;
  
  // ===== DOCUMENTO =====
  documento_url?: string;
  version: number;
  fecha_aprobacion?: string;
  aprobado_por?: string;
  estado: 'borrador' | 'vigente' | 'obsoleto';
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface CreateSGCScopeData {
  descripcion_alcance: string;
  limites_sgc: string;
  productos_servicios_cubiertos: Array<{
    nombre: string;
    descripcion: string;
    tipo: 'producto' | 'servicio';
  }>;
  procesos_incluidos: string[];
  procesos_excluidos?: Array<{
    proceso_id: string;
    proceso_nombre: string;
    justificacion_exclusion: string;
  }>;
  ubicaciones_cubiertas: Array<{
    nombre: string;
    direccion?: string;
    tipo: 'sede_principal' | 'sucursal' | 'planta' | 'almacen' | 'oficina';
  }>;
  requisitos_no_aplicables?: Array<{
    clausula_iso: string;
    titulo_clausula: string;
    justificacion: string;
  }>;
  documento_url?: string;
  fecha_aprobacion?: string;
  aprobado_por?: string;
  created_by: string;
}

export interface UpdateSGCScopeData {
  descripcion_alcance?: string;
  limites_sgc?: string;
  productos_servicios_cubiertos?: Array<{
    nombre: string;
    descripcion: string;
    tipo: 'producto' | 'servicio';
  }>;
  procesos_incluidos?: string[];
  procesos_excluidos?: Array<{
    proceso_id: string;
    proceso_nombre: string;
    justificacion_exclusion: string;
  }>;
  ubicaciones_cubiertas?: Array<{
    nombre: string;
    direccion?: string;
    tipo: 'sede_principal' | 'sucursal' | 'planta' | 'almacen' | 'oficina';
  }>;
  requisitos_no_aplicables?: Array<{
    clausula_iso: string;
    titulo_clausula: string;
    justificacion: string;
  }>;
  documento_url?: string;
  fecha_aprobacion?: string;
  aprobado_por?: string;
  estado?: 'borrador' | 'vigente' | 'obsoleto';
  updated_by?: string;
}

export type SGCScopeEstado = 'borrador' | 'vigente' | 'obsoleto';
export type TipoProductoServicio = 'producto' | 'servicio';
export type TipoUbicacion = 'sede_principal' | 'sucursal' | 'planta' | 'almacen' | 'oficina';
