import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
        cookieOptions: {
          name: 'kasa_learn_auth',
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    console.log("========================================");
    console.log("Middleware executing for path:", request.nextUrl.pathname);
    console.log("User error:", user.error);
    console.log("User ID:", user.data?.user?.id);
    console.log("User email:", user.data?.user?.email);
    console.log("Has user:", !!user.data?.user);
    console.log("========================================");

    // Protected routes (prefixed with basePath /academy)
    const protectedRoutes = ['/academy/profile', '/academy/quiz', '/academy/lesson', '/academy/sections'];
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

    // Public routes (auth) - if these exist in the project, they'll be at /academy/login
    // Assuming login/register are handled by the main app at the root
    const isAuthRoute = request.nextUrl.pathname === "/academy/login" || request.nextUrl.pathname === "/academy/register";

    // protected routes - check authentication first
    if (isProtectedRoute && user.error) {
      console.log("🔒 Redirecting unauthenticated user to login");
      // Redirect to the main app's login (root)
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // redirect authenticated users from auth pages or home if they land on them
    if (isAuthRoute && !user.error && user.data?.user) {
      console.log("🔄 Redirecting authenticated user from auth page to home");
      return NextResponse.redirect(new URL("/academy", request.url));
    }

    // Optional: if landing on home and authenticated, redirect to main app dashboard 
    // ONLY if that's the desired behavior. The root middleware didn't have this, 
    // so I will stick to "/" for now unless it was explicitly requested.

    return response;
  } catch {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
