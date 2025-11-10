/**
 * Lista hardcodeada de puntos de norma ISO 9001:2015
 * Esto elimina la dependencia de Firestore y simplifica la aplicación
 */

// Tipo simplificado para la lista hardcodeada
export interface NormPointSimple {
  id: string;
  code: string;
  title: string;
  requirement: string;
  chapter: number;
  category: string;
}

export const ISO9001_NORM_POINTS: NormPointSimple[] = [
  // Capítulo 4: Contexto de la organización
  {
    id: 'np-4.1',
    code: '4.1',
    title: 'Comprensión de la organización y su contexto',
    requirement:
      'La organización debe determinar las cuestiones externas e internas pertinentes',
    chapter: 4,
    category: 'Contexto',
  },
  {
    id: 'np-4.2',
    code: '4.2',
    title:
      'Comprensión de las necesidades y expectativas de las partes interesadas',
    requirement:
      'La organización debe determinar las partes interesadas y sus requisitos',
    chapter: 4,
    category: 'Contexto',
  },
  {
    id: 'np-4.3',
    code: '4.3',
    title: 'Determinación del alcance del sistema de gestión de calidad',
    requirement:
      'La organización debe determinar los límites y aplicabilidad del SGC',
    chapter: 4,
    category: 'Contexto',
  },
  {
    id: 'np-4.4',
    code: '4.4',
    title: 'Sistema de gestión de calidad y sus procesos',
    requirement:
      'La organización debe establecer, implementar, mantener y mejorar el SGC',
    chapter: 4,
    category: 'Contexto',
  },

  // Capítulo 5: Liderazgo
  {
    id: 'np-5.1',
    code: '5.1',
    title: 'Liderazgo y compromiso',
    requirement:
      'La alta dirección debe demostrar liderazgo y compromiso con el SGC',
    chapter: 5,
    category: 'Liderazgo',
  },
  {
    id: 'np-5.2',
    code: '5.2',
    title: 'Política de calidad',
    requirement:
      'La alta dirección debe establecer, implementar y mantener una política de calidad',
    chapter: 5,
    category: 'Liderazgo',
  },
  {
    id: 'np-5.3',
    code: '5.3',
    title: 'Roles, responsabilidades y autoridades',
    requirement:
      'La alta dirección debe asegurar que se asignen y comuniquen responsabilidades',
    chapter: 5,
    category: 'Liderazgo',
  },

  // Capítulo 6: Planificación
  {
    id: 'np-6.1',
    code: '6.1',
    title: 'Acciones para abordar riesgos y oportunidades',
    requirement:
      'La organización debe planificar acciones para abordar riesgos y oportunidades',
    chapter: 6,
    category: 'Planificación',
  },
  {
    id: 'np-6.2',
    code: '6.2',
    title: 'Objetivos de calidad y planificación',
    requirement: 'La organización debe establecer objetivos de calidad',
    chapter: 6,
    category: 'Planificación',
  },
  {
    id: 'np-6.3',
    code: '6.3',
    title: 'Planificación de los cambios',
    requirement:
      'Cuando se determine la necesidad de cambios en el SGC, estos deben realizarse de manera planificada',
    chapter: 6,
    category: 'Planificación',
  },

  // Capítulo 7: Apoyo
  {
    id: 'np-7.1',
    code: '7.1',
    title: 'Recursos',
    requirement:
      'La organización debe determinar y proporcionar los recursos necesarios',
    chapter: 7,
    category: 'Apoyo',
  },
  {
    id: 'np-7.2',
    code: '7.2',
    title: 'Competencia',
    requirement:
      'La organización debe determinar la competencia necesaria del personal',
    chapter: 7,
    category: 'Apoyo',
  },
  {
    id: 'np-7.3',
    code: '7.3',
    title: 'Toma de conciencia',
    requirement:
      'El personal debe ser consciente de la política de calidad y su contribución',
    chapter: 7,
    category: 'Apoyo',
  },
  {
    id: 'np-7.4',
    code: '7.4',
    title: 'Comunicación',
    requirement:
      'La organización debe determinar las comunicaciones internas y externas',
    chapter: 7,
    category: 'Apoyo',
  },
  {
    id: 'np-7.5',
    code: '7.5',
    title: 'Información documentada',
    requirement:
      'El SGC debe incluir la información documentada requerida por la norma',
    chapter: 7,
    category: 'Apoyo',
  },

  // Capítulo 8: Operación
  {
    id: 'np-8.1',
    code: '8.1',
    title: 'Planificación y control operacional',
    requirement:
      'La organización debe planificar, implementar y controlar los procesos',
    chapter: 8,
    category: 'Operación',
  },
  {
    id: 'np-8.2',
    code: '8.2',
    title: 'Requisitos para productos y servicios',
    requirement:
      'La organización debe determinar los requisitos de productos y servicios',
    chapter: 8,
    category: 'Operación',
  },
  {
    id: 'np-8.3',
    code: '8.3',
    title: 'Diseño y desarrollo',
    requirement:
      'La organización debe establecer un proceso de diseño y desarrollo',
    chapter: 8,
    category: 'Operación',
  },
  {
    id: 'np-8.4',
    code: '8.4',
    title: 'Control de procesos externos',
    requirement:
      'La organización debe asegurar que los procesos externos estén controlados',
    chapter: 8,
    category: 'Operación',
  },
  {
    id: 'np-8.5',
    code: '8.5',
    title: 'Producción y provisión del servicio',
    requirement:
      'La organización debe implementar la producción bajo condiciones controladas',
    chapter: 8,
    category: 'Operación',
  },
  {
    id: 'np-8.6',
    code: '8.6',
    title: 'Liberación de productos y servicios',
    requirement:
      'La organización debe implementar disposiciones planificadas para verificar',
    chapter: 8,
    category: 'Operación',
  },
  {
    id: 'np-8.7',
    code: '8.7',
    title: 'Control de salidas no conformes',
    requirement:
      'La organización debe asegurar que las salidas no conformes se identifiquen y controlen',
    chapter: 8,
    category: 'Operación',
  },

  // Capítulo 9: Evaluación del desempeño
  {
    id: 'np-9.1',
    code: '9.1',
    title: 'Seguimiento, medición, análisis y evaluación',
    requirement:
      'La organización debe determinar qué necesita seguimiento y medición',
    chapter: 9,
    category: 'Evaluación',
  },
  {
    id: 'np-9.2',
    code: '9.2',
    title: 'Auditoría interna',
    requirement:
      'La organización debe llevar a cabo auditorías internas a intervalos planificados',
    chapter: 9,
    category: 'Evaluación',
  },
  {
    id: 'np-9.3',
    code: '9.3',
    title: 'Revisión por la dirección',
    requirement:
      'La alta dirección debe revisar el SGC a intervalos planificados',
    chapter: 9,
    category: 'Evaluación',
  },

  // Capítulo 10: Mejora
  {
    id: 'np-10.1',
    code: '10.1',
    title: 'Generalidades - Mejora',
    requirement:
      'La organización debe determinar y seleccionar oportunidades de mejora',
    chapter: 10,
    category: 'Mejora',
  },
  {
    id: 'np-10.2',
    code: '10.2',
    title: 'No conformidad y acción correctiva',
    requirement:
      'Cuando ocurra una no conformidad, la organización debe reaccionar y tomar acciones',
    chapter: 10,
    category: 'Mejora',
  },
  {
    id: 'np-10.3',
    code: '10.3',
    title: 'Mejora continua',
    requirement:
      'La organización debe mejorar continuamente la conveniencia, adecuación y eficacia del SGC',
    chapter: 10,
    category: 'Mejora',
  },
];

// Función helper para obtener puntos por capítulo
export function getNormPointsByChapter(chapter: number): NormPointSimple[] {
  return ISO9001_NORM_POINTS.filter(np => np.chapter === chapter);
}

// Función helper para obtener puntos por categoría
export function getNormPointsByCategory(category: string): NormPointSimple[] {
  return ISO9001_NORM_POINTS.filter(np => np.category === category);
}

// Función helper para buscar puntos
export function searchNormPoints(query: string): NormPointSimple[] {
  const lowerQuery = query.toLowerCase();
  return ISO9001_NORM_POINTS.filter(
    np =>
      np.code.toLowerCase().includes(lowerQuery) ||
      np.title.toLowerCase().includes(lowerQuery) ||
      np.requirement.toLowerCase().includes(lowerQuery)
  );
}

// Obtener todas las categorías únicas
export function getCategories(): string[] {
  return Array.from(new Set(ISO9001_NORM_POINTS.map(np => np.category)));
}

// Obtener todos los capítulos únicos
export function getChapters(): number[] {
  return Array.from(new Set(ISO9001_NORM_POINTS.map(np => np.chapter))).sort();
}
