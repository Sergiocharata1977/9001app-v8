// Script para insertar datos de contexto para empresa de insumos agrícolas
// Empresa: AgroSemillas S.A. - Venta de semillas e insumos + Tratamiento de semillas

import { db } from '@/firebase/config';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

interface SeedResult {
  success: boolean;
  message: string;
  ids?: {
    departmentId?: string;
    positionId?: string;
    personnelId?: string;
    processIds?: string[];
    objectiveIds?: string[];
    indicatorIds?: string[];
  };
}

export async function seedAgroContext(userId: string): Promise<SeedResult> {
  try {
    console.log('🌱 Iniciando seed de datos agrícolas...');

    // 1. CREAR DEPARTAMENTO
    console.log('📁 Creando departamento Calidad...');
    const deptRef = await addDoc(collection(db, 'departments'), {
      name: 'Calidad y Aseguramiento',
      description:
        'Departamento responsable del SGC ISO 9001, control de calidad de productos y tratamiento de semillas',
      responsible_user_id: userId,
      is_active: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    const departmentId = deptRef.id;
    console.log('✅ Departamento creado:', departmentId);

    // 2. CREAR PUESTO
    console.log('👔 Creando puesto Asistente de Calidad...');
    const positionRef = await addDoc(collection(db, 'positions'), {
      nombre: 'Asistente de Calidad',
      descripcion_responsabilidades: `
- Asistir en la implementación y mantenimiento del SGC ISO 9001
- Controlar calidad de semillas y productos agrícolas
- Gestionar documentación del sistema de calidad
- Realizar inspecciones de tratamiento de semillas
- Registrar no conformidades y acciones correctivas
- Apoyar en auditorías internas
- Mantener registros de trazabilidad de productos
      `.trim(),
      requisitos_experiencia:
        '1-2 años en sistemas de calidad o sector agrícola',
      requisitos_formacion:
        'Técnico o estudiante de Ingeniería Agronómica, Química o Industrial',
      departamento_id: departmentId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    const positionId = positionRef.id;
    console.log('✅ Puesto creado:', positionId);

    // 3. CREAR PROCESOS
    console.log('⚙️ Creando procesos...');
    const processIds: string[] = [];

    const processes = [
      {
        codigo: 'CAL-001',
        nombre: 'Control de Calidad de Semillas',
        objetivo:
          'Asegurar que las semillas cumplan con estándares de germinación, pureza y sanidad',
        alcance: 'Aplica a todas las semillas recibidas y tratadas en planta',
        tipo: 'operativo',
        responsable: 'Asistente de Calidad',
        descripcion:
          'Proceso de inspección y análisis de calidad de semillas antes y después del tratamiento',
        entradas: [
          'Semillas sin tratar',
          'Especificaciones técnicas',
          'Normas ISTA',
        ],
        salidas: [
          'Certificados de calidad',
          'Registros de análisis',
          'Semillas aprobadas',
        ],
        recursos: [
          'Laboratorio de análisis',
          'Equipos de germinación',
          'Personal capacitado',
        ],
        indicadores: ['% Germinación', '% Pureza', 'Lotes rechazados'],
        documentos_relacionados: ['PO-CAL-001', 'IT-LAB-001', 'FOR-CAL-001'],
      },
      {
        codigo: 'TRA-001',
        nombre: 'Tratamiento de Semillas',
        objetivo:
          'Aplicar tratamientos fitosanitarios y bioestimulantes a semillas según especificaciones',
        alcance:
          'Todas las semillas que requieran tratamiento químico o biológico',
        tipo: 'operativo',
        responsable: 'Jefe de Producción',
        descripcion:
          'Proceso de aplicación controlada de productos para protección y mejora de semillas',
        entradas: [
          'Semillas aprobadas',
          'Productos fitosanitarios',
          'Fórmulas de tratamiento',
        ],
        salidas: [
          'Semillas tratadas',
          'Registros de trazabilidad',
          'Certificados de tratamiento',
        ],
        recursos: [
          'Máquina tratadora',
          'Productos químicos',
          'EPP',
          'Balanzas de precisión',
        ],
        indicadores: [
          'Uniformidad de cobertura',
          'Dosis aplicada',
          'Eficiencia del proceso',
        ],
        documentos_relacionados: ['PO-TRA-001', 'IT-TRA-002', 'FOR-TRA-001'],
      },
      {
        codigo: 'AUD-001',
        nombre: 'Auditorías Internas ISO 9001',
        objetivo:
          'Verificar el cumplimiento del SGC con requisitos ISO 9001 y detectar oportunidades de mejora',
        alcance: 'Todos los procesos del SGC',
        tipo: 'gestion',
        responsable: 'Responsable de Calidad',
        descripcion:
          'Programa anual de auditorías internas para evaluar eficacia del SGC',
        entradas: [
          'Programa de auditorías',
          'Checklist ISO 9001',
          'Registros previos',
        ],
        salidas: ['Informes de auditoría', 'Hallazgos', 'Acciones correctivas'],
        recursos: [
          'Auditores internos',
          'Norma ISO 9001',
          'Formatos de auditoría',
        ],
        indicadores: [
          'Auditorías completadas',
          'Hallazgos detectados',
          'Tiempo de cierre',
        ],
        documentos_relacionados: ['PO-AUD-001', 'FOR-AUD-001', 'FOR-AUD-002'],
      },
      {
        codigo: 'DOC-001',
        nombre: 'Control de Documentos y Registros',
        objetivo:
          'Asegurar que la documentación del SGC esté actualizada, controlada y disponible',
        alcance: 'Todos los documentos y registros del SGC',
        tipo: 'gestion',
        responsable: 'Asistente de Calidad',
        descripcion:
          'Gestión del ciclo de vida de documentos: creación, revisión, aprobación, distribución y archivo',
        entradas: [
          'Solicitudes de documentos',
          'Cambios normativos',
          'Mejoras identificadas',
        ],
        salidas: [
          'Documentos controlados',
          'Lista maestra',
          'Registros archivados',
        ],
        recursos: ['Sistema documental', 'Servidor', 'Formatos estandarizados'],
        indicadores: [
          'Documentos actualizados',
          'Tiempo de aprobación',
          'Documentos obsoletos',
        ],
        documentos_relacionados: ['PO-DOC-001', 'FOR-DOC-001', 'LM-DOC-001'],
      },
      {
        codigo: 'NC-001',
        nombre: 'Gestión de No Conformidades',
        objetivo:
          'Identificar, registrar y resolver no conformidades para prevenir su recurrencia',
        alcance:
          'Todas las no conformidades detectadas en procesos, productos o servicios',
        tipo: 'gestion',
        responsable: 'Responsable de Calidad',
        descripcion:
          'Proceso sistemático para tratar no conformidades mediante análisis de causa raíz y acciones correctivas',
        entradas: [
          'Reportes de NC',
          'Quejas de clientes',
          'Hallazgos de auditoría',
        ],
        salidas: [
          'NC registradas',
          'Análisis de causa raíz',
          'Acciones correctivas',
          'Verificación de eficacia',
        ],
        recursos: [
          'Sistema de gestión',
          'Metodologías (5 Por qués, Ishikawa)',
          'Personal capacitado',
        ],
        indicadores: [
          'NC abiertas',
          'Tiempo de cierre',
          'Eficacia de acciones',
          'Reincidencia',
        ],
        documentos_relacionados: ['PO-NC-001', 'FOR-NC-001', 'FOR-AC-001'],
      },
      {
        codigo: 'TRZ-001',
        nombre: 'Trazabilidad de Productos',
        objetivo:
          'Mantener trazabilidad completa desde recepción de semillas hasta entrega al cliente',
        alcance: 'Todos los lotes de semillas e insumos comercializados',
        tipo: 'operativo',
        responsable: 'Asistente de Calidad',
        descripcion:
          'Sistema de identificación y seguimiento de lotes para garantizar trazabilidad hacia adelante y atrás',
        entradas: [
          'Lotes recibidos',
          'Registros de tratamiento',
          'Órdenes de venta',
        ],
        salidas: [
          'Códigos de trazabilidad',
          'Registros de movimientos',
          'Informes de trazabilidad',
        ],
        recursos: ['Sistema de códigos', 'Etiquetas', 'Base de datos'],
        indicadores: [
          'Lotes trazables',
          'Tiempo de rastreo',
          'Precisión de registros',
        ],
        documentos_relacionados: ['PO-TRZ-001', 'FOR-TRZ-001', 'IT-TRZ-001'],
      },
    ];

    for (const process of processes) {
      const processRef = await addDoc(collection(db, 'processDefinitions'), {
        ...process,
        estado: 'activo',
        version: '1.0',
        fecha_aprobacion: new Date('2024-01-15'),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      processIds.push(processRef.id);
      console.log(`✅ Proceso creado: ${process.codigo} - ${process.nombre}`);
    }

    // 4. CREAR OBJETIVOS DE CALIDAD
    console.log('🎯 Creando objetivos de calidad...');
    const objectiveIds: string[] = [];

    const objectives = [
      {
        title: 'Reducir No Conformidades en Tratamiento',
        description:
          'Disminuir el número de lotes con NC en proceso de tratamiento de semillas',
        target_value: 5,
        current_value: 12,
        unit: 'NC/mes',
        measurement_frequency: 'mensual',
        responsible: 'Jefe de Producción',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        status: 'en_progreso',
        progress_percentage: 35,
        category: 'calidad',
        related_process_ids: [processIds[1], processIds[4]], // Tratamiento y NC
      },
      {
        title: 'Mejorar Índice de Germinación Promedio',
        description:
          'Aumentar el porcentaje promedio de germinación de semillas tratadas',
        target_value: 95,
        current_value: 88,
        unit: '%',
        measurement_frequency: 'mensual',
        responsible: 'Responsable de Calidad',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        status: 'en_progreso',
        progress_percentage: 45,
        category: 'calidad',
        related_process_ids: [processIds[0], processIds[1]], // Control y Tratamiento
      },
      {
        title: 'Completar Auditorías Internas a Tiempo',
        description:
          'Ejecutar el 100% del programa anual de auditorías en las fechas planificadas',
        target_value: 100,
        current_value: 75,
        unit: '%',
        measurement_frequency: 'trimestral',
        responsible: 'Responsable de Calidad',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        status: 'en_progreso',
        progress_percentage: 75,
        category: 'gestion',
        related_process_ids: [processIds[2]], // Auditorías
      },
      {
        title: 'Mantener Trazabilidad al 100%',
        description:
          'Garantizar trazabilidad completa de todos los lotes comercializados',
        target_value: 100,
        current_value: 98,
        unit: '%',
        measurement_frequency: 'mensual',
        responsible: 'Asistente de Calidad',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-12-31'),
        status: 'en_progreso',
        progress_percentage: 98,
        category: 'operacional',
        related_process_ids: [processIds[5]], // Trazabilidad
      },
    ];

    for (const objective of objectives) {
      const objRef = await addDoc(collection(db, 'qualityObjectives'), {
        ...objective,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      objectiveIds.push(objRef.id);
      console.log(`✅ Objetivo creado: ${objective.title}`);
    }

    // 5. CREAR INDICADORES
    console.log('📊 Creando indicadores...');
    const indicatorIds: string[] = [];

    const indicators = [
      {
        name: '% de Lotes con NC en Tratamiento',
        description:
          'Porcentaje de lotes que presentan no conformidades durante el tratamiento',
        formula: '(Lotes con NC / Total lotes tratados) × 100',
        unit: '%',
        target_min: 0,
        target_max: 5,
        current_value: 8.5,
        measurement_frequency: 'mensual',
        data_source: 'Registros de producción y NC',
        responsible: 'Asistente de Calidad',
        category: 'calidad',
        related_process_id: processIds[1],
        related_objective_id: objectiveIds[0],
      },
      {
        name: 'Índice de Germinación Promedio',
        description:
          'Porcentaje promedio de germinación de semillas analizadas',
        formula: 'Promedio de % germinación de todos los lotes del mes',
        unit: '%',
        target_min: 90,
        target_max: 100,
        current_value: 88,
        measurement_frequency: 'mensual',
        data_source: 'Análisis de laboratorio',
        responsible: 'Asistente de Calidad',
        category: 'calidad',
        related_process_id: processIds[0],
        related_objective_id: objectiveIds[1],
      },
      {
        name: '% de Auditorías Completadas a Tiempo',
        description: 'Porcentaje de auditorías ejecutadas según cronograma',
        formula:
          '(Auditorías realizadas a tiempo / Auditorías programadas) × 100',
        unit: '%',
        target_min: 90,
        target_max: 100,
        current_value: 75,
        measurement_frequency: 'trimestral',
        data_source: 'Programa de auditorías',
        responsible: 'Responsable de Calidad',
        category: 'gestion',
        related_process_id: processIds[2],
        related_objective_id: objectiveIds[2],
      },
      {
        name: 'Tiempo Promedio de Cierre de NC',
        description:
          'Días promedio desde detección hasta cierre de no conformidades',
        formula: 'Promedio de días de cierre de NC del mes',
        unit: 'días',
        target_min: 0,
        target_max: 15,
        current_value: 22,
        measurement_frequency: 'mensual',
        data_source: 'Sistema de gestión de NC',
        responsible: 'Responsable de Calidad',
        category: 'gestion',
        related_process_id: processIds[4],
        related_objective_id: objectiveIds[0],
      },
      {
        name: '% de Trazabilidad Efectiva',
        description: 'Porcentaje de lotes con trazabilidad completa verificada',
        formula: '(Lotes con trazabilidad completa / Total lotes) × 100',
        unit: '%',
        target_min: 98,
        target_max: 100,
        current_value: 98,
        measurement_frequency: 'mensual',
        data_source: 'Auditorías de trazabilidad',
        responsible: 'Asistente de Calidad',
        category: 'operacional',
        related_process_id: processIds[5],
        related_objective_id: objectiveIds[3],
      },
      {
        name: 'Documentos Actualizados',
        description:
          'Porcentaje de documentos del SGC actualizados según cronograma',
        formula: '(Documentos actualizados / Total documentos) × 100',
        unit: '%',
        target_min: 95,
        target_max: 100,
        current_value: 92,
        measurement_frequency: 'trimestral',
        data_source: 'Lista maestra de documentos',
        responsible: 'Asistente de Calidad',
        category: 'gestion',
        related_process_id: processIds[3],
        related_objective_id: null,
      },
    ];

    for (const indicator of indicators) {
      const indRef = await addDoc(collection(db, 'qualityIndicators'), {
        ...indicator,
        status: 'activo',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      indicatorIds.push(indRef.id);
      console.log(`✅ Indicador creado: ${indicator.name}`);
    }

    // 6. ACTUALIZAR PERSONNEL CON ASIGNACIONES
    console.log('👤 Actualizando personnel con asignaciones...');

    // Buscar el personnel de María Elena
    // Asumimos que ya existe, solo actualizamos sus asignaciones
    const personnelRef = doc(db, 'personnel', 'PERSONNEL_ID_AQUI'); // Reemplazar con ID real

    await updateDoc(personnelRef, {
      puesto: positionId,
      departamento: departmentId,
      procesos_asignados: [
        processIds[0], // Control de Calidad
        processIds[3], // Control de Documentos
        processIds[4], // Gestión de NC
        processIds[5], // Trazabilidad
      ],
      objetivos_asignados: objectiveIds, // Todos los objetivos
      indicadores_asignados: indicatorIds, // Todos los indicadores
      updated_at: serverTimestamp(),
    });

    console.log('✅ Personnel actualizado con asignaciones');

    console.log('🎉 Seed completado exitosamente!');

    return {
      success: true,
      message: 'Datos de contexto agrícola creados exitosamente',
      ids: {
        departmentId,
        positionId,
        processIds,
        objectiveIds,
        indicatorIds,
      },
    };
  } catch (error) {
    console.error('❌ Error en seed:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
