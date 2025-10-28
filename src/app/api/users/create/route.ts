// API endpoint for creating user records

import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/auth/UserService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email } = body;

    // Validate required fields
    if (!uid || !email) {
      return NextResponse.json(
        { error: 'uid y email son requeridos' },
        { status: 400 }
      );
    }

    console.log('[API /users/create] Creating user:', { uid, email });

    // Check if user already exists
    const existingUser = await UserService.getById(uid);
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      );
    }

    // Create user
    const user = await UserService.createUser({ uid, email });

    console.log('[API /users/create] User created successfully:', user.id);

    return NextResponse.json({
      user,
      message: 'Usuario creado exitosamente'
    });

  } catch (error) {
    console.error('[API /users/create] Error:', error);

    return NextResponse.json(
      {
        error: 'Error al crear usuario',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
