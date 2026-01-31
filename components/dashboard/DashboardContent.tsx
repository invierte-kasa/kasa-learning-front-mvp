'use client'

import { MainNav } from '@/components/layout/MainNav'
import { Header } from '@/components/layout/Header'
import { WelcomeSection, StatsGrid, LearningCard, LockedSection } from '@/components/dashboard'
import { cn } from '@/lib/utils'
import { UserStats } from '@/types'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

interface DashboardContentProps {
    showDashboard: boolean
    userName: string
    mockStats: UserStats
    lockedItems: any[]
}

export function DashboardContent({ showDashboard, userName, mockStats, lockedItems }: DashboardContentProps) {
    const [navVisible, setNavVisible] = useState(false)
    const [contentVisible, setContentVisible] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [isExitingPage, setIsExitingPage] = useState(false)
    const router = useRouter()

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

        // Secuencia de salida escalonada (0.3s entre cada bloque)
        setTimeout(() => {
            router.push(href)
        }, 1100)
    }

    return (
        <div className={cn(
            "bg-[#101a28] flex flex-col min-h-screen lg:flex-row overflow-hidden",
            !showDashboard ? "hidden" : "flex"
        )}>
            {/* Sidebar / Main Nav - Se mantiene fijo durante la navegación */}
            <div className="lg:w-[260px] lg:flex-shrink-0">
                <motion.div
                    initial={isMobile ? { y: '100%', opacity: 0 } : { x: '-100%', opacity: 0 }}
                    animate={navVisible
                        ? (isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 })
                        : (isMobile ? { y: '100%', opacity: 0 } : { x: '-100%', opacity: 0 })
                    }
                    transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 13,
                        mass: 1,
                        bounce: 0.7
                    }}
                    className={cn(
                        "z-50",
                        isMobile && "fixed bottom-0 left-0 w-full"
                    )}
                >
                    <MainNav onNavItemClick={handleNavItemClick} />
                </motion.div>
            </div>

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
                                    weeklyProgress={mockStats.weeklyProgress}
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
                                <StatsGrid stats={mockStats} />
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
                                    <LearningCard
                                        moduleNumber={4}
                                        title="Fundamentos de Valuación de Propiedades"
                                        progress={85}
                                        href="/sections"
                                    />
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
                                    <LockedSection items={lockedItems} />
                                </div>
                            </motion.div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    )
}
