import { NextResponse } from 'next/server';
import { DocumentService } from '@/services/documents/DocumentService';

// GET /api/documents/stats - Get document statistics
export async function GET() {
  try {
    const stats = await DocumentService.getStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting document stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de documentos' },
      { status: 500 }
    );
  }
}
