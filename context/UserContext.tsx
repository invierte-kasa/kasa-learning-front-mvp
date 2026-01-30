"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { createClient } from "@/utils/supabase/client";

export type VerificationStatus =
    | "verified_main_data"
    | "rejected_main_data"
    | "sent_main_data"
    | "sent_transfer_data"
    | "rejected_transfer_data"
    | "not_verified"
    | "verified";

export interface UserProfile {
    id: number;
    user_id: string;
    email: string;
    is_verified: VerificationStatus;
    incomplete_data: boolean;
    rejected_reason?: string | null;
    avatar_url?: string | null;
    names_first?: string;
    names_last?: string;
    [key: string]: any;
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

    const getProfileImage = useCallback(async (userId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) return null;

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-profile-image?userId=${userId}`,
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            if (!response.ok) return null;
            const data = await response.json();
            return data.avatar_url;
        } catch (err) {
            return null;
        }
    }, []);

    const fetchProfile = useCallback(async (session: any) => {
        if (!session) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            setError(null);
            console.log("🔄 UserProvider: Obteniendo perfil...");

            const { data, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("user_id", session.user.id)
                .single();

            if (profileError) throw profileError;

            const avatarUrl = await getProfileImage(session.user.id);
            if (avatarUrl) data.avatar_url = avatarUrl;

            setUser(data);
            console.log("✅ UserProvider: Perfil cargado.");
        } catch (err: any) {
            console.error("❌ UserProvider: Error cargando perfil:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getProfileImage]);

    const refreshUser = useCallback(async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        await fetchProfile(session);
    }, [fetchProfile]);

    useEffect(() => {
        const initAuth = async () => {
            console.log("🚀 UserProvider: Inicializando auth...");
            try {
                // 1. Manejar el fallback de URL
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('session_token');

                if (token) {
                    console.log("🎁 UserProvider: Usando token de URL...");
                    await supabase.auth.setSession({ access_token: token, refresh_token: '' });
                    window.history.replaceState({}, '', window.location.pathname);
                }

                // 2. Obtener sesión actual (esto disparará el listener si cambia)
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await fetchProfile(session);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("❌ UserProvider: Error en inicialización:", err);
                setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("🔔 UserProvider: Evento Auth:", event);
                if (session) {
                    await fetchProfile(session);
                } else {
                    setUser(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    // Métodos de utilidad (KYC, Perfil, etc)
    const getAuthHeader = async () => ({ Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` });

    const submitVerification = async (formData: FormData) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile/verification`, { method: "POST", headers: await getAuthHeader(), body: formData });
        if (!response.ok) throw new Error("Error en verificación");
        return await refreshUser();
    };

    const submitKyc = async (formData: FormData) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile/kyc`, { method: "POST", headers: await getAuthHeader(), body: formData });
        if (!response.ok) throw new Error("Error en KYC");
        return await refreshUser();
    };

    const updateProfile = async (updateData: Record<string, any>) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile`, {
            method: "PATCH",
            headers: { ...(await getAuthHeader()), "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        });
        if (!response.ok) throw new Error("Error actualizando perfil");
        return await refreshUser();
    };

    return (
        <UserContext.Provider value={{ user, loading, error, refreshUser, submitVerification, submitKyc, updateProfile, getProfileImage }}>
            {children}
        </UserContext.Provider>
    );
}
