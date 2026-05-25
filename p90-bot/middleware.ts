import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Protect /admin routes (except /admin/login)
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
    const token = req.cookies.get('admin-token')?.value;
    const valid = token === process.env.ADMIN_PASSWORD;
    if (!valid) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  // Protect /api/kb and /api/schedule write operations
  if ((req.nextUrl.pathname.startsWith('/api/kb') || req.nextUrl.pathname.startsWith('/api/schedule')) 
      && req.method !== 'GET') {
    const token = req.headers.get('x-admin-token');
    if (token !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/kb/:path*', '/api/schedule/:path*'],
};
