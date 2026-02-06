"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
    useRef
} from "react";
import { createClient } from "@/utils/supabase/client";

export interface UserProfile {
    id: number;
    user_id: string;
    email: string;
    names_first?: string;
    names_last?: string;
}

interface UserContextType {
    user: UserProfile | null;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    submitVerification: (formData: FormData) => Promise<any>;
    submitKyc: (formData: FormData) => Promise<any>;
    updateProfile: (data: Record<string, any>) => Promise<any>;
    getProfileImage: (userId: string) => Promise<string | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}

const supabase = createClient();

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isFetching = useRef(false);

    const fetchProfile = useCallback(async (session: any) => {
        if (!session?.user?.id || isFetching.current) return;

        try {
            isFetching.current = true;
            setError(null);
            // No seteamos loading(true) aquí para no bloquear la interfaz si ya está cargando algo

            console.log(`📡 [UserContext] Intentando obtener perfil para ${session.user.id}...`);

            // Usamos un timeout manual o una carrera para que no se cuelgue infinito
            const profilePromise = supabase
                .from("profiles")
                .select("id, user_id, email, names_first, names_last")
                .eq("user_id", session.user.id)
                .single();

            const { data, error: profileError } = await profilePromise;

            if (profileError) {
                console.warn("⚠️ [UserContext] Perfil no encontrado en 'public', continuando sin perfil extendido.");
            } else {
                console.log("✅ [UserContext] Perfil cargado.");
                setUser(data);
            }
        } catch (err: any) {
            console.error("❌ [UserContext] Error en fetchProfile:", err.message);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session && mounted) {
                    await fetchProfile(session);
                } else {
                    if (mounted) setLoading(false);
                }
            } catch (err) {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("🔔 [UserContext] Evento:", event);
            if (session && mounted) fetchProfile(session);
            else if (!session && mounted) {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    return (
        <UserContext.Provider value={{
            user,
            loading,
            error,
            refreshUser: async () => { },
            submitVerification: async () => { },
            submitKyc: async () => { },
            updateProfile: async () => { },
            getProfileImage: async () => null
        }}>
            {children}
        </UserContext.Provider>
    );
}
