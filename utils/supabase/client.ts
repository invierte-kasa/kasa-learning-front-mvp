import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export const createClient = () => {
  if (client) return client;

  const isLocal = process.env.NEXT_PUBLIC_APP_ENV === "local";
  const cookieDomain = isLocal ? ".local.inviertekasa.shop" : (process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined);

  // En el cliente detectamos HTTPS por window.location
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: cookieDomain,
        path: "/",
        sameSite: "lax",
        secure: isHttps || !isLocal,
      },
    }
  );

  return client;
};
