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
                // 1. Public profiles
                supabase
                    .from("profiles")
                    .select("id, user_id, email, names_first, names_last")
                    .eq("user_id", userId)
                    .single(),

                // 2. Learn journey user data
                supabase
                    .schema('kasa_learn_journey')
                    .from('user')
                    .select('current_level, xp, streak, profile_url, current_module, display_name, created_at')
                    .eq('user_id', userId)
                    .single(),

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

            if (publicRes.error) console.warn("⚠️ [UserContext] Perfil público no encontrado.");
            if (learnRes.error) console.warn("⚠️ [UserContext] Perfil de aprendizaje no encontrado.");

            const combinedUser: UserProfile = {
                ...(publicRes.data || { id: 0, user_id: userId, email: session.user.email }),
                ...learnRes.data,
                modules_completed: completedRes.count || 0,
                total_modules: totalRes.count || 0
            };

            console.log("✅ [UserContext] Perfil cargado:", combinedUser);
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
            },
            submitVerification: async () => { },
            submitKyc: async () => { },
            updateProfile: async () => { },
            getProfileImage: async () => null
        }}>
            {children}
        </UserContext.Provider>
    );
}
