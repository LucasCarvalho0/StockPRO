import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('stockpro_token')?.value;

  // Libera assets, imagens e favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/manifest.json') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Rotas públicas (estando logado, redireciona para dashboard)
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Para rotas de API (exceto auth), apenas verifica se o header existe (a validação real é na rota)
  if (pathname.startsWith('/api/')) {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ') && !token) {
      return Response.json({ message: 'Não autorizado' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Proteção de rotas de página (Dashboard, etc)
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
