import { verifyJwtToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/', '/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const isPublicRoute = publicRoutes.some(
        (route) => path === route || path.startsWith(`${route}/`)
    );

    if (isPublicRoute) {
        return NextResponse.next();
    }

    if (path.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    const authHeader = request.headers.get('Authorization');
    const token =
        authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;

    if (!token) {
        if (path.startsWith('/api/')) {
            return NextResponse.json(
                { message: 'Não autenticado' },
                { status: 401 }
            );
        } else {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    try {
        const decodedToken = await verifyJwtToken(token);

        if (path.includes('/admin') && !decodedToken.isAdmin) {
            if (path.startsWith('/api/')) {
                return NextResponse.json(
                    { message: 'Acesso não autorizado' },
                    { status: 403 }
                );
            } else {
                return NextResponse.redirect(new URL('/home', request.url));
            }
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Erro ao verificar o token:', error);
        if (path.startsWith('/api/')) {
            return NextResponse.json(
                { message: 'Token inválido ou expirado' },
                { status: 401 }
            );
        } else {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
    ]
};
