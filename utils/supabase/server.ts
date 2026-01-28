import { createServerClient } from "@supabase/ssr";

export const createClient = async () => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const host = cookieStore.get('host')?.value || ''; // Note: headers() is better for host
  // Re-importing headers for host
  const { headers } = await import("next/headers");
  const hostName = (await headers()).get('host') || '';

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
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      cookieOptions: {
        name: 'kasa_learn_auth',
        domain: hostName.includes('inviertekasa.com') ? '.inviertekasa.com' : undefined,
        path: '/',
        sameSite: 'lax',
        secure: true,
      },
    }
  );
};
