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
        if (!session || isFetching.current) return;

        try {
            isFetching.current = true;
            setError(null);
            setLoading(true);

            console.log(" [1/2] Consultando tabla 'profiles' en DB...");
            const { data, error: profileError } = await supabase
                .from("profiles")
                .select("id, user_id, email, names_first, names_last")
                .eq("user_id", session.user.id)
                .single();

            if (profileError) {
                console.error("❌ Error en DB query:", profileError);
                throw profileError;
            }

            console.log("✅ [2/2] Perfil obtenido de DB.");
            setUser(data);
        } catch (err: any) {
            console.error("❌ Error fatal en fetchProfile:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, []);

    const refreshUser = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) await fetchProfile(session);
        else setLoading(false);
    }, [fetchProfile]);

    useEffect(() => {
        const initAuth = async () => {
            console.log("🚀 Iniciando sistema de Autenticación...");
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('session_token');

                if (token) {
                    console.log("🎁 Token encontrado en URL, configurando sesión...");
                    await supabase.auth.setSession({ access_token: token, refresh_token: '' });
                    window.history.replaceState({}, '', window.location.pathname);
                }

                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await fetchProfile(session);
                } else {
                    console.log("ℹ️ No se encontró sesión activa.");
                    setLoading(false);
                }
            } catch (err) {
                console.error("❌ Error en initAuth:", err);
                setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("🔔 Cambio de estado Auth:", event);
                if (session && event !== 'INITIAL_SESSION') {
                    await fetchProfile(session);
                } else if (!session) {
                    setUser(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const getAuthHeader = async () => ({ Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` });

    const submitVerification = async (formData: FormData) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile/verification`, { method: "POST", headers: await getAuthHeader(), body: formData });
        if (!response.ok) throw new Error("Error en verificación");
        await refreshUser();
    };

    const submitKyc = async (formData: FormData) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile/kyc`, { method: "POST", headers: await getAuthHeader(), body: formData });
        if (!response.ok) throw new Error("Error en KYC");
        await refreshUser();
    };

    const updateProfile = async (updateData: Record<string, any>) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile`, {
            method: "PATCH",
            headers: { ...(await getAuthHeader()), "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        });
        if (!response.ok) throw new Error("Error actualizando perfil");
        await refreshUser();
    };

    return (
        <UserContext.Provider value={{ user, loading, error, refreshUser, submitVerification, submitKyc, updateProfile, getProfileImage: async () => null }}>
            {children}
        </UserContext.Provider>
    );
}
