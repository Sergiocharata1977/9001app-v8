import { auth } from '@/firebase/admin';
import { createCommentSchema } from '@/lib/validations/news';
import { CommentService } from '@/services/news/CommentService';
import { PostService } from '@/services/news/PostService';
import type { CommentCreateData } from '@/types/news';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/news/posts/[id]/comments - Obtener comentarios de un post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    await auth.verifyIdToken(token);

    // Verificar que el post existe
    const post = await PostService.getById(params.id);
    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Publicación no encontrada',
          },
        },
        { status: 404 }
      );
    }

    // Obtener comentarios
    const comments = await CommentService.getByPostId(params.id);

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error in GET /api/news/posts/[id]/comments:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al obtener comentarios',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/news/posts/[id]/comments - Crear comentario
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Verificar que el post existe
    const post = await PostService.getById(params.id);
    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Publicación no encontrada',
          },
        },
        { status: 404 }
      );
    }

    // Obtener datos del body
    const body = await request.json();

    // Validar datos
    const validationResult = createCommentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_COMMENT_DATA',
            message: 'Datos de comentario inválidos',
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

    // Crear comentario
    const commentData: CommentCreateData = {
      postId: params.id,
      content: validationResult.data.content,
      authorId: userId,
      authorName: userName,
      authorPhotoURL: userPhotoURL,
    };

    const commentId = await CommentService.create(commentData);

    // Obtener el comentario creado
    const createdComment = await CommentService.getById(commentId);

    // TODO: Crear notificación para el autor del post (Fase 2)
    // if (post.authorId !== userId) {
    //   await NotificationService.create({
    //     userId: post.authorId,
    //     type: 'comment',
    //     postId: params.id,
    //     commentId: commentId,
    //     actorId: userId,
    //     actorName: userName,
    //     actorPhotoURL: userPhotoURL,
    //     message: `${userName} comentó en tu publicación`,
    //   });
    // }

    return NextResponse.json(
      {
        success: true,
        data: createdComment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/news/posts/[id]/comments:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al crear comentario',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
