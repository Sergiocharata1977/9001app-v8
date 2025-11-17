import { authMiddleware } from '@/lib/sdk/middleware/auth';
import { errorHandler } from '@/lib/sdk/middleware/errorHandler';
import { UserProfileService } from '@/lib/sdk/modules/rrhh/UserProfileService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const userProfileSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin', 'auditor', 'manager', 'user', 'viewer']),
  permissions: z.array(z.string()).optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const department = searchParams.get('department');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const userService = new UserProfileService();

    let users;
    if (role) {
      users = await userService.getUsersByRole(role as any);
    } else if (department) {
      users = await userService.getUsersByDepartment(department);
    } else {
      users = await userService.getAllUsers(activeOnly);
    }

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return errorHandler(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json(authResult, { status: 401 });
    }

    const body = await request.json();
    const validated = userProfileSchema.parse(body);

    const userService = new UserProfileService();
    const user = await userService.createUserProfile(validated);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return errorHandler(error);
  }
}
