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
    user_id: string;
    email: string;
    names_first?: string;
    names_last?: string;
    url_profile?: string;
    // Kasa Learn Journey data
    current_level?: number;
    xp?: number;
    streak?: number;
    profile_url?: string;
    current_module?: string;
    display_name?: string;
    created_at?: string;
    // Stats
    modules_completed?: number;
    total_modules?: number;
}

interface UserContextType {
    user: UserProfile | null;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
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
    const lastUserId = useRef<string | null>(null);

    const fetchProfile = useCallback(async (session: any) => {
        const userId = session?.user?.id;

        // Prevent redundant fetches
        if (!userId || isFetching.current || (user && lastUserId.current === userId)) {
            if (userId && loading) setLoading(false);
            return;
        }

        try {
            isFetching.current = true;
            setError(null);
            lastUserId.current = userId;

            console.log(`📡 [UserContext] Intentando obtener perfil para ${userId}...`);

            // Use Promise.all to fetch everything in parallel and reduce total request time
            const [publicRes, learnRes, completedRes, totalRes] = await Promise.all([
                // 1. User profile data - Seleccionamos todo (*) para verificar nombres de columnas
                supabase
                    .from("profiles")
                    .select("*")
                    .eq("user_id", userId)
                    .maybeSingle(),

                // 2. Learn journey user data
                supabase
                    .schema('kasa_learn_journey')
                    .from('user')
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle(),

                // 3. Modules completed (Count)
                supabase
                    .schema('kasa_learn_journey')
                    .from('user_module_progress')
                    .select('id', { count: 'exact' })
                    .eq('user_id', userId)
                    .eq('status', 'completed'),

                // 4. Total modules (Count)
                supabase
                    .schema('kasa_learn_journey')
                    .from('module')
                    .select('id', { count: 'exact' })
            ]);

            console.log("🔍 [UserContext] Debug Profiles:", { data: publicRes.data, error: publicRes.error });
            console.log("🔍 [UserContext] Debug Learn:", { data: learnRes.data, error: learnRes.error });

            if (publicRes.error) {
                console.warn("⚠️ [UserContext] Perfil (profile schema) no encontrado:", publicRes.error.message);
            }
            if (learnRes.error) {
                console.warn("⚠️ [UserContext] Perfil (kasa_learn_journey) no encontrado:", learnRes.error.message);
            }

            // Construir el objeto con valores por defecto para que nunca lleguen undefined a la UI
            const combinedUser: UserProfile = {
                // Datos base (siempre presentes en la sesión de Supabase Auth)
                user_id: userId,
                email: session.user.email || publicRes.data?.email || '',

                // Datos de perfil (Usa url_profile de la tabla profiles como prioridad)
                names_first: publicRes.data?.names_first || '',
                url_profile: publicRes.data?.url_profile || learnRes.data?.profile_url || '',

                // Gamificación: Valores por defecto si no existen en la DB
                current_level: learnRes.data?.current_level || 1,
                xp: learnRes.data?.xp || 0,
                streak: learnRes.data?.streak || 0,
                display_name: publicRes.data?.names_first || learnRes.data?.display_name || '',
                created_at: learnRes.data?.created_at || new Date().toISOString(),

                // Mezclar datos de la base de datos (sobrescriben los defaults si existen)
                ...(learnRes.data || {}),


                // Estadísticas
                modules_completed: completedRes.count || 0,
                total_modules: totalRes.count || 0
            };

            console.log("✅ [UserContext] Perfil cargado exitosamente:", combinedUser);
            setUser(combinedUser);
        } catch (err: any) {
            console.error("❌ [UserContext] Error en fetchProfile:", err.message);
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [user, loading]);

    useEffect(() => {
        let mounted = true;

        // No individual initAuth needed, onAuthStateChange fires with initial session
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("🔔 [UserContext] Auth Event:", event);
            if (!mounted) return;

            if (session) {
                fetchProfile(session);
            } else {
                setUser(null);
                lastUserId.current = null;
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
            refreshUser: async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) await fetchProfile(session);
            }
        }}>
            {children}
        </UserContext.Provider>
    );
}
