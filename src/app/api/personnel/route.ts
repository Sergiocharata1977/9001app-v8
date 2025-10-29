import { NextResponse } from 'next/server';
import { PersonnelService } from '@/services/rrhh/PersonnelService';

// GET /api/personnel - Obtener todo el personal
export async function GET() {
  try {
    const personnel = await PersonnelService.getAll();
    return NextResponse.json(personnel);
  } catch (error) {
    console.error('Error getting personnel:', error);
    return NextResponse.json(
      { error: 'Error al obtener personal' },
      { status: 500 }
    );
  }
}
