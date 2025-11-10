// Conversational Form Definitions

import { ConversationalFormDefinition } from '@/types/conversational-forms';

export const FORM_DEFINITIONS: Record<string, ConversationalFormDefinition> = {
  no_conformidad: {
    type: 'no_conformidad',
    name: 'No Conformidad',
    description: 'Registro de una no conformidad detectada',
    collectionName: 'findings',
    fields: [
      {
        name: 'descripcion',
        label: '¿Cuál es el problema detectado?',
        type: 'textarea',
        required: true,
        description: 'Descripción detallada de la no conformidad',
      },
      {
        name: 'area',
        label: '¿En qué área ocurrió?',
        type: 'select',
        required: true,
        options: [
          'Producción',
          'Calidad',
          'Logística',
          'Administración',
          'Ventas',
          'Recursos Humanos',
          'Mantenimiento',
          'Otro',
        ],
      },
      {
        name: 'severidad',
        label: '¿Qué tan grave es?',
        type: 'select',
        required: true,
        options: ['Menor', 'Mayor', 'Crítica'],
        description:
          'Menor: No afecta calidad del producto. Mayor: Afecta calidad. Crítica: Riesgo inmediato',
      },
      {
        name: 'fecha_deteccion',
        label: '¿Cuándo lo detectaste?',
        type: 'date',
        required: true,
        defaultValue: new Date().toISOString().split('T')[0],
      },
      {
        name: 'causa_raiz',
        label: '¿Identificaste la causa raíz? (opcional)',
        type: 'textarea',
        required: false,
      },
    ],
  },

  auditoria: {
    type: 'auditoria',
    name: 'Auditoría',
    description: 'Programación de una auditoría',
    collectionName: 'audits',
    fields: [
      {
        name: 'proceso',
        label: '¿Qué proceso vas a auditar?',
        type: 'text',
        required: true,
      },
      {
        name: 'tipo',
        label: '¿Qué tipo de auditoría es?',
        type: 'select',
        required: true,
        options: ['Interna', 'Externa', 'Certificación', 'Seguimiento'],
      },
      {
        name: 'fecha_programada',
        label: '¿Para cuándo la programas?',
        type: 'date',
        required: true,
      },
      {
        name: 'alcance',
        label: '¿Cuál es el alcance de la auditoría?',
        type: 'textarea',
        required: true,
        description: 'Describe qué aspectos se van a auditar',
      },
      {
        name: 'norma_referencia',
        label: '¿Qué norma se va a auditar? (opcional)',
        type: 'text',
        required: false,
        defaultValue: 'ISO 9001:2015',
      },
    ],
  },

  accion_correctiva: {
    type: 'accion_correctiva',
    name: 'Acción Correctiva',
    description: 'Registro de una acción correctiva',
    collectionName: 'actions',
    fields: [
      {
        name: 'descripcion',
        label: '¿Qué acción correctiva se va a implementar?',
        type: 'textarea',
        required: true,
      },
      {
        name: 'causa_raiz',
        label: '¿Cuál es la causa raíz que se está corrigiendo?',
        type: 'textarea',
        required: true,
      },
      {
        name: 'origen',
        label: '¿De dónde surge esta acción?',
        type: 'select',
        required: true,
        options: [
          'No Conformidad',
          'Auditoría',
          'Queja de Cliente',
          'Mejora Continua',
          'Análisis de Riesgos',
          'Otro',
        ],
      },
      {
        name: 'responsable',
        label: '¿Quién será el responsable de ejecutarla?',
        type: 'text',
        required: true,
      },
      {
        name: 'fecha_limite',
        label: '¿Cuál es la fecha límite de implementación?',
        type: 'date',
        required: true,
      },
      {
        name: 'recursos_necesarios',
        label: '¿Qué recursos se necesitan? (opcional)',
        type: 'textarea',
        required: false,
      },
    ],
  },

  process_record: {
    type: 'process_record',
    name: 'Registro de Proceso',
    description: 'Registro de una actividad de proceso',
    collectionName: 'processRecords',
    fields: [
      {
        name: 'proceso',
        label: '¿A qué proceso pertenece este registro?',
        type: 'text',
        required: true,
      },
      {
        name: 'titulo',
        label: '¿Qué título le ponemos al registro?',
        type: 'text',
        required: true,
      },
      {
        name: 'descripcion',
        label: '¿Qué actividad se realizó?',
        type: 'textarea',
        required: true,
      },
      {
        name: 'fecha_ejecucion',
        label: '¿Cuándo se ejecutó?',
        type: 'date',
        required: true,
        defaultValue: new Date().toISOString().split('T')[0],
      },
      {
        name: 'observaciones',
        label: '¿Alguna observación adicional? (opcional)',
        type: 'textarea',
        required: false,
      },
    ],
  },

  hallazgo: {
    type: 'hallazgo',
    name: 'Hallazgo',
    description: 'Registro de un hallazgo de auditoría',
    collectionName: 'findings',
    fields: [
      {
        name: 'descripcion',
        label: '¿Qué hallazgo se identificó?',
        type: 'textarea',
        required: true,
      },
      {
        name: 'tipo',
        label: '¿Qué tipo de hallazgo es?',
        type: 'select',
        required: true,
        options: [
          'Observación',
          'No Conformidad Menor',
          'No Conformidad Mayor',
          'Oportunidad de Mejora',
        ],
      },
      {
        name: 'clausula',
        label: '¿A qué cláusula de la norma se refiere?',
        type: 'text',
        required: true,
        description: 'Ejemplo: 8.5.1, 7.1.5, etc.',
      },
      {
        name: 'evidencia',
        label: '¿Cuál es la evidencia objetiva?',
        type: 'textarea',
        required: true,
      },
      {
        name: 'area_afectada',
        label: '¿Qué área está afectada?',
        type: 'text',
        required: true,
      },
    ],
  },
};

/**
 * Get form definition by type
 */
export function getFormDefinition(
  formType: string
): ConversationalFormDefinition | null {
  return FORM_DEFINITIONS[formType] || null;
}

/**
 * Get all available form types
 */
export function getAvailableFormTypes(): string[] {
  return Object.keys(FORM_DEFINITIONS);
}

/**
 * Validate if form type exists
 */
export function isValidFormType(formType: string): boolean {
  return formType in FORM_DEFINITIONS;
}
