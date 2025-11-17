/**
 * Document API Routes - SDK Unified
 * 
 * GET /api/sdk/documents - List documents
 * POST /api/sdk/documents - Create document
 */

import { DocumentService } from '@/lib/sdk/modules/documents';
import type { DocumentFilters } from '@/lib/sdk/modules/documents/types';
import { CreateDocumentSchema } from '@/lib/sdk/modules/documents/validations';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/sdk/documents - List documents with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Extract filters from query parameters
    const filters: DocumentFilters = {
      status: (searchParams.get('status') as any) || undefined,
      category: searchParams.get('category') || undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      tags: searchParams.get('tags')
        ? searchParams.get('tags')!.split(',')
        : undefined,
      search: searchParams.get('search') || undefined,
    };

    // Extract pagination options
    const options = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // Initialize service and list documents
    const service = new DocumentService();
    const documents = await service.list(filters, options);

    return NextResponse.json({
      documents,
      count: documents.length,
    });
  } catch (error) {
    console.error('Error in GET /api/sdk/documents:', error);
    return NextResponse.json(
      { error: 'Error al obtener documentos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/sdk/documents - Create document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate data using SDK schema
    const validatedData = CreateDocumentSchema.parse(body);

    // Get user ID from request (should come from auth middleware)
    const userId = body.userId || 'system';

    // Initialize service and create document
    const service = new DocumentService();
    const documentId = await service.createAndReturnId(validatedData, userId);

    return NextResponse.json(
      {
        id: documentId,
        message: 'Documento creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sdk/documents:', error);

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear documento', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
