'use client'

import { MainNav } from '@/components/layout/MainNav'
import { Header } from '@/components/layout/Header'
import { WelcomeSection, StatsGrid, LearningCard, LockedSection } from '@/components/dashboard'
import { cn } from '@/lib/utils'
import { UserStats } from '@/types'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/context/UserContext'

interface DashboardContentProps {
    showDashboard: boolean
    userName: string
    userStats: UserStats
}

// Tipo para el módulo activo del usuario
interface ActiveModuleData {
    id: string
    title: string
    module_number: number
    section_id: string
}

// Tipo para las secciones bloqueadas
interface LockedSectionData {
    title: string
    subtitle: string
    icon: 'chart' | 'credit-card'
    href: string
}

const supabase = createClient()

export function DashboardContent({ showDashboard, userName, userStats }: DashboardContentProps) {
    const [navVisible, setNavVisible] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isExitingPage, setIsExitingPage] = useState(false)
    const router = useRouter()
    const { user } = useUser()

    // Estado para datos reales
    const [activeModule, setActiveModule] = useState<ActiveModuleData | null>(null)
    const [moduleProgress, setModuleProgress] = useState(0)
    const [lockedItems, setLockedItems] = useState<LockedSectionData[]>([])
    const [dataLoaded, setDataLoaded] = useState(false)

    // Fetch de datos reales del dashboard
    useEffect(() => {
        if (!user?.user_id) return

        const fetchDashboardData = async () => {
            try {
                // 1. Obtener el progreso de módulos del usuario
                const { data: userProgress } = await supabase
                    .schema('kasa_learn_journey')
                    .from('user_module_progress')
                    .select('module_id, status, xp_earned')
                    .eq('user_id', user.user_id)

                const completedModuleIds = new Set(
                    (userProgress || [])
                        .filter((p: any) => p.status === 'completed')
                        .map((p: any) => p.module_id)
                )

                // 2. Obtener todos los módulos con su sección
                const { data: allModules } = await supabase
                    .schema('kasa_learn_journey')
                    .from('module')
                    .select('id, title, module_number, section_id, xp')
                    .order('module_number', { ascending: true })

                if (allModules && allModules.length > 0) {
                    // Encontrar el primer módulo no completado (el módulo activo)
                    const nextModule = allModules.find(
                        (m: any) => !completedModuleIds.has(m.id)
                    )

                    if (nextModule) {
                        setActiveModule(nextModule)
                        // Calcular progreso: módulos completados / total módulos * 100
                        const totalModules = allModules.length
                        const completedCount = completedModuleIds.size
                        setModuleProgress(
                            totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0
                        )
                    }

                    // 3. Obtener secciones para los módulos bloqueados
                    const { data: sections } = await supabase
                        .schema('kasa_learn_journey')
                        .from('section')
                        .select('id, title')

                    // Crear items bloqueados con las secciones que tienen módulos no completados
                    if (sections && sections.length > 0) {
                        const sectionMap = new Map(sections.map((s: any) => [s.id, s.title]))

                        // Obtener secciones con módulos bloqueados (los siguientes al módulo activo)
                        const activeModuleIndex = allModules.findIndex(
                            (m: any) => !completedModuleIds.has(m.id)
                        )

                        // Los módulos después del activo son los "bloqueados"
                        const futureModules = allModules.slice(activeModuleIndex + 1)
                        const futureSectionIds = [...new Set(futureModules.map((m: any) => m.section_id))]

                        const locked: LockedSectionData[] = futureSectionIds
                            .slice(0, 3) // Máximo 3 items bloqueados
                            .map((sectionId, index) => ({
                                title: sectionMap.get(sectionId) || 'Sección Avanzada',
                                subtitle: `Bloqueado - Completa módulos previos`,
                                icon: index % 2 === 0 ? 'chart' as const : 'credit-card' as const,
                                href: '/sections',
                            }))

                        setLockedItems(locked)
                    }
                }
            } catch (err) {
                console.error('[DashboardContent] Error fetching dashboard data:', err)
            } finally {
                setDataLoaded(true)
            }
        }

        fetchDashboardData()
    }, [user?.user_id])

    useEffect(() => {
        // Detectar si es móvil para cambiar la dirección de la animación
        const checkMobile = () => setIsMobile(window.innerWidth < 1024)
        checkMobile()
        window.addEventListener('resize', checkMobile)

        if (showDashboard && !isExitingPage) {
            const navTimer = setTimeout(() => setNavVisible(true), 500)
            const contentTimer = setTimeout(() => setContentVisible(true), 1000)
            return () => {
                clearTimeout(navTimer)
                clearTimeout(contentTimer)
                window.removeEventListener('resize', checkMobile)
            }
        }
        return () => window.removeEventListener('resize', checkMobile)
    }, [showDashboard, isExitingPage])

    const handleNavItemClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        // Only trigger for routes other than the current one (optional, but good)
        e.preventDefault()
        if (isExitingPage) return

        setIsExitingPage(true)

        // Secuencia de salida: última animación termina en ~1.1s (delay 0.6s + duration estimada)
        // Esperamos 0.3s adicionales = 1.4s total
        setTimeout(() => {
            router.push(href)
        }, 1400)
    }

    return (
        <>
            {/* Mobile navbar - Fixed at root level */}
            {isMobile && (
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={navVisible ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 13,
                        mass: 1,
                        bounce: 0.7
                    }}
                    className="fixed bottom-0 left-0 w-full z-[100]"
                >
                    <MainNav onNavItemClick={handleNavItemClick} />
                </motion.div>
            )}

            <div className={cn(
                "bg-[#101a28] flex flex-col min-h-screen lg:flex-row overflow-hidden",
                !showDashboard ? "hidden" : "flex"
            )}>
                {/* Desktop Sidebar */}
                {!isMobile && (
                    <div className="lg:w-[260px] lg:flex-shrink-0">
                        <motion.div
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={navVisible ? { x: 0, opacity: 1 } : { x: '-100%', opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 180,
                                damping: 13,
                                mass: 1,
                                bounce: 0.7
                            }}
                        >
                            <MainNav onNavItemClick={handleNavItemClick} />
                        </motion.div>
                    </div>
                )}

                <main className={cn(
                    "flex-1 bg-[#101a28] text-slate-50 flex flex-col",
                    "lg:rounded-tl-[40px]",
                    "relative"
                )}>
                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 pb-[calc(80px+2rem)] lg:pb-10">
                        <div className="max-w-[1200px] mx-auto space-y-8 lg:space-y-12">

                            {/* Header con animación escalonada */}
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={isExitingPage
                                    ? { y: -100, opacity: 0 }
                                    : (showDashboard ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 })
                                }
                                transition={{
                                    duration: 0.5,
                                    delay: isExitingPage ? 0.3 : 0.15
                                }}
                            >
                                <Header userName={userName} />
                            </motion.div>

                            {/* Stats & Welcome con entrada estilo "Salto desde abajo" */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                <motion.div
                                    className="lg:col-span-8"
                                    initial={{ y: '100%', opacity: 0 }}
                                    animate={isExitingPage
                                        ? { y: -100, opacity: 0 }
                                        : (contentVisible ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 })
                                    }
                                    transition={{
                                        type: "spring",
                                        stiffness: 180,
                                        damping: 13,
                                        mass: 1,
                                        bounce: 0.6,
                                        delay: isExitingPage ? 0.6 : 0.1
                                    }}
                                >
                                    <WelcomeSection
                                        userName={userName}
                                        weeklyProgress={userStats.weeklyProgress}
                                    />
                                </motion.div>

                                <motion.div
                                    className="lg:col-span-4"
                                    initial={{ y: '100%', opacity: 0 }}
                                    animate={isExitingPage
                                        ? { y: -100, opacity: 0 }
                                        : (contentVisible ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 })
                                    }
                                    transition={{
                                        type: "spring",
                                        stiffness: 180,
                                        damping: 13,
                                        mass: 1,
                                        bounce: 0.6,
                                        delay: isExitingPage ? 0.6 : 0.2
                                    }}
                                >
                                    <StatsGrid stats={userStats} />
                                </motion.div>
                            </div>

                            {/* Learning Roadmap Area */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                <motion.div
                                    className="lg:col-span-8"
                                    initial={{ y: '100%', opacity: 0 }}
                                    animate={isExitingPage
                                        ? { y: '100%', opacity: 0 }
                                        : (contentVisible ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 })
                                    }
                                    transition={{
                                        type: "spring",
                                        stiffness: 180,
                                        damping: 13,
                                        mass: 1,
                                        bounce: 0.6,
                                        delay: isExitingPage ? 0 : 0.3
                                    }}
                                >
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-[#10B981] rounded-full inline-block"></span>
                                            Tu Siguiente Módulo
                                        </h3>
                                        {activeModule ? (
                                            <LearningCard
                                                moduleNumber={activeModule.module_number}
                                                title={activeModule.title}
                                                progress={moduleProgress}
                                                href={`/sections/${activeModule.section_id}`}
                                            />
                                        ) : dataLoaded ? (
                                            <div className="bg-kasa-card border border-kasa-border rounded-2xl p-8 text-center">
                                                <p className="text-kasa-primary font-bold text-lg mb-2">🎉 ¡Felicidades!</p>
                                                <p className="text-text-muted">Has completado todos los módulos disponibles.</p>
                                            </div>
                                        ) : (
                                            <div className="h-[200px] bg-kasa-card/50 animate-pulse rounded-2xl border border-kasa-border" />
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="lg:col-span-4"
                                    initial={{ y: '100%', opacity: 0 }}
                                    animate={isExitingPage
                                        ? { y: '100%', opacity: 0 }
                                        : (contentVisible ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 })
                                    }
                                    transition={{
                                        type: "spring",
                                        stiffness: 180,
                                        damping: 13,
                                        mass: 1,
                                        bounce: 0.6,
                                        delay: isExitingPage ? 0 : 0.4
                                    }}
                                >
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-slate-200">Próximas Metas</h3>
                                        {lockedItems.length > 0 ? (
                                            <LockedSection items={lockedItems} />
                                        ) : dataLoaded ? (
                                            <div className="bg-kasa-card border border-kasa-border rounded-2xl p-6 text-center">
                                                <p className="text-text-muted text-sm">No hay más secciones bloqueadas.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="h-[72px] bg-kasa-card/50 animate-pulse rounded-2xl border border-kasa-border" />
                                                <div className="h-[72px] bg-kasa-card/50 animate-pulse rounded-2xl border border-kasa-border" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
