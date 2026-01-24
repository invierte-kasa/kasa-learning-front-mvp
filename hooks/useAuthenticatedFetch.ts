import { createClient } from "@/utils/supabase/client";

export const useAuthenticatedFetch = () => {
  const supabase = createClient();

  const authenticatedFetch = async (url: string, options?: RequestInit) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("No authenticated session");
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
      ...options?.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return { authenticatedFetch };
};