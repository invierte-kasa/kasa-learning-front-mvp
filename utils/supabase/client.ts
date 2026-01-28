import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'kasa_learn_auth',
        domain: typeof window !== 'undefined' && window.location.hostname.includes('inviertekasa.com')
          ? '.inviertekasa.com'
          : undefined,
        path: '/',
        sameSite: 'lax',
        secure: true,
      },
    }
  );
