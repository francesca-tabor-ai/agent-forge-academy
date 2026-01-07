import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes, static files, and public assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  try {
    // Validate required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Middleware] Missing Supabase env vars:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        pathname,
      });
      // Allow request to proceed if env vars are missing (graceful degradation)
      // In production, you should set these in Vercel project settings
      return NextResponse.next();
    }

    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    });

    // Get user session (this can fail, so we handle it)
    let user = null;
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error('[Middleware] Auth error:', {
          error: authError.message,
          pathname,
        });
        // Continue without user if auth fails
      } else {
        user = authUser;
      }
    } catch (error) {
      console.error('[Middleware] Error getting user:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        pathname,
      });
      // Continue without user
    }

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/reset-password'];
    const isPublicRoute = publicRoutes.some((route) => pathname === route) || pathname.startsWith('/auth/');

    // If logged in and visiting /, redirect to /app
    if (user && pathname === '/') {
      return NextResponse.redirect(new URL('/app', request.url));
    }

    // If not authenticated and trying to access protected route, redirect to login
    if (!user && !isPublicRoute) {
      // Protect /app* routes
      if (pathname.startsWith('/app')) {
        try {
          const redirectUrl = new URL('/auth/login', request.url);
          redirectUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(redirectUrl);
        } catch (redirectError) {
          console.error('[Middleware] Redirect error:', {
            error: redirectError instanceof Error ? redirectError.message : 'Unknown error',
            pathname,
          });
          return NextResponse.next();
        }
      }
      
      // For other protected routes (not /app*), redirect to login
      if (pathname !== '/auth/login') {
        try {
          const redirectUrl = new URL('/auth/login', request.url);
          redirectUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(redirectUrl);
        } catch (redirectError) {
          console.error('[Middleware] Redirect error:', {
            error: redirectError instanceof Error ? redirectError.message : 'Unknown error',
            pathname,
          });
          return NextResponse.next();
        }
      }
    }

    // If authenticated, get user role for route protection
    if (user) {
      let role: string | null = null;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('[Middleware] Profile fetch error:', {
            error: profileError.message,
            pathname,
            userId: user.id,
          });
          // Continue without role if profile fetch fails
        } else {
          role = profile?.role || null;
        }
      } catch (error) {
        console.error('[Middleware] Error fetching profile:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          pathname,
        });
        // Continue without role
      }

      // Role-based route protection (only if we have a role)
      if (role) {
        if (pathname.startsWith('/student') && role !== 'student') {
          return NextResponse.redirect(new URL('/', request.url));
        }

        if (pathname.startsWith('/tutor') && role !== 'tutor') {
          return NextResponse.redirect(new URL('/', request.url));
        }

        if (pathname.startsWith('/recruiter') && role !== 'recruiter') {
          return NextResponse.redirect(new URL('/', request.url));
        }

        if (pathname.startsWith('/admin') && role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }

    return response;
  } catch (error) {
    // Catch-all error handler - log but don't crash
    console.error('[Middleware] Unexpected error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      pathname,
    });

    // Always return a response to prevent middleware crash
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder and static assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
