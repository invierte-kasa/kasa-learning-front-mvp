'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { MainNav } from '@/components/layout/MainNav'
import { ModuleCard } from '@/components/dashboard/ModuleCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Module } from '@/types'
import { useUser } from '@/context/UserContext'

// Back arrow icon
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
)

interface SectionData {
    id: string
    title: string
    topic: string
}

interface ModuleData {
    id: string
    section_id: string
    title: string
    xp: number
    estimated_time_in_minutes: number
    module_number: number
}

function SectionDetailContent() {
    const { user: appUser, loading: userLoading } = useUser()
    const [sectionData, setSectionData] = useState<SectionData | null>(null)
    const [modules, setModules] = useState<Module[]>([])
    const [loading, setLoading] = useState(true)
    const [shouldAnimate, setShouldAnimate] = useState(false)
    const [isExitingPage, setIsExitingPage] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const params = useParams()
    const router = useRouter()
    const sectionId = params.id as string
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            if (!sectionId || !appUser || userLoading) return

            try {
                console.log(`🚀 [SectionDetail] GET directo para sección: ${sectionId}`)
                setLoading(true)
                setError(null)

                const internalId = appUser.id
                if (!internalId) {
                    // Si no hay ID interno, significa que la creación en UserContext falló (probablemente RLS)
                    throw new Error("No se pudo obtener tu perfil de aprendizaje. Verifica las políticas de seguridad (RLS).")
                }

                // 3. Fetch section info
                const { data: section, error: sectionError } = await supabase
                    .schema('kasa_learn_journey')
                    .from('section')
                    .select('*')
                    .eq('id', sectionId)
                    .single()

                if (sectionError) throw sectionError
                setSectionData(section)

                // 3. Inicializar progreso de sección si es la primera vez
                const { data: sectionProgress } = await supabase
                    .schema('kasa_learn_journey')
                    .from('user_section_progress')
                    .select('*')
                    .eq('user_id', internalId)
                    .eq('section_id', sectionId)
                    .maybeSingle()

                if (!sectionProgress) {
                    console.log("🏁 [SectionDetail] Inicializando progreso de sección")
                    // Primera vez entrando a esta sección
                    await supabase
                        .schema('kasa_learn_journey')
                        .from('user_section_progress')
                        .insert({
                            user_id: internalId,
                            section_id: sectionId,
                            status: 'in_progress'
                        })

                    // También actualizar/inicializar la tabla progress global
                    const { error: upsertError } = await supabase
                        .schema('kasa_learn_journey')
                        .from('progress')
                        .upsert({
                            user_id: internalId,
                            current_section: sectionId,
                            section_percentage_completion: 0
                        }, { onConflict: 'user_id' })

                    if (upsertError) console.error("❌ [SectionDetail] Error en upsert progress:", upsertError.message)
                }

                // 4. Fetch modules with their quizzes and user progress
                const { data: modulesData, error: modulesError } = await supabase
                    .schema('kasa_learn_journey')
                    .from('module')
                    .select('*, quizz(id, quizz_number)')
                    .eq('section_id', sectionId)
                    .order('module_number', { ascending: true })

                if (modulesError) throw modulesError

                const { data: userModuleProgress } = await supabase
                    .schema('kasa_learn_journey')
                    .from('user_module_progress')
                    .select('module_id, status')
                    .eq('user_id', internalId)

                const completedModules = new Set(
                    (userModuleProgress || [])
                        .filter(p => p.status === 'completed')
                        .map(p => p.module_id)
                )

                // Determinar cuál es el módulo "activo" actualmente según la tabla progress
                const { data: globalProgress } = await supabase
                    .schema('kasa_learn_journey')
                    .from('progress')
                    .select('current_module')
                    .eq('user_id', internalId)
                    .maybeSingle()

                const transformedModules: Module[] = (modulesData || []).map((mod: any, index: number) => {
                    let quizArray = Array.isArray(mod.quizz) ? mod.quizz : (mod.quizz ? [mod.quizz] : []);
                    const sortedQuizzes = [...quizArray].sort((a: any, b: any) => (a.quizz_number || 0) - (b.quizz_number || 0))
                    const firstQuizzId = sortedQuizzes.length > 0 ? sortedQuizzes[0].id : null

                    // Un módulo es 'active' si:
                    // 1. Es el current_module en la tabla progress
                    // 2. Es el primer módulo y no hay current_module definido
                    // 3. El anterior está completado (este check ya nos da la secuencialidad)
                    let status: 'completed' | 'active' | 'locked' = 'locked'

                    if (completedModules.has(mod.id)) {
                        status = 'completed'
                    } else if (globalProgress?.current_module === mod.id) {
                        status = 'active'
                    } else if (index === 0 && !globalProgress?.current_module) {
                        status = 'active'
                    } else if (index > 0 && completedModules.has(modulesData[index - 1].id)) {
                        // Si el anterior está completado, este es el siguiente a jugar (activo)
                        status = 'active'
                    }

                    return {
                        id: mod.id,
                        number: mod.module_number,
                        title: mod.title,
                        status: status,
                        duration: mod.estimated_time_in_minutes,
                        xp: mod.xp,
                        firstQuizzId: firstQuizzId
                    }
                })

                setModules(transformedModules)

                // Calcular progreso real de la sección
                if (modulesData && modulesData.length > 0) {
                    const completedCount = transformedModules.filter(m => m.status === 'completed').length
                    const perc = Math.round((completedCount / modulesData.length) * 100)
                    setProgress(perc)
                }

            } catch (err: any) {
                console.error('💥 [SectionDetail] Error:', err.message)
                setError(err.message)
            } finally {
                setLoading(false)
                setTimeout(() => setShouldAnimate(true), 100)
            }
        }

        fetchData()
    }, [sectionId])

    const handleNavItemClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault()
        if (isExitingPage) return

        setIsExitingPage(true)

        // Exit sequence: Modules exit first (0s), then Header (0.3s)
        setTimeout(() => {
            router.push(href)
        }, 800)
    }

    const totalXp = modules.reduce((sum, mod) => sum + mod.xp, 0)

    if (error) {
        return (
            <div className="flex flex-col min-h-screen lg:flex-row bg-[#101a28]">
                <MainNav onNavItemClick={handleNavItemClick} />
                <main className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                    <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl">
                        <p className="text-red-500 mb-4 font-bold">{error}</p>
                        <Link href="/sections" className="text-kasa-primary hover:underline">
                            Volver a secciones
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen lg:flex-row bg-transparent">
            <MainNav onNavItemClick={handleNavItemClick} />

            <main className="flex-1 p-6 pb-[calc(80px+1.5rem)] w-full lg:p-8 lg:pb-8 lg:max-w-[800px] lg:mx-auto overflow-hidden relative">
                <motion.header
                    initial={{ y: -50, opacity: 0 }}
                    animate={isExitingPage
                        ? { y: -100, opacity: 0 }
                        : (shouldAnimate ? { y: 0, opacity: 1 } : { y: -50, opacity: 0 })
                    }
                    transition={isExitingPage
                        ? { duration: 0.4, ease: "easeInOut", delay: 0.4 }
                        : { type: "spring", stiffness: 180, damping: 13, mass: 1, bounce: 0.7, delay: 0 }
                    }
                    className="flex items-center justify-between mb-8 py-2"
                >
                    <Link
                        href="/sections"
                        className="w-10 h-10 bg-kasa-card border border-kasa-border rounded-full flex items-center justify-center text-white no-underline hover:bg-white/5 transition-colors"
                    >
                        <BackIcon />
                    </Link>

                    <div className="flex-1 ml-4">
                        <h1 className="text-xl font-bold text-white">{sectionData?.title || 'Cargando...'}</h1>
                        <p className="text-sm text-text-muted">{sectionData?.topic || ''}</p>
                    </div>

                    <div className="text-right">
                        <span className="text-kasa-primary font-extrabold text-base">{totalXp} XP</span>
                        <span className="block text-[0.65rem] uppercase text-text-muted font-bold tracking-wider">Premio Total</span>
                    </div>
                </motion.header>

                <motion.section
                    initial={{ y: 50, opacity: 0 }}
                    animate={isExitingPage
                        ? { y: 100, opacity: 0 }
                        : (shouldAnimate ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 })
                    }
                    transition={isExitingPage
                        ? { duration: 0.4, ease: "easeInOut", delay: 0.2 }
                        : { type: "spring", stiffness: 180, damping: 13, mass: 1, bounce: 0.7, delay: 0.2 }
                    }
                    className="mt-4"
                >
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1">Módulos</h2>
                            <p className="text-text-muted">Avanza en tu aprendizaje</p>
                        </div>
                        <div className="text-kasa-primary font-extrabold text-2xl">{progress}%</div>
                    </div>

                    <div className="mb-8">
                        <ProgressBar value={progress} size="lg" />
                    </div>

                    <div className="flex flex-col gap-6">
                        {loading ? (
                            [1, 2].map(i => <div key={i} className="h-32 bg-kasa-card/50 animate-pulse rounded-2xl border border-kasa-border" />)
                        ) : modules.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                <p className="text-text-muted">No hay módulos disponibles en esta sección.</p>
                            </div>
                        ) : (
                            modules.map((module, index) => (
                                <motion.div
                                    key={module.id}
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={isExitingPage ? { opacity: 0, y: 50 } : { opacity: 1, scale: 1, y: 0 }}
                                    transition={isExitingPage
                                        ? { duration: 0.3, delay: index * 0.05 }
                                        : { duration: 0.4, delay: 0.4 + (index * 0.1) }
                                    }
                                >
                                    <ModuleCard
                                        module={module}
                                        href={module.status === 'active' ? `/lesson/${(module as any).firstQuizzId || module.id}` : undefined}
                                    />
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.section>
            </main>
        </div>
    )
}

export default function SectionDetailPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#101a28] text-white">Cargando...</div>}>
            <SectionDetailContent />
        </Suspense>
    )
}
