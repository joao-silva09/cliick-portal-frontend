import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Páginas públicas que não precisam de autenticação
  const publicPaths = [
    '/login',
    '/auth/callback',
    '/',
    '/_next',
    '/favicon.ico',
    '/api',
  ]
  
  // Verificar se é uma página pública
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path)
  )
  
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // Verificar se há tokens de autenticação
  const authTokens = request.cookies.get('auth_tokens')
  
  if (!authTokens) {
    // Redirecionar para login se não autenticado
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}