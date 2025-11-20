#!/usr/bin/env node

/**
 * Script de prueba simple para Firebase Storage
 * Usa el servidor Next.js en desarrollo
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

console.log('\n');
console.log('═══════════════════════════════════════════════════');
console.log('  PRUEBA DE FIREBASE STORAGE VIA API');
console.log('═══════════════════════════════════════════════════');
console.log('\n');

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testStorage() {
  try {
    console.log('🧪 Iniciando prueba de Firebase Storage...\n');

    // 1. Verificar que el servidor esté corriendo
    console.log('1️⃣ Verificando servidor Next.js...');
    try {
      const { status } = await makeRequest('GET', '/api/sdk/documents');
      if (status === 200) {
        console.log('   ✅ Servidor Next.js está corriendo\n');
      } else {
        throw new Error(`Servidor respondió con status ${status}`);
      }
    } catch (error) {
      console.error('   ❌ Error: Servidor no está corriendo');
      console.error('   💡 Ejecuta: npm run dev\n');
      process.exit(1);
    }

    // 2. Crear un documento de prueba
    console.log('2️⃣ Creando documento de prueba...');
    const createResponse = await makeRequest('POST', '/api/documents', {
      title: 'Documento de Prueba Storage',
      description: 'Prueba automática de subida de archivos',
      type: 'manual',
      status: 'borrador',
      version: '1.0',
      responsible_user_id: 'test-user',
      created_by: 'test-script',
      updated_by: 'test-script',
    });

    if (createResponse.status !== 201) {
      console.error('   ❌ Error al crear documento:', createResponse.data);
      process.exit(1);
    }

    const documentId = createResponse.data.id;
    console.log(`   ✅ Documento creado: ${documentId}\n`);

    // 3. Simular subida de archivo
    console.log('3️⃣ Probando subida de archivo...');
    console.log('   ℹ️  Para probar la subida completa:');
    console.log('   1. Ir a http://localhost:3000/documentos');
    console.log('   2. Editar el documento de prueba');
    console.log(`   3. ID del documento: ${documentId}`);
    console.log('   4. Subir un archivo PDF pequeño');
    console.log('   5. Verificar que se suba correctamente\n');

    // 4. Limpiar - Eliminar documento de prueba
    console.log('4️⃣ Limpiando: Eliminando documento de prueba...');
    const deleteResponse = await makeRequest(
      'DELETE',
      `/api/documents/${documentId}`
    );

    if (deleteResponse.status === 200) {
      console.log('   ✅ Documento eliminado\n');
    } else {
      console.log('   ⚠️  No se pudo eliminar el documento automáticamente');
      console.log(`   💡 Elimínalo manualmente: ID ${documentId}\n`);
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ PRUEBA BÁSICA COMPLETADA');
    console.log('═══════════════════════════════════════════════════\n');
    console.log('📋 Resumen:');
    console.log('   • Servidor Next.js: ✅');
    console.log('   • API de documentos: ✅');
    console.log('   • Creación de documentos: ✅');
    console.log('\n💡 Para probar Storage completamente:');
    console.log('   1. Ir a http://localhost:3000/documentos');
    console.log('   2. Crear un nuevo documento');
    console.log('   3. Subir un archivo PDF');
    console.log('   4. Verificar que se descargue correctamente\n');
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error('═══════════════════════════════════════════════════');
    console.error(error);
    console.error('═══════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

testStorage()
  .then(() => {
    console.log('✅ Script completado\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
