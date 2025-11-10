// Script para limpiar hallazgos antiguos de Firestore
// Ejecutar con: node clean-findings.js

const admin = require('firebase-admin');

// Inicializar Firebase Admin (asegúrate de tener las credenciales)
// Este script debe ejecutarse solo si tienes hallazgos con estructura antigua

async function cleanFindings() {
  try {
    const db = admin.firestore();
    const findingsRef = db.collection('findings');

    // Obtener todos los hallazgos
    const snapshot = await findingsRef.get();

    console.log(`Encontrados ${snapshot.size} hallazgos`);

    // Eliminar todos los hallazgos antiguos
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('Hallazgos antiguos eliminados exitosamente');
  } catch (error) {
    console.error('Error limpiando hallazgos:', error);
  }
}

// Descomentar para ejecutar
// cleanFindings();

console.log('Script de limpieza de hallazgos');
console.log(
  'Para ejecutar, descomentar la última línea y ejecutar: node clean-findings.js'
);
