import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/rrhh', '/procesos', '/calidad', '/auditorias', '/reportes'];
  
  // Rutas de autenticación
  const authRoutes = ['/login', '/register'];
  
  const { pathname } = request.nextUrl;
  
  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Obtener token de autenticación (esto se manejará en el cliente)
  // Por ahora, permitimos el acceso y manejamos la autenticación en el cliente
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};






