import { DepartmentService } from '@/services/rrhh/DepartmentService';
import { PositionService } from '@/services/rrhh/PositionService';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { TrainingService } from '@/services/rrhh/TrainingService';
import { EvaluationService } from '@/services/rrhh/EvaluationService';

export async function seedRRHHData() {
  try {
    console.log('🌱 Iniciando seed de datos RRHH...');

    // Seed Departments
    console.log('📁 Creando departamentos...');
    const departments = [
      {
        name: 'Operaciones',
        description: 'Departamento responsable de las operaciones diarias',
        is_active: true,
      },
      {
        name: 'Ventas',
        description: 'Departamento de ventas y comercialización',
        is_active: true,
      },
      {
        name: 'Recursos Humanos',
        description: 'Gestión del talento humano y administración',
        is_active: true,
      },
    ];

    const createdDepartments = [];
    for (const dept of departments) {
      const created = await DepartmentService.create(dept);
      createdDepartments.push(created);
      console.log(`✅ Departamento creado: ${created.name}`);
    }

    // Seed Positions
    console.log('👔 Creando puestos...');
    const positions = [
      {
        nombre: 'Analista',
        descripcion_responsabilidades: 'Análisis de datos y reportes',
        departamento_id: createdDepartments[0].id,
      },
      {
        nombre: 'Supervisor',
        descripcion_responsabilidades: 'Supervisión de equipos de trabajo',
        departamento_id: createdDepartments[0].id,
      },
      {
        nombre: 'Gerente',
        descripcion_responsabilidades: 'Gestión estratégica del departamento',
        departamento_id: createdDepartments[0].id,
      },
      {
        nombre: 'Ejecutivo de Ventas',
        descripcion_responsabilidades: 'Desarrollo de ventas y atención al cliente',
        departamento_id: createdDepartments[1].id,
      },
      {
        nombre: 'Asistente RRHH',
        descripcion_responsabilidades: 'Apoyo administrativo en gestión de personal',
        departamento_id: createdDepartments[2].id,
      },
    ];

    const createdPositions = [];
    for (const pos of positions) {
      const created = await PositionService.create(pos);
      createdPositions.push(created);
      console.log(`✅ Puesto creado: ${created.nombre}`);
    }

    // Seed Personnel
    console.log('👥 Creando personal...');
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
        estado: 'Activo' as const,
        meta_mensual: 100000,
        comision_porcentaje: 5,
        tipo_personal: 'ventas' as const,
        zona_venta: 'Centro',
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
        estado: 'Activo' as const,
        meta_mensual: 80000,
        comision_porcentaje: 3,
        tipo_personal: 'administrativo' as const,
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
        estado: 'Activo' as const,
        meta_mensual: 120000,
        comision_porcentaje: 7,
        supervisor_id: undefined, // Will be set after creation
        tipo_personal: 'supervisor' as const,
        zona_venta: 'Norte',
      },
      {
        nombres: 'Ana Gabriela',
        apellidos: 'Fernández Torres',
        email: 'ana.fernandez@empresa.com',
        telefono: '+5491123456792',
        documento_identidad: '44332211',
        fecha_nacimiento: new Date('1992-01-30'),
        nacionalidad: 'Argentina',
        direccion: 'Calle Lavalle 234, Buenos Aires',
        telefono_emergencia: '+5491198765435',
        fecha_contratacion: new Date('2021-08-15'),
        numero_legajo: 'EMP004',
        estado: 'Activo' as const,
        meta_mensual: 90000,
        comision_porcentaje: 4,
        tipo_personal: 'ventas' as const,
        zona_venta: 'Sur',
      },
      {
        nombres: 'Roberto Miguel',
        apellidos: 'Sánchez Ruiz',
        email: 'roberto.sanchez@empresa.com',
        telefono: '+5491123456793',
        documento_identidad: '55667788',
        fecha_nacimiento: new Date('1978-09-12'),
        nacionalidad: 'Argentina',
        direccion: 'Av. Santa Fe 3456, Buenos Aires',
        telefono_emergencia: '+5491198765436',
        fecha_contratacion: new Date('2015-12-01'),
        numero_legajo: 'EMP005',
        estado: 'Activo' as const,
        meta_mensual: 150000,
        comision_porcentaje: 8,
        tipo_personal: 'gerencial' as const,
      },
    ];

    const createdPersonnel = [];
    for (const person of personnel) {
      const created = await PersonnelService.create(person);
      createdPersonnel.push(created);
      console.log(`✅ Personal creado: ${created.nombres} ${created.apellidos}`);
    }

    // Update supervisors
    await PersonnelService.update(createdPersonnel[0].id!, {
      supervisor_id: createdPersonnel[2].id,
    });
    await PersonnelService.update(createdPersonnel[3].id!, {
      supervisor_id: createdPersonnel[2].id,
    });

    // Seed Trainings
    console.log('🎓 Creando capacitaciones...');
    const trainings = [
      {
        tema: 'Seguridad Laboral',
        descripcion: 'Capacitación en normas de seguridad y prevención de riesgos',
        fecha_inicio: new Date('2025-02-01'),
        fecha_fin: new Date('2025-02-01'),
        horas: 8,
        modalidad: 'presencial' as const,
        proveedor: 'Instituto Nacional de Seguridad',
        costo: 50000,
        estado: 'completada' as const,
        participantes: [createdPersonnel[0].id!, createdPersonnel[1].id!, createdPersonnel[2].id!],
      },
      {
        tema: 'Ventas Consultivas',
        descripcion: 'Técnicas avanzadas de venta consultiva',
        fecha_inicio: new Date('2025-03-15'),
        fecha_fin: new Date('2025-03-16'),
        horas: 16,
        modalidad: 'virtual' as const,
        proveedor: 'Consultores ABC',
        costo: 75000,
        estado: 'en_curso' as const,
        participantes: [createdPersonnel[0].id!, createdPersonnel[3].id!],
      },
      {
        tema: 'Liderazgo Efectivo',
        descripcion: 'Desarrollo de habilidades de liderazgo',
        fecha_inicio: new Date('2025-04-10'),
        fecha_fin: new Date('2025-04-12'),
        horas: 24,
        modalidad: 'mixta' as const,
        proveedor: 'Centro de Desarrollo Profesional',
        costo: 120000,
        estado: 'planificada' as const,
        participantes: [createdPersonnel[2].id!, createdPersonnel[4].id!],
      },
    ];

    const createdTrainings = [];
    for (const training of trainings) {
      const created = await TrainingService.create(training);
      createdTrainings.push(created);
      console.log(`✅ Capacitación creada: ${created.tema}`);
    }

    // Seed Evaluations
    console.log('📊 Creando evaluaciones...');
    const evaluations = [
      {
        personnel_id: createdPersonnel[0].id!,
        periodo: '2025-Q1',
        fecha_evaluacion: new Date('2025-01-15'),
        evaluador_id: createdPersonnel[2].id!,
        competencias: [
          {
            nombre: 'Comunicación',
            puntaje: 4,
            comentario: 'Excelente capacidad de comunicación con clientes',
          },
          {
            nombre: 'Productividad',
            puntaje: 5,
            comentario: 'Supera consistentemente las metas establecidas',
          },
          {
            nombre: 'Trabajo en equipo',
            puntaje: 4,
            comentario: 'Buena colaboración con el equipo',
          },
        ],
        resultado_global: 'alto' as const,
        comentarios_generales: 'Excelente desempeño general. Continuar con el buen trabajo.',
        plan_mejora: 'Desarrollar habilidades en gestión de tiempo.',
        estado: 'publicado' as const,
      },
      {
        personnel_id: createdPersonnel[1].id!,
        periodo: '2025-Q1',
        fecha_evaluacion: new Date('2025-01-20'),
        evaluador_id: createdPersonnel[4].id!,
        competencias: [
          {
            nombre: 'Organización',
            puntaje: 4,
            comentario: 'Muy organizada y eficiente',
          },
          {
            nombre: 'Atención al detalle',
            puntaje: 5,
            comentario: 'Excelente precisión en el trabajo',
          },
          {
            nombre: 'Adaptabilidad',
            puntaje: 3,
            comentario: 'Puede mejorar en la adaptación a cambios',
          },
        ],
        resultado_global: 'medio' as const,
        comentarios_generales: 'Buen desempeño administrativo. Áreas de mejora identificadas.',
        plan_mejora: 'Participar en capacitación de gestión del cambio.',
        estado: 'publicado' as const,
      },
      {
        personnel_id: createdPersonnel[3].id!,
        periodo: '2025-Q1',
        fecha_evaluacion: new Date('2025-01-25'),
        evaluador_id: createdPersonnel[2].id!,
        competencias: [
          {
            nombre: 'Orientación al cliente',
            puntaje: 4,
            comentario: 'Buena atención al cliente',
          },
          {
            nombre: 'Técnicas de venta',
            puntaje: 3,
            comentario: 'Necesita mejorar técnicas de cierre',
          },
          {
            nombre: 'Conocimiento del producto',
            puntaje: 4,
            comentario: 'Buen conocimiento de la línea de productos',
          },
        ],
        resultado_global: 'medio' as const,
        comentarios_generales: 'Buen potencial. Requiere desarrollo en técnicas de venta.',
        plan_mejora: 'Capacitación en técnicas avanzadas de venta.',
        estado: 'borrador' as const,
      },
    ];

    for (const evaluation of evaluations) {
      const created = await EvaluationService.create(evaluation);
      console.log(`✅ Evaluación creada para: ${created.personnel_id} - Período: ${created.periodo}`);
    }

    console.log('🎉 Seed de datos RRHH completado exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`   - ${createdDepartments.length} departamentos`);
    console.log(`   - ${createdPositions.length} puestos`);
    console.log(`   - ${createdPersonnel.length} empleados`);
    console.log(`   - ${createdTrainings.length} capacitaciones`);
    console.log(`   - ${evaluations.length} evaluaciones`);

  } catch (error) {
    console.error('❌ Error durante el seed de datos RRHH:', error);
    throw error;
  }
}