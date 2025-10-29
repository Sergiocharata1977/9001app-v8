import { NextResponse } from 'next/server';
import { DepartmentService } from '@/services/rrhh/DepartmentService';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { PositionService } from '@/services/rrhh/PositionService';

export async function GET() {
  try {
    console.log('🔍 Verificando datos en Firebase...');

    // Obtener todos los datos
    const departments = await DepartmentService.getAll();
    const personnel = await PersonnelService.getAll();
    const positions = await PositionService.getAll();

    console.log('📊 Datos encontrados:');
    console.log(`- Departamentos: ${departments.length}`);
    console.log(`- Personal: ${personnel.length}`);
    console.log(`- Puestos: ${positions.length}`);

    return NextResponse.json({
      success: true,
      message: 'Datos verificados exitosamente',
      data: {
        departments: {
          count: departments.length,
          items: departments.map(dept => ({
            id: dept.id,
            name: dept.name,
            is_active: dept.is_active
          }))
        },
        personnel: {
          count: personnel.length,
          items: personnel.map(person => ({
            id: person.id,
            nombres: person.nombres,
            apellidos: person.apellidos,
            email: person.email,
            estado: person.estado
          }))
        },
        positions: {
          count: positions.length,
          items: positions.map(pos => ({
            id: pos.id,
            nombre: pos.nombre,
            departamento_id: pos.departamento_id
          }))
        }
      }
    });
  } catch (error) {
    console.error('❌ Error al verificar datos:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al verificar datos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
















