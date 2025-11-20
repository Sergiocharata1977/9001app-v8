/**
 * Contexto de la Organización (Cláusula 4.1 ISO 9001)
 * Gestiona cuestiones externas e internas que afectan al SGC
 * Vinculado con Análisis FODA
 */

export interface OrganizationalContext {
  id: string;
  
  // ===== CUESTIONES EXTERNAS =====
  cuestiones_externas: Array<{
    tipo: 'economico' | 'tecnologico' | 'competitivo' | 'mercado' | 'cultural' | 'social' | 'legal' | 'ambiental';
    descripcion: string;
    impacto: 'positivo' | 'negativo' | 'neutral';
    nivel_impacto: 'bajo' | 'medio' | 'alto';
    ambito: 'internacional' | 'nacional' | 'regional' | 'local';
  }>;
  
  // ===== CUESTIONES INTERNAS =====
  cuestiones_internas: Array<{
    tipo: 'valores' | 'cultura' | 'conocimientos' | 'desempeño' | 'recursos' | 'capacidades' | 'estructura';
    descripcion: string;
    estado_actual: string;
    fortaleza_debilidad: 'fortaleza' | 'debilidad';
  }>;
  
  // ===== VINCULACIÓN CON FODA =====
  analisis_foda_id?: string; // Referencia al FODA organizacional
  
  // ===== ANÁLISIS =====
  fecha_analisis: string;
  responsable_analisis: string;
  participantes?: string[];
  
  // ===== REVISIÓN =====
  frecuencia_revision: 'trimestral' | 'semestral' | 'anual';
  ultima_revision?: string;
  proxima_revision?: string;
  estado: 'vigente' | 'en_revision' | 'obsoleto';
  
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface CreateOrganizationalContextData {
  cuestiones_externas: Array<{
    tipo: string;
    descripcion: string;
    impacto: string;
    nivel_impacto: string;
    ambito: string;
  }>;
  cuestiones_internas: Array<{
    tipo: string;
    descripcion: string;
    estado_actual: string;
    fortaleza_debilidad: string;
  }>;
  analisis_foda_id?: string;
  fecha_analisis: string;
  responsable_analisis: string;
  participantes?: string[];
  frecuencia_revision: string;
  created_by: string;
}

export interface UpdateOrganizationalContextData {
  cuestiones_externas?: Array<{
    tipo: string;
    descripcion: string;
    impacto: string;
    nivel_impacto: string;
    ambito: string;
  }>;
  cuestiones_internas?: Array<{
    tipo: string;
    descripcion: string;
    estado_actual: string;
    fortaleza_debilidad: string;
  }>;
  analisis_foda_id?: string;
  fecha_analisis?: string;
  responsable_analisis?: string;
  participantes?: string[];
  frecuencia_revision?: string;
  ultima_revision?: string;
  proxima_revision?: string;
  estado?: string;
  updated_by?: string;
}

export type TipoCuestionExterna = 'economico' | 'tecnologico' | 'competitivo' | 'mercado' | 'cultural' | 'social' | 'legal' | 'ambiental';
export type TipoCuestionInterna = 'valores' | 'cultura' | 'conocimientos' | 'desempeño' | 'recursos' | 'capacidades' | 'estructura';
export type ImpactoCuestion = 'positivo' | 'negativo' | 'neutral';
export type NivelImpacto = 'bajo' | 'medio' | 'alto';
export type AmbitoCuestion = 'internacional' | 'nacional' | 'regional' | 'local';
export type FortalezaDebilidad = 'fortaleza' | 'debilidad';
export type FrecuenciaRevision = 'trimestral' | 'semestral' | 'anual';
export type EstadoContexto = 'vigente' | 'en_revision' | 'obsoleto';
