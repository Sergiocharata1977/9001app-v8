import { auth } from '@/firebase/admin';
import { updateCommentSchema } from '@/lib/validations/news';
import { CommentService } from '@/services/news/CommentService';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/news/comments/[id] - Actualizar comentario
export async function PATCH(
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

    // Verificar que el comentario existe
    const comment = await CommentService.getById(params.id);
    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'COMMENT_NOT_FOUND',
            message: 'Comentario no encontrado',
          },
        },
        { status: 404 }
      );
    }

    // Verificar permisos (solo el autor puede editar)
    if (comment.authorId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para editar este comentario',
          },
        },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const body = await request.json();

    // Validar datos
    const validationResult = updateCommentSchema.safeParse(body);
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

    // Actualizar comentario
    await CommentService.update(params.id, validationResult.data);

    // Obtener comentario actualizado
    const updatedComment = await CommentService.getById(params.id);

    return NextResponse.json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error('Error in PATCH /api/news/comments/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al actualizar comentario',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/news/comments/[id] - Eliminar comentario
export async function DELETE(
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

    // Verificar que el comentario existe
    const comment = await CommentService.getById(params.id);
    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'COMMENT_NOT_FOUND',
            message: 'Comentario no encontrado',
          },
        },
        { status: 404 }
      );
    }

    // Verificar permisos (autor o admin)
    const isAdmin = decodedToken.role === 'admin';
    const isAuthor = comment.authorId === userId;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para eliminar este comentario',
          },
        },
        { status: 403 }
      );
    }

    // Eliminar comentario (soft delete)
    await CommentService.delete(params.id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error in DELETE /api/news/comments/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Error al eliminar comentario',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
