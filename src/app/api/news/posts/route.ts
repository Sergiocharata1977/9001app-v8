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

    // Obtener datos del FormData
    const formData = await request.formData();

    // Extraer campos del formulario
    const content = formData.get('content') as string;
    const organizationId = formData.get('organizationId') as string;

    // Extraer archivos de imagen
    const imageFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('images[') && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // Validar datos básicos
    const validationResult = createPostSchema.safeParse({
      content,
      organizationId,
    });
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

    // Validar archivos de imagen (máximo 5)
    if (imageFiles.length > 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TOO_MANY_IMAGES',
            message: 'Máximo 5 imágenes permitidas',
          },
        },
        { status: 400 }
      );
    }

    // Obtener información del usuario
    const userRecord = await auth.getUser(userId);
    const userName = userRecord.displayName || 'Usuario';
    const userPhotoURL = userRecord.photoURL || null;

    // Crear post con archivos
    const postId = await PostService.createWithFiles(
      validationResult.data.content,
      imageFiles,
      userId,
      userName,
      userPhotoURL,
      validationResult.data.organizationId
    );

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
