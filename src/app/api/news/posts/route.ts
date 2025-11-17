import { getAdminAuth } from '@/lib/firebase/admin';
import {
  createPostSchema,
  paginationSchema,
  postFiltersSchema,
} from '@/lib/validations/news';
import { PostService } from '@/services/news/PostService';
import type { PostCreateData } from '@/types/news';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/news/posts - Listar posts con paginación
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'No autorizado' },
        },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    await auth.verifyIdToken(token);

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const authorId = searchParams.get('authorId') || undefined;
    const search = searchParams.get('search') || undefined;
    const lastDocId = searchParams.get('lastDocId') || undefined;

    // Validar paginación
    const paginationResult = paginationSchema.safeParse({ page, limit });
    if (!paginationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_POST_DATA',
            message: 'Parámetros de paginación inválidos',
            details: paginationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Validar filtros
    const filtersResult = postFiltersSchema.safeParse({ authorId, search });
    if (!filtersResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_POST_DATA',
            message: 'Filtros inválidos',
            details: filtersResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Obtener posts
    const { posts, hasMore, total } = await PostService.getAll(
      paginationResult.data.page,
      paginationResult.data.limit,
      filtersResult.data,
      lastDocId
    );

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page: paginationResult.data.page,
        limit: paginationResult.data.limit,
        total,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/news/posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al obtener publicaciones',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/news/posts - Crear nuevo post
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'No autorizado' },
        },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Obtener datos del body
    const body = await request.json();

    // Validar datos
    const validationResult = createPostSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_POST_DATA',
            message: 'Datos de publicación inválidos',
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Obtener información del usuario
    const userRecord = await auth.getUser(userId);
    const userName = userRecord.displayName || 'Usuario';
    const userPhotoURL = userRecord.photoURL || null;

    // Crear post
    const postData: PostCreateData = {
      content: validationResult.data.content,
      authorId: userId,
      authorName: userName,
      authorPhotoURL: userPhotoURL,
      organizationId: validationResult.data.organizationId,
      images: [], // Fase 2
      attachments: [], // Fase 2
    };

    const postId = await PostService.create(postData);

    // Obtener el post creado
    const createdPost = await PostService.getById(postId);

    return NextResponse.json(
      {
        success: true,
        data: createdPost,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/news/posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al crear publicación',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
