/**
 * Script de prueba para Firebase Storage
 * Verifica que el acceso a Storage funcione correctamente
 */

const { getAdminStorage } = require('./src/lib/firebase/admin');
const { randomUUID } = require('crypto');

async function testStorageAccess() {
  console.log('🧪 Iniciando prueba de Firebase Storage...\n');

  try {
    // 1. Obtener referencia al bucket
    console.log('1️⃣ Obteniendo referencia al bucket...');
    const bucket = getAdminStorage().bucket();
    console.log(`   ✅ Bucket: ${bucket.name}\n`);

    // 2. Crear un archivo de prueba
    console.log('2️⃣ Creando archivo de prueba...');
    const testContent = `Prueba de Storage - ${new Date().toISOString()}`;
    const testFileName = `test-storage-${Date.now()}.txt`;
    const testPath = `documents/test/${testFileName}`;

    // 3. Subir archivo
    console.log('3️⃣ Subiendo archivo de prueba...');
    const fileRef = bucket.file(testPath);
    const downloadToken = randomUUID();

    await fileRef.save(Buffer.from(testContent), {
      resumable: false,
      metadata: {
        contentType: 'text/plain',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
          uploadedBy: 'test-script',
        },
      },
    });
    console.log(`   ✅ Archivo subido: ${testPath}\n`);

    // 4. Generar URL de descarga
    console.log('4️⃣ Generando URL de descarga...');
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      testPath
    )}?alt=media&token=${downloadToken}`;
    console.log(`   ✅ URL generada:\n   ${downloadURL}\n`);

    // 5. Verificar que el archivo existe
    console.log('5️⃣ Verificando existencia del archivo...');
    const [exists] = await fileRef.exists();
    if (exists) {
      console.log('   ✅ Archivo existe en Storage\n');
    } else {
      console.log('   ❌ Archivo NO existe en Storage\n');
      throw new Error('El archivo no se encontró después de subirlo');
    }

    // 6. Obtener metadata
    console.log('6️⃣ Obteniendo metadata del archivo...');
    const [metadata] = await fileRef.getMetadata();
    console.log('   ✅ Metadata:');
    console.log(`      - Tamaño: ${metadata.size} bytes`);
    console.log(`      - Tipo: ${metadata.contentType}`);
    console.log(
      `      - Token: ${metadata.metadata?.firebaseStorageDownloadTokens}`
    );
    console.log('');

    // 7. Descargar archivo
    console.log('7️⃣ Descargando archivo...');
    const [downloadedContent] = await fileRef.download();
    const contentString = downloadedContent.toString();
    if (contentString === testContent) {
      console.log('   ✅ Contenido descargado correctamente\n');
    } else {
      console.log('   ❌ El contenido descargado no coincide\n');
      throw new Error('Contenido no coincide');
    }

    // 8. Listar archivos en la carpeta de prueba
    console.log('8️⃣ Listando archivos en documents/test/...');
    const [files] = await bucket.getFiles({ prefix: 'documents/test/' });
    console.log(`   ✅ Encontrados ${files.length} archivo(s):`);
    files.forEach((file, index) => {
      console.log(`      ${index + 1}. ${file.name}`);
    });
    console.log('');

    // 9. Eliminar archivo de prueba
    console.log('9️⃣ Limpiando: Eliminando archivo de prueba...');
    await fileRef.delete({ ignoreNotFound: true });
    console.log('   ✅ Archivo eliminado\n');

    // 10. Verificar eliminación
    console.log('🔟 Verificando eliminación...');
    const [stillExists] = await fileRef.exists();
    if (!stillExists) {
      console.log('   ✅ Archivo eliminado correctamente\n');
    } else {
      console.log('   ⚠️  Archivo aún existe\n');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📋 Resumen:');
    console.log('   • Bucket accesible: ✅');
    console.log('   • Subida de archivos: ✅');
    console.log('   • Generación de URLs: ✅');
    console.log('   • Descarga de archivos: ✅');
    console.log('   • Eliminación de archivos: ✅');
    console.log('\n🎉 Firebase Storage está funcionando correctamente!\n');
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error('═══════════════════════════════════════════════════');
    if (error instanceof Error) {
      console.error(`Mensaje: ${error.message}`);
      console.error(`Stack: ${error.stack}`);
    } else {
      console.error(error);
    }
    console.error('═══════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

// Ejecutar prueba
console.log('\n');
console.log('═══════════════════════════════════════════════════');
console.log('  PRUEBA DE FIREBASE STORAGE - ADMIN SDK');
console.log('═══════════════════════════════════════════════════');
console.log('\n');

testStorageAccess()
  .then(() => {
    console.log('✅ Script completado exitosamente\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
