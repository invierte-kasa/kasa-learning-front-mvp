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

// Tipos basados en la documentación del endpoint
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
    document_type?: string;
    document_number?: string;
    phone?: string;
    gender?: string;
    nationality?: string;
    address?: string;
    country?: string;
    province?: string;
    district?: string;
    birthdate?: string;
    cci?: string;
    account_number?: string;
    banco?: string;
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

    const getAuthHeader = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : null;
    };

    const getProfileImage = useCallback(async (userId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return null;

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-profile-image?userId=${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) return null;
            const data = await response.json();
            return data.avatar_url;
        } catch (err) {
            console.error("Error in getProfileImage:", err);
            return null;
        }
    }, []);

    const refreshUser = useCallback(async () => {
        console.log("🔄 refreshUser: Iniciando...");
        try {
            setLoading(true);
            setError(null);

            console.log("🔄 refreshUser: Obteniendo sesión de Supabase...");
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("❌ refreshUser: Error en getSession:", sessionError);
            }

            if (!session) {
                console.log("ℹ️ refreshUser: No hay sesión activa.");
                setUser(null);
                setLoading(false);
                return;
            }

            console.log("✅ refreshUser: Sesión encontrada para:", session.user.email);
            const headers = { Authorization: `Bearer ${session.access_token}` };

            console.log("🔄 refreshUser: Llamando a Edge Function /profile...");
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile`,
                { headers }
            );

            if (!response.ok) {
                console.error("❌ refreshUser: Error en API profile:", response.status, response.statusText);
                throw new Error(`Error fetching profile: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("✅ refreshUser: Datos recibidos:", data);

            const avatarUrl = await getProfileImage(session.user.id);
            if (avatarUrl) {
                data.avatar_url = avatarUrl;
            }

            setUser(data);
        } catch (err: any) {
            console.error("❌ refreshUser: Excepción capturada:", err);
            setError(err.message || "Error cargando perfil");
            setUser(null);
        } finally {
            console.log("🏁 refreshUser: Finalizado, setLoading(false)");
            setLoading(false);
        }
    }, [getProfileImage]);

    const submitVerification = async (formData: FormData) => {
        const headers = await getAuthHeader();
        if (!headers) throw new Error("No authenticated session");
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile/verification`, { method: "POST", headers, body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || data.message || "Error submitting verification");
        await refreshUser();
        return data;
    };

    const submitKyc = async (formData: FormData) => {
        const headers = await getAuthHeader();
        if (!headers) throw new Error("No authenticated session");
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile/kyc`, { method: "POST", headers, body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || data.message || "Error submitting KYC");
        await refreshUser();
        return data;
    };

    const updateProfile = async (updateData: Record<string, any>) => {
        const headers = await getAuthHeader();
        if (!headers) throw new Error("No authenticated session");
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/profile`, { method: "PATCH", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(updateData) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || data.message || "Error updating profile");
        await refreshUser();
        return data;
    };

    useEffect(() => {
        const handleAuthFallback = async () => {
            console.log("🚀 handleAuthFallback: Iniciando...");
            if (typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('session_token');

                if (token) {
                    console.log("🎁 handleAuthFallback: session_token detectado en URL.");
                    await supabase.auth.setSession({ access_token: token, refresh_token: '' });
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                }
            }
            await refreshUser();
        };

        handleAuthFallback();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("🔔 AuthStateChange detectado:", event);
                if (session) {
                    await refreshUser();
                } else {
                    setUser(null);
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [refreshUser]);

    return (
        <UserContext.Provider value={{ user, loading, error, refreshUser, submitVerification, submitKyc, updateProfile, getProfileImage }}>
            {children}
        </UserContext.Provider>
    );
}
