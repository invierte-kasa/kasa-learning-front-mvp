import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();
  const headerList = await headers();
  const host = headerList.get("host") || "";
  const isLocal = process.env.NEXT_PUBLIC_APP_ENV === "local";

  // En local no forzamos https a menos que la URL lo tenga
  const isHttps = host.includes("inviertekasa.shop") && !isLocal;
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                domain: cookieDomain,
                secure: isHttps || !isLocal,
                sameSite: "lax",
                path: "/",
              });
            });
          } catch {
            // Manejado por el framework
          }
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
};
