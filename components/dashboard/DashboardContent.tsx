'use client'

import { MainNav } from '@/components/layout/MainNav'
import { Header } from '@/components/layout/Header'
import { WelcomeSection, StatsGrid, LearningCard, LockedSection } from '@/components/dashboard'
import { cn } from '@/lib/utils'
import { UserStats } from '@/types'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/context/UserContext'

interface DashboardContentProps {
    showDashboard: boolean
    userName: string
    userStats: UserStats
    avatarUrl: string
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

export function DashboardContent({ showDashboard, userName, userStats, avatarUrl }: DashboardContentProps) {
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
        if (!user?.id) return

        const fetchDashboardData = async () => {
            try {
                // 1. Consultar la tabla progress para la progresión actual del usuario
                const { data: userProgress, error: progressError } = await supabase
                    .schema('kasa_learn_journey')
                    .from('progress')
                    .select('current_module, current_section, module_percentage_completion')
                    .eq('user_id', user.id)
                    .maybeSingle()

                let moduleId: string | null = null
                let sectionId: string | null = null

                if (userProgress) {
                    moduleId = userProgress.current_module
                    sectionId = userProgress.current_section
                    setModuleProgress(Number(userProgress.module_percentage_completion) || 0)
                }

                // Si no hay progreso o faltan datos, buscamos el primer módulo de la primera sección
                if (!moduleId || !sectionId) {
                    const { data: firstSection } = await supabase
                        .schema('kasa_learn_journey')
                        .from('section')
                        .select('id')
                        .order('level', { ascending: true })
                        .limit(1)
                        .maybeSingle()

                    if (firstSection) {
                        sectionId = firstSection.id
                        const { data: firstModule } = await supabase
                            .schema('kasa_learn_journey')
                            .from('module')
                            .select('id')
                            .eq('section_id', sectionId)
                            .order('module_number', { ascending: true })
                            .limit(1)
                            .maybeSingle()

                        if (firstModule) {
                            moduleId = firstModule.id
                        }
                    }
                }

                if (moduleId && sectionId) {
                    // Obtener detalles del módulo activo
                    const { data: moduleData } = await supabase
                        .schema('kasa_learn_journey')
                        .from('module')
                        .select('id, title, module_number, section_id')
                        .eq('id', moduleId)
                        .maybeSingle()

                    if (moduleData) {
                        setActiveModule(moduleData)
                    }

                    // Obtener todos los módulos de la SECCIÓN ACTUAL para mostrar los bloqueados
                    const { data: sectionModules } = await supabase
                        .schema('kasa_learn_journey')
                        .from('module')
                        .select('id, title, module_number')
                        .eq('section_id', sectionId)
                        .order('module_number', { ascending: true })

                    if (sectionModules && moduleData) {
                        // Los módulos bloqueados son los de la misma sección que tienen un número mayor al actual
                        const locked: LockedSectionData[] = sectionModules
                            .filter(m => m.module_number > moduleData.module_number)
                            .map((m, index) => ({
                                title: m.title,
                                subtitle: 'Módulo bloqueado',
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
                "bg-transparent flex flex-col min-h-screen lg:flex-row overflow-hidden",
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
                    "flex-1 bg-transparent text-slate-50 flex flex-col",
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
                                <Header userName={userName} userAvatar={avatarUrl} />
                            </motion.div>

                            {/* Welcome Section */}
                            <motion.div
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

                            {/* Stats Grid */}
                            <motion.div
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

                            {/* Learning Roadmap Area */}
                            <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-8 items-start lg:gap-8">
                                <motion.div
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
