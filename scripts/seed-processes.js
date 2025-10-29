const admin = require('firebase-admin');
const path = require('path');

// Configurar Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://app-4b05c-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

async function clearCollections() {
  console.log('🧹 Limpiando colecciones existentes...');
  
  try {
    // Limpiar definiciones de procesos
    const definitionsSnapshot = await db.collection('processDefinitions').get();
    const definitionsBatch = db.batch();
    definitionsSnapshot.docs.forEach(doc => {
      definitionsBatch.delete(doc.ref);
    });
    await definitionsBatch.commit();
    console.log(`✅ Eliminadas ${definitionsSnapshot.size} definiciones de procesos`);

    // Limpiar registros de procesos
    const recordsSnapshot = await db.collection('processRecords').get();
    const recordsBatch = db.batch();
    recordsSnapshot.docs.forEach(doc => {
      recordsBatch.delete(doc.ref);
    });
    await recordsBatch.commit();
    console.log(`✅ Eliminados ${recordsSnapshot.size} registros de procesos`);

  } catch (error) {
    console.error('❌ Error limpiando colecciones:', error);
    throw error;
  }
}

async function seedProcessDefinitions() {
  console.log('📋 Creando definiciones de procesos...');
  
  const definitionsData = [
    {
      name: 'Gestión de Calidad',
      description: 'Proceso para gestionar la calidad del sistema ISO 9001',
      category: 'calidad',
      responsible: 'admin@empresa.com',
      department: 'Calidad',
      version: '1.0',
      status: 'activo',
      createdBy: 'admin@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      name: 'Auditorías Internas',
      description: 'Proceso para realizar auditorías internas del sistema',
      category: 'auditoria',
      responsible: 'auditor@empresa.com',
      department: 'Auditoría',
      version: '1.0',
      status: 'activo',
      createdBy: 'admin@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      name: 'Mejora Continua',
      description: 'Proceso para implementar mejoras continuas',
      category: 'mejora',
      responsible: 'mejora@empresa.com',
      department: 'Mejora',
      version: '1.0',
      status: 'activo',
      createdBy: 'admin@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      name: 'Gestión de Documentos',
      description: 'Proceso para gestionar la documentación del sistema',
      category: 'documentos',
      responsible: 'documentos@empresa.com',
      department: 'Documentación',
      version: '1.0',
      status: 'activo',
      createdBy: 'admin@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      name: 'Control de No Conformidades',
      description: 'Proceso para gestionar no conformidades y acciones correctivas',
      category: 'no-conformidades',
      responsible: 'calidad@empresa.com',
      department: 'Calidad',
      version: '1.0',
      status: 'activo',
      createdBy: 'admin@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      name: 'Gestión de Riesgos',
      description: 'Proceso para identificar, evaluar y gestionar riesgos',
      category: 'riesgos',
      responsible: 'riesgos@empresa.com',
      department: 'Gestión de Riesgos',
      version: '1.0',
      status: 'activo',
      createdBy: 'admin@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      name: 'Capacitación y Competencias',
      description: 'Proceso para gestionar capacitaciones y competencias del personal',
      category: 'rrhh',
      responsible: 'rrhh@empresa.com',
      department: 'Recursos Humanos',
      version: '1.0',
      status: 'activo',
      createdBy: 'admin@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    },
    {
      name: 'Gestión de Proveedores',
      description: 'Proceso para evaluar y gestionar proveedores',
      category: 'compras',
      responsible: 'compras@empresa.com',
      department: 'Compras',
      version: '1.0',
      status: 'activo',
      createdBy: 'admin@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    }
  ];

  const definitionsRefs = [];
  for (const definition of definitionsData) {
    const docRef = await db.collection('processDefinitions').add(definition);
    definitionsRefs.push({ id: docRef.id, ...definition });
    console.log(`✅ Definición creada: ${definition.name}`);
  }

  console.log(`📋 Total definiciones creadas: ${definitionsRefs.length}`);
  return definitionsRefs;
}

async function seedProcessRecords(definitionsRefs) {
  console.log('📊 Creando registros de procesos...');
  
  const recordsData = [
    {
      name: 'Implementación ISO 9001 Q3',
      description: 'Registro de proceso para implementación de ISO 9001 en el tercer trimestre',
      processDefinitionId: definitionsRefs[0].id,
      processDefinitionName: 'Gestión de Calidad',
      status: 'activo',
      createdBy: 'admin@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kanbanStats: {
        totalCards: 12,
        pendingCards: 3,
        inProgressCards: 5,
        completedCards: 4
      },
      isActive: true
    },
    {
      name: 'Auditoría Interna 2024',
      description: 'Proceso de auditoría interna del sistema de gestión',
      processDefinitionId: definitionsRefs[1].id,
      processDefinitionName: 'Auditorías Internas',
      status: 'pausado',
      createdBy: 'auditor@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kanbanStats: {
        totalCards: 8,
        pendingCards: 2,
        inProgressCards: 3,
        completedCards: 3
      },
      isActive: true
    },
    {
      name: 'Mejora Continua Sistema',
      description: 'Proceso de mejora continua del sistema',
      processDefinitionId: definitionsRefs[2].id,
      processDefinitionName: 'Mejora Continua',
      status: 'completado',
      createdBy: 'mejora@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kanbanStats: {
        totalCards: 15,
        pendingCards: 0,
        inProgressCards: 0,
        completedCards: 15
      },
      isActive: true
    },
    {
      name: 'Actualización Documental 2024',
      description: 'Proceso de actualización de documentación del sistema',
      processDefinitionId: definitionsRefs[3].id,
      processDefinitionName: 'Gestión de Documentos',
      status: 'activo',
      createdBy: 'documentos@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kanbanStats: {
        totalCards: 6,
        pendingCards: 2,
        inProgressCards: 2,
        completedCards: 2
      },
      isActive: true
    },
    {
      name: 'Control No Conformidades Q4',
      description: 'Proceso de control de no conformidades del cuarto trimestre',
      processDefinitionId: definitionsRefs[4].id,
      processDefinitionName: 'Control de No Conformidades',
      status: 'activo',
      createdBy: 'calidad@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kanbanStats: {
        totalCards: 9,
        pendingCards: 4,
        inProgressCards: 3,
        completedCards: 2
      },
      isActive: true
    },
    {
      name: 'Evaluación de Riesgos 2024',
      description: 'Proceso de evaluación de riesgos anual',
      processDefinitionId: definitionsRefs[5].id,
      processDefinitionName: 'Gestión de Riesgos',
      status: 'activo',
      createdBy: 'riesgos@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kanbanStats: {
        totalCards: 7,
        pendingCards: 1,
        inProgressCards: 4,
        completedCards: 2
      },
      isActive: true
    },
    {
      name: 'Capacitación Personal Q3',
      description: 'Proceso de capacitación del personal tercer trimestre',
      processDefinitionId: definitionsRefs[6].id,
      processDefinitionName: 'Capacitación y Competencias',
      status: 'pausado',
      createdBy: 'rrhh@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kanbanStats: {
        totalCards: 11,
        pendingCards: 5,
        inProgressCards: 4,
        completedCards: 2
      },
      isActive: true
    },
    {
      name: 'Evaluación Proveedores 2024',
      description: 'Proceso de evaluación de proveedores anual',
      processDefinitionId: definitionsRefs[7].id,
      processDefinitionName: 'Gestión de Proveedores',
      status: 'activo',
      createdBy: 'compras@empresa.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kanbanStats: {
        totalCards: 5,
        pendingCards: 1,
        inProgressCards: 2,
        completedCards: 2
      },
      isActive: true
    }
  ];

  const recordsRefs = [];
  for (const record of recordsData) {
    const docRef = await db.collection('processRecords').add(record);
    recordsRefs.push({ id: docRef.id, ...record });
    console.log(`✅ Registro creado: ${record.name}`);
  }

  console.log(`📊 Total registros creados: ${recordsRefs.length}`);
  return recordsRefs;
}

async function seedKanbanBoards(recordsRefs) {
  console.log('🎯 Creando tableros Kanban...');
  
  for (let i = 0; i < recordsRefs.length; i++) {
    const record = recordsRefs[i];
    console.log(`🎯 Creando tablero para: ${record.name}`);
    
    // Crear listas Kanban
    const listsData = [
      {
        title: 'Pendiente',
        description: 'Tareas pendientes de realizar',
        color: 'bg-gray-100',
        position: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'En Progreso',
        description: 'Tareas en proceso de ejecución',
        color: 'bg-blue-100',
        position: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Completado',
        description: 'Tareas completadas',
        color: 'bg-green-100',
        position: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const listRefs = [];
    for (const list of listsData) {
      const listRef = await db.collection('processRecords').doc(record.id)
        .collection('kanbanLists').add(list);
      listRefs.push({ id: listRef.id, ...list });
    }

    // Crear tarjetas de ejemplo para cada lista
    const cardsData = [
      // Tarjetas para "Pendiente"
      {
        title: 'Revisar documentación',
        description: 'Revisar toda la documentación existente',
        listId: listRefs[0].id,
        assignedTo: 'Juan Pérez',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        tags: ['documentación', 'revisión'],
        status: 'pending',
        createdBy: 'admin@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Capacitación del equipo',
        description: 'Organizar capacitación sobre nuevos procedimientos',
        listId: listRefs[0].id,
        assignedTo: 'María García',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        tags: ['capacitación', 'equipo'],
        status: 'pending',
        createdBy: 'admin@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      
      // Tarjetas para "En Progreso"
      {
        title: 'Implementar procedimientos',
        description: 'Implementar nuevos procedimientos',
        listId: listRefs[1].id,
        assignedTo: 'Carlos López',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        tags: ['implementación', 'procedimientos'],
        status: 'in-progress',
        createdBy: 'admin@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Auditoría interna',
        description: 'Realizar auditoría interna del sistema',
        listId: listRefs[1].id,
        assignedTo: 'Ana Martínez',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        tags: ['auditoría', 'interna'],
        status: 'in-progress',
        createdBy: 'admin@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      
      // Tarjetas para "Completado"
      {
        title: 'Análisis de riesgos',
        description: 'Completar análisis de riesgos del proceso',
        listId: listRefs[2].id,
        assignedTo: 'Laura Sánchez',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        tags: ['análisis', 'riesgos'],
        status: 'completed',
        createdBy: 'admin@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Reunión de kick-off',
        description: 'Realizar reunión de inicio del proyecto',
        listId: listRefs[2].id,
        assignedTo: 'Roberto Díaz',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        tags: ['reunión', 'kick-off'],
        status: 'completed',
        createdBy: 'admin@empresa.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const card of cardsData) {
      await db.collection('processRecords').doc(record.id)
        .collection('kanbanLists').doc(card.listId)
        .collection('cards').add(card);
    }

    console.log(`✅ Tablero Kanban creado para: ${record.name}`);
  }

  console.log(`🎯 Total tableros Kanban creados: ${recordsRefs.length}`);
}

async function main() {
  try {
    console.log('🚀 Iniciando seeding de colecciones de Procesos...\n');
    
    // Limpiar colecciones existentes
    await clearCollections();
    
    // Crear definiciones de procesos
    const definitionsRefs = await seedProcessDefinitions();
    
    // Crear registros de procesos
    const recordsRefs = await seedProcessRecords(definitionsRefs);
    
    // Crear tableros Kanban
    await seedKanbanBoards(recordsRefs);
    
    console.log('\n🎉 ¡Seeding completado exitosamente!');
    console.log(`📋 Definiciones de procesos: ${definitionsRefs.length}`);
    console.log(`📊 Registros de procesos: ${recordsRefs.length}`);
    console.log(`🎯 Tableros Kanban: ${recordsRefs.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    process.exit(1);
  }
}

main();











