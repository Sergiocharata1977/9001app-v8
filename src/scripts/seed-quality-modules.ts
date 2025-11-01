import { db } from '@/firebase/config';
import { addDoc, collection } from 'firebase/firestore';

async function seedQualityModules() {
  try {
    console.log('🌱 Iniciando seed de módulos de calidad...\n');

    const now = new Date().toISOString();
    const organizationId = 'default-org';

    // 1. Crear Política de ejemplo
    console.log('📄 Creando política de ejemplo...');
    const politicaRef = collection(db, 'politicas');
    const politicaDoc = await addDoc(politicaRef, {
      organization_id: organizationId,
      codigo: 'POL-QMS-001',
      titulo: 'Política de Calidad',
      descripcion: 'Política general del sistema de gestión de calidad',
      proposito: 'Establecer el compromiso de la organización con la calidad',
      alcance: 'Aplica a todos los procesos de la organización',
      version: 1,
      estado: 'vigente',
      procesos_relacionados: [],
      departamentos_aplicables: [],
      puntos_norma: ['4.1', '5.2'],
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });
    console.log(`✅ Política creada: ${politicaDoc.id}\n`);

    // 2. Crear Reunión de Trabajo de ejemplo
    console.log('👥 Creando reunión de trabajo de ejemplo...');
    const reunionRef = collection(db, 'reuniones_trabajo');
    const reunionDoc = await addDoc(reunionRef, {
      organization_id: organizationId,
      tipo: 'management_review',
      titulo: 'Revisión por la Dirección Q1 2025',
      fecha: new Date().toISOString(),
      duracion_minutos: 120,
      modalidad: 'presencial',
      organizador_id: 'system',
      participantes: [],
      agenda: [
        {
          orden: 1,
          tema: 'Revisión de objetivos de calidad',
          estado: 'planificado',
        },
        {
          orden: 2,
          tema: 'Análisis de indicadores',
          estado: 'planificado',
        },
      ],
      puntos_tratados: [],
      acuerdos: [],
      estado: 'planificada',
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });
    console.log(`✅ Reunión creada: ${reunionDoc.id}\n`);

    // 3. Crear Análisis FODA de ejemplo
    console.log('🎯 Creando análisis FODA de ejemplo...');
    const fodaRef = collection(db, 'analisis_foda');
    const fodaDoc = await addDoc(fodaRef, {
      organization_id: organizationId,
      codigo: 'FODA-2025-Q1',
      titulo: 'Análisis FODA Organizacional 2025',
      descripcion: 'Análisis estratégico de la organización',
      tipo_analisis: 'organizacional',
      fecha_analisis: new Date().toISOString(),
      responsable_id: 'system',
      participantes: [],
      fortalezas: [
        {
          descripcion: 'Equipo comprometido con la calidad',
          impacto: 'alto',
        },
        {
          descripcion: 'Procesos bien documentados',
          impacto: 'alto',
        },
      ],
      oportunidades: [
        {
          descripcion: 'Expansión a nuevos mercados',
          impacto: 'alto',
          probabilidad: 'media',
        },
        {
          descripcion: 'Certificación ISO 9001',
          impacto: 'alto',
          probabilidad: 'alta',
        },
      ],
      debilidades: [
        {
          descripcion: 'Falta de capacitación continua',
          impacto: 'medio',
        },
      ],
      amenazas: [
        {
          descripcion: 'Competencia creciente',
          impacto: 'medio',
          probabilidad: 'alta',
        },
      ],
      estado: 'completado',
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });
    console.log(`✅ Análisis FODA creado: ${fodaDoc.id}\n`);

    console.log('🎉 ¡Seed completado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Política: ${politicaDoc.id}`);
    console.log(`   - Reunión: ${reunionDoc.id}`);
    console.log(`   - FODA: ${fodaDoc.id}`);
    console.log('\n✅ Las colecciones han sido creadas en Firestore.');
    console.log('\n🔗 Puedes ver los registros en:');
    console.log('   - http://localhost:3000/politicas');
    console.log('   - http://localhost:3000/reuniones-trabajo');
    console.log('   - http://localhost:3000/analisis-foda');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear registros:', error);
    process.exit(1);
  }
}

// Ejecutar el seed
seedQualityModules();
