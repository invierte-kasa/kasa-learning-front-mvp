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
    id?: string; // Kasa Learn Journey internal ID
    email: string;
    names_first?: string;
    names_last?: string;
    url_profile?: string;
    // Kasa Learn Journey data
    current_level?: number;
    xp?: number;
    streak?: number;
    current_module?: string;
    current_section?: string;
    display_name?: string;
    created_at?: string;

    // Progress stats from 'progress' table
    module_percentage_completed?: number;
    section_percentage_completed?: number;

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

    // Refs to control flow and prevent loops
    const isFetching = useRef(false);
    const lastFetchUserId = useRef<string | null>(null);
    const lastEventTime = useRef<number>(0);
    const retryCount = useRef(0);
    const streakUpdatedForSession = useRef(false);

    const fetchProfile = useCallback(async (session: any) => {
        const authUserId = session?.user?.id;
        if (!authUserId) {
            setLoading(false);
            return;
        }

        // Lock to prevent concurrent fetches
        if (isFetching.current) return;

        try {
            isFetching.current = true;
            setError(null);

            console.log(`📡 [UserContext] Iniciando fetch de perfil para ${authUserId}...`);

            // 1. First stage: Base profiles and Learn journey user + Total modules count
            // We use maybeSingle to avoid errors if rows don't exist
            const [publicRes, learnRes, totalRes] = await Promise.all([
                supabase.from("profiles").select("*").eq("user_id", authUserId).maybeSingle(),
                supabase.schema('kasa_learn_journey').from('user').select('*').eq('user_id', authUserId).maybeSingle(),
                supabase.schema('kasa_learn_journey').from('module').select('id', { count: 'exact' })
            ]);

            const learnData = learnRes.data;
            if (!learnData && !learnRes.error) {
                console.warn("⚠️ [UserContext] Perfil de aprendizaje no encontrado en DB.");
            }

            // 2. Second stage: Fetch stats using Internal ID
            let progressData = null;
            let completedModulesCount = 0;

            if (learnData?.id) {
                const [progRes, modProgRes] = await Promise.all([
                    supabase.schema('kasa_learn_journey').from('progress').select('*').eq('user_id', learnData.id).maybeSingle(),
                    supabase.schema('kasa_learn_journey').from('user_module_progress')
                        .select('id', { count: 'exact' })
                        .eq('user_id', learnData.id)
                        .eq('status', 'completed')
                ]);

                progressData = progRes.data;
                completedModulesCount = modProgRes.count || 0;
            }

            // 3. Consolidate to local state
            const combinedUser: UserProfile = {
                user_id: authUserId,
                id: learnData?.id,
                email: session.user.email || publicRes.data?.email || '',
                names_first: publicRes.data?.names_first || '',
                names_last: publicRes.data?.names_last || '',
                url_profile: publicRes.data?.url_profile || '',
                display_name: publicRes.data?.names_first || learnData?.display_name || 'Estudiante',
                current_level: learnData?.current_level || 1,
                xp: learnData?.xp || 0,
                streak: learnData?.streak || 0,
                created_at: learnData?.created_at || new Date().toISOString(),
                current_module: progressData?.current_module || learnData?.current_module || undefined,
                current_section: progressData?.current_section || undefined,
                module_percentage_completed: Number(progressData?.module_percentage_completed) || 0,
                section_percentage_completed: Number(progressData?.section_percentage_completed) || 0,
                modules_completed: completedModulesCount,
                total_modules: totalRes.count || 0
            };

            console.log("✅ [UserContext] Perfil cargado:", combinedUser);
            setUser(combinedUser);
            lastFetchUserId.current = authUserId;
            retryCount.current = 0;

            // Fire-and-forget: actualizar streak una sola vez por sesión
            if (!streakUpdatedForSession.current) {
                streakUpdatedForSession.current = true;
                Promise.resolve(
                    supabase.schema('kasa_learn_journey').rpc('update_user_streak')
                ).then(({ data, error: rpcError }) => {
                    if (rpcError || !data) {
                        console.warn('🔥 [UserContext] Streak RPC falló (silencioso):', rpcError?.message);
                        return;
                    }
                    console.log(`🔥 [UserContext] Streak actualizado: ${data.streak} (updated: ${data.updated})`);
                    if (data.streak !== combinedUser.streak) {
                        setUser(prev => prev ? { ...prev, streak: data.streak } : prev);
                    }
                }).catch(() => {
                    // Silenciar cualquier error — no afectar la UX
                });
            }
        } catch (err: any) {
            console.error("❌ [UserContext] Error cargando perfil:", err.message);
            // Si hay error de rate limit, aumentamos cooldown
            if (err.message.includes('429')) {
                lastEventTime.current = Date.now() + 5000; // Bloquea por 5 extra segundos
            }
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            const now = Date.now();

            // 1. Cooldown Protection
            if (now < lastEventTime.current) {
                return;
            }

            // 2. Event Filtering
            // Solo nos interesan eventos reales de sesión. 
            // Ignoramos SIGNED_OUT si session es false y ya estamos en null (evita bucles de error)
            if (!session) {
                if (user) {
                    console.log(`🔔 [UserContext] Limpiando sesión (Event: ${event})`);
                    setUser(null);
                }
                // No limpiamos lastFetchUserId.current aquí para evitar bucles de refresh infinito
                setLoading(false);
                return;
            }

            // 3. Logic: Only fetch if the user ID changed or it's a critical entry event
            const sessionUserId = session.user.id;
            const isNewUser = lastFetchUserId.current !== sessionUserId;
            const isEntryEvent = event === 'SIGNED_IN' || event === 'INITIAL_SESSION';

            if (isNewUser || (isEntryEvent && !user)) {
                console.log(`🔔 [UserContext] Evento Auth: ${event} | Cargando datos...`);
                lastEventTime.current = now + 1000; // Throttling
                fetchProfile(session);
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
