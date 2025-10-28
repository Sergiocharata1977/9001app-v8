import { NextResponse } from 'next/server';
import { NormPointService } from '@/services/normPoints/NormPointService';

// GET /api/norm-points/mandatory - Get mandatory norm points
export async function GET() {
  try {
    const normPoints = await NormPointService.getMandatory();

    return NextResponse.json(normPoints);
  } catch (error) {
    console.error('Error getting mandatory norm points:', error);
    return NextResponse.json(
      { error: 'Error al obtener puntos de norma obligatorios' },
      { status: 500 }
    );
  }
}
