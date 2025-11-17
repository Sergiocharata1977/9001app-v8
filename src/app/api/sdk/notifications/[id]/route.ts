import { authMiddleware } from '@/lib/sdk/middleware/auth';
import { errorHandler } from '@/lib/sdk/middleware/errorHandler';
import { NotificationService } from '@/lib/sdk/modules/calendar/NotificationService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const notificationService = new NotificationService();
    const notification = await notificationService.getById(params.id);

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const body = await request.json();
    const notificationService = new NotificationService();

    // Marcar como leída
    if (body.action === 'mark_read') {
      const notification = await notificationService.markAsRead(params.id);
      return NextResponse.json({
        success: true,
        data: notification,
      });
    }

    // Archivar
    if (body.action === 'archive') {
      const notification = await notificationService.archiveNotification(params.id);
      return NextResponse.json({
        success: true,
        data: notification,
      });
    }

    // Actualizar
    const updated = await notificationService.update(params.id, body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const notificationService = new NotificationService();
    const result = await notificationService.delete(params.id);

    return NextResponse.json({
      success: result,
      message: result ? 'Notification deleted' : 'Notification not found',
    });
  } catch (error) {
    return errorHandler(error);
  }
}
