import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  const isLocal = process.env.NEXT_PUBLIC_APP_ENV === "local";
  const hostname = request.headers.get("host") || "";

  // Detectar HTTPS (necesario para cookies seguras en local)
  const isHttps = hostname.includes("local.inviertekasa.shop");

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const cookieDomain = isLocal ? ".local.inviertekasa.shop" : (process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined);

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

  // Gestión de protección - Si no hay usuario, redirigir al dominio principal (Home)
  // No redirigimos a /sign-in para evitar que el middleware del frontend nos mande a investments
  if (!user && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.includes('.')) {
    const MAIN_APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://local.inviertekasa.shop:3000';
    return NextResponse.redirect(new URL('/', MAIN_APP_URL));
  }

  return response;
};