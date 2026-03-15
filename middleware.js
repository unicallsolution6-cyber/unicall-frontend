import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get token from request headers or cookies
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login'];
  
  // Admin routes that require admin role
  const adminRoutes = [
    '/admin/dashboard',
    '/admin/users',
    '/admin/unicall-users', 
    '/admin/add-user',
    '/admin/user-details',
    '/admin/clients',
    '/admin/lead-forms',
    '/admin/add-lead-file'
  ];
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Check if the route is admin-only
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  // If accessing a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // For admin routes, additional role checking would need to be done
  // at the component level since we can't decode JWT easily in middleware
  // The admin layout will handle role-based protection
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
