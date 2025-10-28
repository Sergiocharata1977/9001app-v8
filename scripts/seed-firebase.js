// Script para sembrar datos en Firebase
// Ejecutar con: node scripts/seed-firebase.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB80eKra_lUIjDGe-K0Hxbbq0Fabfdr03Y",
  authDomain: "app-4b05c.firebaseapp.com",
  databaseURL: "https://app-4b05c-default-rtdb.firebaseio.com",
  projectId: "app-4b05c",
  storageBucket: "app-4b05c.firebasestorage.app",
  messagingSenderId: "69562046511",
  appId: "1:69562046511:web:38b909326efd9b3fc60eda",
  measurementId: "G-Z1RKVMSQGJ"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Datos de departamentos
const departments = [
  {
    name: 'Operaciones',
    description: 'Departamento responsable de las operaciones diarias de la empresa',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Ventas',
    description: 'Departamento de ventas y comercialización de productos',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Recursos Humanos',
    description: 'Gestión del talento humano y administración de personal',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Tecnología',
    description: 'Departamento de sistemas y desarrollo tecnológico',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Finanzas',
    description: 'Gestión financiera y contabilidad de la empresa',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Marketing',
    description: 'Estrategias de marketing y comunicación',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Calidad',
    description: 'Control de calidad y procesos ISO 9001',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Logística',
    description: 'Gestión de inventarios y distribución',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Datos de personal
const personnel = [
  {
    nombres: 'Juan Carlos',
    apellidos: 'González Pérez',
    email: 'juan.gonzalez@empresa.com',
    telefono: '+5491123456789',
    documento_identidad: '12345678',
    fecha_nacimiento: new Date('1985-03-15'),
    nacionalidad: 'Argentina',
    direccion: 'Av. Corrientes 1234, Buenos Aires',
    telefono_emergencia: '+5491198765432',
    fecha_contratacion: new Date('2020-01-15'),
    numero_legajo: 'EMP001',
    estado: 'Activo',
    meta_mensual: 100000,
    comision_porcentaje: 5,
    tipo_personal: 'ventas',
    zona_venta: 'Centro',
    puesto: 'Ejecutivo de Ventas',
    departamento: 'Ventas',
    supervisor: 'Carlos Martínez',
    salario: '$450,000',
    certificaciones: ['Ventas Consultivas', 'CRM Avanzado'],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    nombres: 'María Elena',
    apellidos: 'Rodríguez Silva',
    email: 'maria.rodriguez@empresa.com',
    telefono: '+5491123456790',
    documento_identidad: '87654321',
    fecha_nacimiento: new Date('1990-07-22'),
    nacionalidad: 'Argentina',
    direccion: 'Calle Florida 567, Buenos Aires',
    telefono_emergencia: '+5491198765433',
    fecha_contratacion: new Date('2019-05-10'),
    numero_legajo: 'EMP002',
    estado: 'Activo',
    meta_mensual: 80000,
    comision_porcentaje: 3,
    tipo_personal: 'administrativo',
    puesto: 'Asistente Administrativo',
    departamento: 'Recursos Humanos',
    supervisor: 'Roberto Sánchez',
    salario: '$380,000',
    certificaciones: ['Gestión de Personal', 'ISO 9001'],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    nombres: 'Carlos Alberto',
    apellidos: 'Martínez López',
    email: 'carlos.martinez@empresa.com',
    telefono: '+5491123456791',
    documento_identidad: '11223344',
    fecha_nacimiento: new Date('1982-11-08'),
    nacionalidad: 'Argentina',
    direccion: 'Av. 9 de Julio 890, Buenos Aires',
    telefono_emergencia: '+5491198765434',
    fecha_contratacion: new Date('2018-03-20'),
    numero_legajo: 'EMP003',
    estado: 'Activo',
    meta_mensual: 120000,
    comision_porcentaje: 7,
    tipo_personal: 'supervisor',
    zona_venta: 'Norte',
    puesto: 'Supervisor de Ventas',
    departamento: 'Ventas',
    supervisor: 'Roberto Sánchez',
    salario: '$520,000',
    certificaciones: ['Liderazgo', 'Gestión de Equipos'],
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Datos de puestos
const positions = [
  {
    nombre: 'Analista de Operaciones',
    descripcion_responsabilidades: 'Análisis de procesos operativos y generación de reportes de eficiencia',
    requisitos_experiencia: '2-3 años en análisis de procesos',
    requisitos_formacion: 'Licenciatura en Administración o Ingeniería',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    nombre: 'Supervisor de Operaciones',
    descripcion_responsabilidades: 'Supervisión de equipos de trabajo y control de calidad operativa',
    requisitos_experiencia: '4-5 años en supervisión de equipos',
    requisitos_formacion: 'Licenciatura en Administración o Ingeniería Industrial',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    nombre: 'Ejecutivo de Ventas',
    descripcion_responsabilidades: 'Desarrollo de ventas, atención al cliente y seguimiento de oportunidades',
    requisitos_experiencia: '1-2 años en ventas',
    requisitos_formacion: 'Licenciatura en Marketing, Administración o afín',
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Función para sembrar datos
async function seedData() {
  try {
    console.log('🌱 Iniciando seed de datos...');

    // Sembrar departamentos
    console.log('📁 Creando departamentos...');
    const departmentIds = [];
    for (const dept of departments) {
      const docRef = await addDoc(collection(db, 'departments'), dept);
      departmentIds.push(docRef.id);
      console.log(`✅ Departamento creado: ${dept.name} (ID: ${docRef.id})`);
    }

    // Sembrar personal
    console.log('👥 Creando personal...');
    for (const person of personnel) {
      const docRef = await addDoc(collection(db, 'personnel'), person);
      console.log(`✅ Personal creado: ${person.nombres} ${person.apellidos} (ID: ${docRef.id})`);
    }

    // Sembrar puestos
    console.log('👔 Creando puestos...');
    for (const pos of positions) {
      const docRef = await addDoc(collection(db, 'positions'), pos);
      console.log(`✅ Puesto creado: ${pos.nombre} (ID: ${docRef.id})`);
    }

    console.log('🎉 Seed completado exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - ${departments.length} departamentos`);
    console.log(`   - ${personnel.length} empleados`);
    console.log(`   - ${positions.length} puestos`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  }
}

// Ejecutar el seed
seedData();












