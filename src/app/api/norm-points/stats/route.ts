import { NextResponse } from 'next/server';
import { NormPointRelationService } from '@/services/normPoints/NormPointRelationService';

// GET /api/norm-points/stats - Get compliance statistics
export async function GET() {
  try {
    const stats = await NormPointRelationService.getComplianceStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting compliance stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de cumplimiento' },
      { status: 500 }
    );
  }
}
