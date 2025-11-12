import { NextResponse } from 'next/server';
import { DepartmentService } from '@/services/rrhh/DepartmentService';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { PositionService } from '@/services/rrhh/PositionService';
import { TrainingService } from '@/services/rrhh/TrainingService';
import { EvaluationService } from '@/services/rrhh/EvaluationService';

export async function DELETE() {
  try {
    console.log('🧹 Limpiando datos RRHH existentes...');

    // Obtener todos los datos existentes
    const departments = await DepartmentService.getAll();
    const personnel = await PersonnelService.getAll();
    const positions = await PositionService.getAll();
    const trainings = await TrainingService.getAll();
    const evaluations = await EvaluationService.getAll();

    // Eliminar evaluaciones
    console.log(`🗑️ Eliminando ${evaluations.length} evaluaciones...`);
    for (const evaluation of evaluations) {
      await EvaluationService.delete(evaluation.id);
    }

    // Eliminar capacitaciones
    console.log(`🗑️ Eliminando ${trainings.length} capacitaciones...`);
    for (const training of trainings) {
      await TrainingService.delete(training.id);
    }

    // Eliminar personal
    console.log(`🗑️ Eliminando ${personnel.length} empleados...`);
    for (const person of personnel) {
      await PersonnelService.delete(person.id);
    }

    // Eliminar puestos
    console.log(`🗑️ Eliminando ${positions.length} puestos...`);
    for (const position of positions) {
      await PositionService.delete(position.id);
    }

    // Eliminar departamentos
    console.log(`🗑️ Eliminando ${departments.length} departamentos...`);
    for (const department of departments) {
      await DepartmentService.delete(department.id);
    }

    console.log('✅ Limpieza completada exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Datos RRHH eliminados exitosamente',
      deleted: {
        departments: departments.length,
        positions: positions.length,
        personnel: personnel.length,
        trainings: trainings.length,
        evaluations: evaluations.length,
      },
    });
  } catch (error) {
    console.error('❌ Error al limpiar datos RRHH:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al limpiar datos RRHH',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
