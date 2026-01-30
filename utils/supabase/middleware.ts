import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // 1. Crear respuesta base
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Definir la URL principal para redirigir si no hay sesión
    // Ajusta esto a tu dominio real de producción
    const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://kasa-frontend-dev-git-dev-inviert-kasas-projects.vercel.app';

    // 2. Cliente Supabase
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
          domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
          path: '/',
          sameSite: 'lax',
          secure: true,
        },
      }
    );

    // 3. Obtener usuario (Ahora leerá la cookie que creó el proyecto principal)
    const { data: { user }, error } = await supabase.auth.getUser();

    console.log("=== MIDDLEWARE SECUNDARIO ===");
    console.log("Path:", request.nextUrl.pathname);
    console.log("Usuario encontrado:", !!user);

    // 4. Protección de Rutas
    const hasSessionToken = request.nextUrl.searchParams.has('session_token');

    // Si NO hay usuario y NO es una ruta pública (imágenes, etc.)
    if ((error || !user) && !hasSessionToken) {
      // Excluimos archivos estáticos y favicon para no bloquear recursos
      if (!request.nextUrl.pathname.startsWith('/_next') &&
        !request.nextUrl.pathname.includes('favicon.ico')) {

        console.log("🔒 Usuario no autenticado en sub-app. Redirigiendo al Login Principal.");

        // Redirigir al Login del Proyecto Principal
        const loginUrl = new URL('/sign-in', MAIN_APP_URL);
        // Opcional: Agregar redirect para volver aquí después
        // loginUrl.searchParams.set('redirect', request.url); 

        return NextResponse.redirect(loginUrl);
      }
    }

    return response;
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};