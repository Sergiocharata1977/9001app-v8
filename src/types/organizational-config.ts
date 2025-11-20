/**
 * Configuración Organizacional
 * Gestiona la identidad, misión, visión, valores y configuración general de la organización
 * Single-tenant: No requiere organization_id
 */

export interface OrganizationalConfig {
  id: string; // ID fijo: "org-config-main"
  
  // ===== IDENTIDAD ORGANIZACIONAL =====
  nombre_organizacion: string;
  descripcion_empresa: string;
  sector_industria: string;
  actividades_principales: string[];
  mercado_objetivo: string;
  propuesta_valor: string;
  
  // ===== MÉTRICAS DE EMPLEADOS =====
  cantidad_empleados_total: number;
  cantidad_empleados_con_acceso: number;
  
  // ===== UBICACIÓN =====
  ubicacion: {
    pais: string;
    region?: string;
    ciudad?: string;
    direccion_principal?: string;
  };
  
  // ===== MISIÓN, VISIÓN, VALORES =====
  mision: string;
  vision: string;
  valores: Array<{
    nombre: string;
    descripcion: string;
    comportamientos_esperados?: string[];
  }>;
  
  // ===== PRINCIPIOS DEL SGC (ISO 9001) =====
  principios_sgc: {
    orientacion_cliente: boolean;
    liderazgo: boolean;
    participacion_personal: boolean;
    enfoque_procesos: boolean;
    mejora_continua: boolean;
    gestion_relaciones: boolean;
    enfoque_riesgos: boolean;
    decisiones_evidencia: boolean;
  };
  
  // ===== POLÍTICA DE CALIDAD =====
  politica_calidad: {
    declaracion: string;
    compromisos: string[];
    fecha_aprobacion?: string;
    aprobado_por?: string;
  };
  
  // ===== METADATA =====
  version: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  created_by: string;
  updated_by?: string;
}

export interface CreateOrganizationalConfigData {
  nombre_organizacion: string;
  descripcion_empresa: string;
  sector_industria: string;
  actividades_principales: string[];
  mercado_objetivo: string;
  propuesta_valor: string;
  cantidad_empleados_total: number;
  cantidad_empleados_con_acceso: number;
  ubicacion: {
    pais: string;
    region?: string;
    ciudad?: string;
    direccion_principal?: string;
  };
  mision: string;
  vision: string;
  valores: Array<{
    nombre: string;
    descripcion: string;
    comportamientos_esperados?: string[];
  }>;
  principios_sgc?: {
    orientacion_cliente: boolean;
    liderazgo: boolean;
    participacion_personal: boolean;
    enfoque_procesos: boolean;
    mejora_continua: boolean;
    gestion_relaciones: boolean;
    enfoque_riesgos: boolean;
    decisiones_evidencia: boolean;
  };
  politica_calidad: {
    declaracion: string;
    compromisos: string[];
    fecha_aprobacion?: string;
    aprobado_por?: string;
  };
  created_by: string;
}

export interface UpdateOrganizationalConfigData {
  nombre_organizacion?: string;
  descripcion_empresa?: string;
  sector_industria?: string;
  actividades_principales?: string[];
  mercado_objetivo?: string;
  propuesta_valor?: string;
  cantidad_empleados_total?: number;
  cantidad_empleados_con_acceso?: number;
  ubicacion?: {
    pais: string;
    region?: string;
    ciudad?: string;
    direccion_principal?: string;
  };
  mision?: string;
  vision?: string;
  valores?: Array<{
    nombre: string;
    descripcion: string;
    comportamientos_esperados?: string[];
  }>;
  principios_sgc?: {
    orientacion_cliente: boolean;
    liderazgo: boolean;
    participacion_personal: boolean;
    enfoque_procesos: boolean;
    mejora_continua: boolean;
    gestion_relaciones: boolean;
    enfoque_riesgos: boolean;
    decisiones_evidencia: boolean;
  };
  politica_calidad?: {
    declaracion: string;
    compromisos: string[];
    fecha_aprobacion?: string;
    aprobado_por?: string;
  };
  updated_by?: string;
}
