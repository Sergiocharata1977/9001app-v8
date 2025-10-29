// API endpoint for creating admin user records

import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/auth/UserService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, role = 'admin' } = body;

    // Validate required fields
    if (!uid || !email) {
      return NextResponse.json(
        { error: 'uid y email son requeridos' },
        { status: 400 }
      );
    }

    console.log('[API /admin/users/create] Creating admin user:', { uid, email, role });

    // Check if user already exists
    const existingUser = await UserService.getById(uid);
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      );
    }

    // Create admin user
    const user = await UserService.createUser({ uid, email });
    // Update role to admin
    await UserService.updateRole(uid, role as any);

    console.log('[API /admin/users/create] Admin user created successfully:', user.id);

    return NextResponse.json({
      user,
      message: 'Usuario administrador creado exitosamente'
    });

  } catch (error) {
    console.error('[API /admin/users/create] Error:', error);

    return NextResponse.json(
      {
        error: 'Error al crear usuario administrador',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}