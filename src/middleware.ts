import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Por ahora, permitir todas las rutas pasar
  // La autenticación se maneja en el cliente con ProtectedRoute
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Solo aplicar a rutas específicas del frontend, no a las rutas de API externas
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 