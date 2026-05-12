import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  const isLocal = process.env.NEXT_PUBLIC_APP_ENV === "local";
  const hostname = request.headers.get("host") || "";

  // Detectar HTTPS (necesario para cookies seguras en local)
  const isHttps = hostname.includes("inviertekasa.shop") && !isLocal;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, {
              ...options,
              domain: cookieDomain,
              secure: isHttps || !isLocal,
              sameSite: "lax",
              path: "/",
            });
          });
        },
      },
      cookieOptions: {
        domain: cookieDomain,
        path: "/",
        sameSite: "lax",
        secure: isHttps || !isLocal,
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith('/login');
  // /auth/* debe ser siempre accesible (OAuth callback)
  const isAuthCallback = pathname.startsWith('/auth');

  // Si no hay usuario y no es una ruta pública, redirigir a login
  if (!user && !isAuthPage && !isAuthCallback && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si hay usuario y trata de entrar a login, redirigir a inicio
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
};