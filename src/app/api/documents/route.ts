import { NextRequest, NextResponse } from 'next/server';
import { DocumentService } from '@/services/documents/DocumentService';
import { DocumentCreateSchema } from '@/lib/validations/documents';
import { DocumentCreateData } from '@/types/documents';
import { z } from 'zod';

// GET /api/documents - List documents with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters: Record<string, string | boolean | undefined> = {};
    if (searchParams.get('type')) filters.type = searchParams.get('type')!;
    if (searchParams.get('status'))
      filters.status = searchParams.get('status')!;
    if (searchParams.get('category'))
      filters.category = searchParams.get('category')!;
    if (searchParams.get('responsible_user_id'))
      filters.responsible_user_id = searchParams.get('responsible_user_id')!;
    if (searchParams.get('process_id'))
      filters.process_id = searchParams.get('process_id')!;
    if (searchParams.get('is_archived'))
      filters.is_archived = searchParams.get('is_archived') === 'true';

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'created_at';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    const result = await DocumentService.getPaginated(filters, {
      page,
      limit,
      sort,
      order,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting documents:', error);
    return NextResponse.json(
      { error: 'Error al obtener documentos' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Create new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validatedData = DocumentCreateSchema.parse(
      body
    ) as DocumentCreateData;

    const document = await DocumentService.create(validatedData);

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Error al crear documento' },
      { status: 500 }
    );
  }
}
