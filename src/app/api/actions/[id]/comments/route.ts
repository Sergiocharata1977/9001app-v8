import { ActionService } from '@/services/actions/ActionService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const commentSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  comment: z.string().min(1),
});

/**
 * POST /api/actions/[id]/comments
 * Agrega un comentario a una acción
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = 'current-user-id'; // TODO: Get from token
    const body = await request.json();

    const validationResult = commentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    await ActionService.addComment(id, validationResult.data, userId);

    return NextResponse.json(
      { message: 'Comment added successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/actions/[id]/comments:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}
