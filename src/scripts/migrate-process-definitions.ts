/**
 * Script de migración para agregar campo 'responsable' a definiciones de procesos existentes
 */

import { db } from '@/firebase/config';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';

async function migrateProcessDefinitions() {
  console.log('🔄 Iniciando migración de definiciones de procesos...\n');

  try {
    const definitionsRef = collection(db, 'processDefinitions');
    const snapshot = await getDocs(definitionsRef);

    console.log(`📊 Encontradas ${snapshot.size} definiciones\n`);

    let updated = 0;
    let skipped = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const id = docSnap.id;

      // Verificar si ya tiene el campo responsable
      if (data.responsable) {
        console.log(`⏭️  Saltando ${data.nombre || id} - ya tiene responsable`);
        skipped++;
        continue;
      }

      // Agregar campo responsable con valor por defecto basado en categoría
      const responsablePorDefecto = getResponsablePorCategoria(data.categoria);

      await updateDoc(doc(db, 'processDefinitions', id), {
        responsable: responsablePorDefecto,
      });

      console.log(
        `✅ Actualizado: ${data.nombre || id} -> Responsable: ${responsablePorDefecto}`
      );
      updated++;
    }

    console.log('\n📈 Resumen de migración:');
    console.log(`   ✅ Actualizadas: ${updated}`);
    console.log(`   ⏭️  Saltadas: ${skipped}`);
    console.log(`   📊 Total: ${snapshot.size}`);
    console.log('\n✨ Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

function getResponsablePorCategoria(categoria: string): string {
  const responsables: Record<string, string> = {
    calidad: 'Jefe de Calidad',
    auditoria: 'Auditor Líder',
    mejora: 'Coordinador de Mejora Continua',
    rrhh: 'Jefe de Recursos Humanos',
    produccion: 'Jefe de Producción',
    ventas: 'Jefe de Ventas',
    logistica: 'Jefe de Logística',
    compras: 'Jefe de Compras',
  };

  return responsables[categoria] || 'Responsable del Proceso';
}

// Ejecutar migración
migrateProcessDefinitions()
  .then(() => {
    console.log('\n🎉 Script finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
