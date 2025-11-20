/**
 * Estructura Organizacional Consolidada
 * Unifica: Organigramas, Flujogramas y Relación de Procesos
 * Incluye también el Mapa de Procesos (clasificación estratégica)
 */

export interface OrganizationalStructure {
  id: string;
  
  // ===== METADATOS GENERALES =====
  codigo: string; // Ej: "EST-ORG-2025"
  nombre: string;
  descripcion?: string;
  version: number;
  fecha_vigencia_desde: string;
  fecha_vigencia_hasta?: string;
  estado: 'borrador' | 'vigente' | 'historico';
  
  // ===== ORGANIGRAMA (Estructura Jerárquica) =====
  organigrama: {
    nodos: Array<{
      nodo_id: string;
      tipo: 'departamento' | 'puesto' | 'persona';
      referencia_id?: string; // ID del departamento/puesto/persona
      referencia_nombre?: string;
      padre_id?: string; // Jerarquía
      nivel: number;
      orden: number;
      posicion_x?: number;
      posicion_y?: number;
      metadata?: {
        color?: string;
        icono?: string;
        descripcion_cargo?: string;
        responsabilidades?: string[];
      };
    }>;
    configuracion_visual?: {
      orientacion: 'vertical' | 'horizontal';
      estilo: 'clasico' | 'moderno' | 'organico';
      mostrar_fotos?: boolean;
      colores_departamentos?: Record<string, string>;
    };
  };
  
  // ===== FLUJOGRAMAS (Diagramas de Flujo de Procesos) =====
  flujogramas: Array<{
    flujograma_id: string;
    proceso_id?: string; // Vinculado a ProcessDefinition
    proceso_nombre?: string;
    nombre: string;
    descripcion?: string;
    elementos: Array<{
      elemento_id: string;
      tipo: 'inicio' | 'proceso' | 'decisión' | 'documento' | 'conector' | 'fin' | 'subproceso' | 'nota';
      etiqueta: string;
      posicion_x: number;
      posicion_y: number;
      ancho?: number;
      alto?: number;
      metadata?: {
        descripcion?: string;
        responsable?: string;
        documentos_asociados?: string[];
        tiempo_estimado?: number;
        criterio_decision?: string;
        condiciones_salida?: Array<{ etiqueta: string; destino_id: string }>;
      };
    }>;
    conexiones: Array<{
      conexion_id: string;
      desde_id: string;
      hacia_id: string;
      etiqueta?: string;
      tipo_linea?: 'recta' | 'curva' | 'elbow';
    }>;
    configuracion_visual?: {
      tema_color?: string;
      orientacion?: 'vertical' | 'horizontal';
      mostrar_grid?: boolean;
      zoom?: number;
    };
  }>;
  
  // ===== RELACIONES ENTRE PROCESOS =====
  relaciones_procesos: Array<{
    relacion_id: string;
    proceso_origen_id: string;
    proceso_origen_nombre?: string;
    proceso_destino_id: string;
    proceso_destino_nombre?: string;
    tipo_relacion: 'entrada' | 'salida' | 'proveedor' | 'cliente' | 'interaccion' | 'dependencia' | 'colaboracion';
    descripcion: string;
    elemento_relacionado?: {
      tipo: 'documento' | 'informacion' | 'producto' | 'servicio' | 'recurso';
      nombre: string;
      descripcion?: string;
      codigo_referencia?: string;
    };
    frecuencia?: 'continua' | 'diaria' | 'semanal' | 'mensual' | 'trimestral' | 'anual' | 'evento';
    importancia: 'baja' | 'media' | 'alta' | 'critica';
    canales_comunicacion?: string[];
    responsable_gestion?: string;
    indicadores_relacion?: Array<{
      nombre: string;
      tipo: 'tiempo' | 'calidad' | 'cantidad' | 'costo';
      meta?: number;
      unidad?: string;
    }>;
    riesgos_asociados?: Array<{
      descripcion: string;
      probabilidad: 'baja' | 'media' | 'alta';
      impacto: 'bajo' | 'medio' | 'alto';
      mitigacion?: string;
    }>;
    estado: 'activa' | 'suspendida' | 'obsoleta';
  }>;
  
  // ===== MAPA DE PROCESOS (Clasificación Estratégica) =====
  mapa_procesos?: {
    procesos_estrategicos: string[]; // IDs de ProcessDefinition
    procesos_operativos: string[];
    procesos_apoyo: string[];
    descripcion_mapa?: string;
  };
  
  // ===== APROBACIÓN Y DOCUMENTOS =====
  aprobador_id?: string;
  aprobador_nombre?: string;
  fecha_aprobacion?: string;
  documento_url?: string;
  adjuntos?: Array<{ nombre: string; url: string }>;
  
  // ===== METADATA =====
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  is_active: boolean;
}

export interface CreateOrganizationalStructureData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  version?: number;
  fecha_vigencia_desde: string;
  fecha_vigencia_hasta?: string;
  organigrama: {
    nodos: Array<{
      nodo_id: string;
      tipo: string;
      referencia_id?: string;
      referencia_nombre?: string;
      padre_id?: string;
      nivel: number;
      orden: number;
      posicion_x?: number;
      posicion_y?: number;
      metadata?: {
        color?: string;
        icono?: string;
        descripcion_cargo?: string;
        responsabilidades?: string[];
      };
    }>;
    configuracion_visual?: {
      orientacion: string;
      estilo: string;
      mostrar_fotos?: boolean;
      colores_departamentos?: Record<string, string>;
    };
  };
  flujogramas?: Array<{
    flujograma_id: string;
    proceso_id?: string;
    proceso_nombre?: string;
    nombre: string;
    descripcion?: string;
    elementos: Array<{
      elemento_id: string;
      tipo: string;
      etiqueta: string;
      posicion_x: number;
      posicion_y: number;
      ancho?: number;
      alto?: number;
      metadata?: Record<string, unknown>;
    }>;
    conexiones: Array<{
      conexion_id: string;
      desde_id: string;
      hacia_id: string;
      etiqueta?: string;
      tipo_linea?: string;
    }>;
    configuracion_visual?: Record<string, unknown>;
  }>;
  relaciones_procesos?: Array<{
    relacion_id: string;
    proceso_origen_id: string;
    proceso_origen_nombre?: string;
    proceso_destino_id: string;
    proceso_destino_nombre?: string;
    tipo_relacion: string;
    descripcion: string;
    elemento_relacionado?: Record<string, unknown>;
    frecuencia?: string;
    importancia: string;
    canales_comunicacion?: string[];
    responsable_gestion?: string;
    indicadores_relacion?: Array<Record<string, unknown>>;
    riesgos_asociados?: Array<Record<string, unknown>>;
    estado?: string;
  }>;
  mapa_procesos?: {
    procesos_estrategicos: string[];
    procesos_operativos: string[];
    procesos_apoyo: string[];
    descripcion_mapa?: string;
  };
  aprobador_id?: string;
  fecha_aprobacion?: string;
  documento_url?: string;
  adjuntos?: Array<{ nombre: string; url: string }>;
  created_by: string;
}

export interface UpdateOrganizationalStructureData {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  version?: number;
  fecha_vigencia_desde?: string;
  fecha_vigencia_hasta?: string;
  estado?: string;
  organigrama?: {
    nodos: Array<{
      nodo_id: string;
      tipo: string;
      referencia_id?: string;
      referencia_nombre?: string;
      padre_id?: string;
      nivel: number;
      orden: number;
      posicion_x?: number;
      posicion_y?: number;
      metadata?: Record<string, unknown>;
    }>;
    configuracion_visual?: Record<string, unknown>;
  };
  flujogramas?: Array<Record<string, unknown>>;
  relaciones_procesos?: Array<Record<string, unknown>>;
  mapa_procesos?: {
    procesos_estrategicos: string[];
    procesos_operativos: string[];
    procesos_apoyo: string[];
    descripcion_mapa?: string;
  };
  aprobador_id?: string;
  fecha_aprobacion?: string;
  documento_url?: string;
  adjuntos?: Array<{ nombre: string; url: string }>;
  updated_by?: string;
}

// Types
export type EstadoEstructura = 'borrador' | 'vigente' | 'historico';
export type TipoNodo = 'departamento' | 'puesto' | 'persona';
export type OrientacionVisual = 'vertical' | 'horizontal';
export type EstiloVisual = 'clasico' | 'moderno' | 'organico';
export type TipoElementoFlujograma = 'inicio' | 'proceso' | 'decisión' | 'documento' | 'conector' | 'fin' | 'subproceso' | 'nota';
export type TipoLineaFlujograma = 'recta' | 'curva' | 'elbow';
export type TipoRelacionProcesos = 'entrada' | 'salida' | 'proveedor' | 'cliente' | 'interaccion' | 'dependencia' | 'colaboracion';
export type ImportanciaRelacion = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoRelacion = 'activa' | 'suspendida' | 'obsoleta';
export type FrecuenciaRelacion = 'continua' | 'diaria' | 'semanal' | 'mensual' | 'trimestral' | 'anual' | 'evento';
