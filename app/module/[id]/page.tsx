'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { MainNav } from '@/components/layout/MainNav'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { useUser } from '@/context/UserContext'
import { cn } from '@/lib/utils'

// ─── Icons ───
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
)

const BookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
)

const QuestionIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
)

const CheckCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
)

const PlayIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
)

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)

const BoltIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
)

const supabase = createClient()

interface QuizDetail {
    id: string
    quizz_number: number
    xp: number
    minimum_score: number
    lessonCount: number
    questionCount: number
    passed: boolean
    bestScore: number | null
}

function ModuleOverviewContent() {
    const { user: appUser, loading: userLoading } = useUser()
    const params = useParams()
    const router = useRouter()
    const moduleId = params.id as string

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [moduleData, setModuleData] = useState<any>(null)
    const [sectionData, setSectionData] = useState<any>(null)
    const [quizzes, setQuizzes] = useState<QuizDetail[]>([])
    const [moduleCompleted, setModuleCompleted] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            if (!moduleId || !appUser || userLoading) return

            try {
                setLoading(true)
                const internalId = appUser.id

                // 1. Fetch module + section info
                const { data: modData, error: modError } = await supabase
                    .schema('kasa_learn_journey')
                    .from('module')
                    .select('*, section:section_id(*)')
                    .eq('id', moduleId)
                    .maybeSingle()

                if (modError || !modData) {
                    setError('No se encontró el módulo.')
                    return
                }

                setModuleData(modData)
                setSectionData(modData.section)

                // 2. Fetch all quizzes for this module
                const { data: quizzesRaw, error: qError } = await supabase
                    .schema('kasa_learn_journey')
                    .from('quizz')
                    .select('id, quizz_number, xp, minimum_score')
                    .eq('module_id', moduleId)
                    .order('quizz_number', { ascending: true })

                if (qError) throw qError
                if (!quizzesRaw || quizzesRaw.length === 0) {
                    setError('Este módulo no tiene etapas configuradas.')
                    return
                }

                const quizIds = quizzesRaw.map(q => q.id)

                // 3. Count lessons per quiz
                const { data: lessonsRaw } = await supabase
                    .schema('kasa_learn_journey')
                    .from('lesson')
                    .select('id, quizz_id')
                    .in('quizz_id', quizIds)

                // 4. Count questions per quiz
                const { data: questionsRaw } = await supabase
                    .schema('kasa_learn_journey')
                    .from('question')
                    .select('id, quizz_id')
                    .in('quizz_id', quizIds)

                // 5. Fetch user's quiz attempts for this module
                const { data: attempts } = await supabase
                    .schema('kasa_learn_journey')
                    .from('user_quizz_attempt')
                    .select('quizz_id, score, passed')
                    .eq('user_id', internalId)
                    .in('quizz_id', quizIds)

                // 6. Check module completion
                const { data: modProgress } = await supabase
                    .schema('kasa_learn_journey')
                    .from('user_module_progress')
                    .select('status')
                    .eq('user_id', internalId)
                    .eq('module_id', moduleId)
                    .maybeSingle()

                if (modProgress?.status === 'completed') {
                    setModuleCompleted(true)
                }

                // Build quiz details
                const lessonCountMap: Record<string, number> = {}
                    ; (lessonsRaw || []).forEach(l => {
                        lessonCountMap[l.quizz_id] = (lessonCountMap[l.quizz_id] || 0) + 1
                    })

                const questionCountMap: Record<string, number> = {}
                    ; (questionsRaw || []).forEach(q => {
                        questionCountMap[q.quizz_id] = (questionCountMap[q.quizz_id] || 0) + 1
                    })

                const attemptMap: Record<string, { passed: boolean; bestScore: number }> = {}
                    ; (attempts || []).forEach(a => {
                        const existing = attemptMap[a.quizz_id]
                        if (!existing || a.score > existing.bestScore) {
                            attemptMap[a.quizz_id] = { passed: a.passed, bestScore: a.score }
                        }
                        if (a.passed) {
                            attemptMap[a.quizz_id].passed = true
                        }
                    })

                const quizDetails: QuizDetail[] = quizzesRaw.map(q => ({
                    id: q.id,
                    quizz_number: q.quizz_number,
                    xp: q.xp,
                    minimum_score: q.minimum_score,
                    lessonCount: lessonCountMap[q.id] || 0,
                    questionCount: questionCountMap[q.id] || 0,
                    passed: attemptMap[q.id]?.passed || false,
                    bestScore: attemptMap[q.id]?.bestScore ?? null,
                }))

                setQuizzes(quizDetails)
            } catch (err: any) {
                console.error('💥 [ModuleOverview] Error:', err.message)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [moduleId, appUser?.id, userLoading])

    // Determine which quiz is the "next" one the user should do
    const nextQuizIndex = quizzes.findIndex(q => !q.passed)
    const passedCount = quizzes.filter(q => q.passed).length
    const totalXp = quizzes.reduce((sum, q) => sum + q.xp, 0)
    const progress = quizzes.length > 0 ? Math.round((passedCount / quizzes.length) * 100) : 0

    // Determine the quiz type label
    const getQuizTypeLabel = (q: QuizDetail) => {
        if (q.lessonCount > 0 && q.questionCount > 0) return 'Lección + Examen'
        if (q.lessonCount > 0 && q.questionCount === 0) return 'Solo Lectura'
        if (q.lessonCount === 0 && q.questionCount > 0) return 'Solo Examen'
        return 'Etapa'
    }

    // Determine the nav destination for a quiz
    const getQuizHref = (q: QuizDetail) => {
        // If it has lessons, go to lesson page first
        if (q.lessonCount > 0) return `/lesson/${q.id}`
        // If it only has questions, go directly to quiz
        if (q.questionCount > 0) return `/quiz/${q.id}`
        // Fallback
        return `/lesson/${q.id}`
    }

    // Determine the CTA label
    const getCtaLabel = (q: QuizDetail, index: number) => {
        if (q.passed) {
            if (q.lessonCount > 0) return 'Repasar'
            return 'Reintentar'
        }
        if (index === nextQuizIndex) {
            if (q.lessonCount > 0 && q.questionCount > 0) return 'Comenzar'
            if (q.lessonCount > 0) return 'Leer'
            return 'Examen'
        }
        return 'Comenzar'
    }

    if (loading || userLoading) return (
        <div className="flex-1 flex items-center justify-center bg-[#101a28] text-white min-h-screen">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-kasa-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg font-bold animate-pulse">Cargando módulo...</p>
            </div>
        </div>
    )

    if (error) return (
        <div className="flex flex-col min-h-screen lg:flex-row bg-[#101a28]">
            <MainNav />
            <main className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-md">
                    <p className="text-red-500 mb-6 font-bold">{error}</p>
                    <Button onClick={() => router.back()} variant="secondary" fullWidth>
                        Volver atrás
                    </Button>
                </div>
            </main>
        </div>
    )

    return (
        <div className="flex flex-col min-h-screen lg:flex-row bg-transparent text-white">
            <MainNav />

            <main className="flex-1 p-6 pb-[calc(80px+1.5rem)] w-full lg:p-8 lg:pb-8 lg:max-w-[800px] lg:mx-auto relative">
                {/* Header */}
                <header className="flex items-center justify-between mb-8 py-2 animate-[fadeIn_0.4s_ease-out]">
                    <Link
                        href={`/sections/${sectionData?.id}`}
                        className="w-10 h-10 bg-kasa-card border border-kasa-border rounded-full flex items-center justify-center text-white no-underline hover:bg-white/5 transition-colors"
                    >
                        <BackIcon />
                    </Link>

                    <div className="flex-1 ml-4">
                        <p className="text-[10px] text-kasa-primary font-black uppercase tracking-widest mb-0.5">
                            {sectionData?.title}
                        </p>
                        <h1 className="text-xl font-bold text-white">{moduleData?.title}</h1>
                    </div>

                    <div className="text-right">
                        <span className="text-kasa-primary font-extrabold text-base">{totalXp} XP</span>
                        <span className="block text-[0.65rem] uppercase text-text-muted font-bold tracking-wider">Premio Total</span>
                    </div>
                </header>

                {/* Module Progress */}
                <div className="mb-8 animate-[fadeIn_0.4s_ease-out]" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Etapas del Módulo</h2>
                            <p className="text-text-muted text-sm">
                                {quizzes.length === 1
                                    ? '1 etapa en este módulo'
                                    : `${quizzes.length} etapas en este módulo`
                                }
                            </p>
                        </div>
                        <div className="text-kasa-primary font-extrabold text-2xl">{progress}%</div>
                    </div>
                    <ProgressBar value={progress} size="lg" />
                </div>

                {/* Module info card */}
                <div className="bg-kasa-card border border-kasa-border rounded-2xl p-5 mb-8 flex gap-6 flex-wrap animate-[fadeIn_0.4s_ease-out]" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                        <ClockIcon />
                        <span>{moduleData?.estimated_time_in_minutes || 0} min estimados</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                        <BoltIcon />
                        <span>{totalXp} XP total</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                        <BookIcon />
                        <span>{quizzes.reduce((s, q) => s + q.lessonCount, 0)} lecciones</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                        <QuestionIcon />
                        <span>{quizzes.reduce((s, q) => s + q.questionCount, 0)} preguntas</span>
                    </div>
                </div>

                {/* Quiz Cards */}
                <div className="flex flex-col gap-4">
                    {quizzes.map((quiz, index) => {
                        const isNext = index === nextQuizIndex
                        const href = getQuizHref(quiz)

                        return (
                            <div
                                key={quiz.id}
                                className="animate-[fadeIn_0.4s_ease-out]"
                                style={{ animationDelay: `${0.2 + index * 0.08}s`, animationFillMode: 'backwards' }}
                            >
                                <div
                                    className={cn(
                                        "bg-kasa-card border rounded-2xl p-5 transition-all relative overflow-hidden",
                                        quiz.passed
                                            ? "border-kasa-primary/30"
                                            : isNext
                                                ? "border-kasa-primary/50 shadow-lg shadow-kasa-primary/10"
                                                : "border-kasa-border"
                                    )}
                                >
                                    {/* Active indicator */}
                                    {isNext && !quiz.passed && (
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-kasa-primary/50 via-kasa-primary to-kasa-primary/50" />
                                    )}

                                    <div className="flex items-start gap-4">
                                        {/* Step number / status icon */}
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                            quiz.passed
                                                ? "bg-kasa-primary/15 text-kasa-primary"
                                                : isNext
                                                    ? "bg-kasa-primary/15 text-kasa-primary"
                                                    : "bg-white/5 text-text-muted"
                                        )}>
                                            {quiz.passed ? (
                                                <CheckCircleIcon />
                                            ) : (
                                                <span className="text-lg font-black">{quiz.quizz_number || index + 1}</span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base font-bold text-white">
                                                    Etapa {quiz.quizz_number || index + 1}
                                                </h3>

                                                {/* Type badge */}
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                                    quiz.lessonCount > 0 && quiz.questionCount > 0
                                                        ? "bg-violet-500/15 text-violet-400"
                                                        : quiz.lessonCount > 0
                                                            ? "bg-sky-500/15 text-sky-400"
                                                            : "bg-amber-500/15 text-amber-400"
                                                )}>
                                                    {getQuizTypeLabel(quiz)}
                                                </span>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                                                {quiz.lessonCount > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <BookIcon />
                                                        {quiz.lessonCount} {quiz.lessonCount === 1 ? 'lección' : 'lecciones'}
                                                    </span>
                                                )}
                                                {quiz.questionCount > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <QuestionIcon />
                                                        {quiz.questionCount} {quiz.questionCount === 1 ? 'pregunta' : 'preguntas'}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <BoltIcon />
                                                    {quiz.xp} XP
                                                </span>
                                            </div>

                                            {/* Score bar (if attempted) */}
                                            {quiz.bestScore !== null && (
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-500",
                                                                quiz.passed ? "bg-kasa-primary" : "bg-red-400"
                                                            )}
                                                            style={{ width: `${quiz.bestScore}%` }}
                                                        />
                                                    </div>
                                                    <span className={cn(
                                                        "text-xs font-bold",
                                                        quiz.passed ? "text-kasa-primary" : "text-red-400"
                                                    )}>
                                                        {Math.round(quiz.bestScore)}%
                                                    </span>
                                                </div>
                                            )}

                                            {/* CTA */}
                                            <div className="flex items-center gap-3">
                                                <Link href={href} className="no-underline">
                                                    <button className={cn(
                                                        "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer border-none",
                                                        quiz.passed
                                                            ? "bg-white/5 text-white/60 hover:bg-white/10"
                                                            : isNext
                                                                ? "bg-kasa-primary text-white shadow-[0_3px_0_#059669] active:translate-y-0.5 active:shadow-[0_1px_0_#059669]"
                                                                : "bg-white/5 text-white hover:bg-white/10"
                                                    )}>
                                                        {quiz.passed ? null : <PlayIcon />}
                                                        {getCtaLabel(quiz, index)}
                                                    </button>
                                                </Link>

                                                {quiz.passed && (
                                                    <span className="text-xs text-kasa-primary font-bold flex items-center gap-1">
                                                        <CheckCircleIcon />
                                                        Aprobado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Module Completed Banner */}
                {moduleCompleted && (
                    <div className="mt-8 bg-kasa-primary/10 border border-kasa-primary/30 rounded-2xl p-6 text-center animate-[fadeIn_0.4s_ease-out]">
                        <div className="w-16 h-16 rounded-full bg-kasa-primary/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircleIcon />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">¡Módulo Completado!</h3>
                        <p className="text-sm text-white/60 mb-4">Has aprobado todas las etapas de este módulo.</p>
                        <Link href={`/sections/${sectionData?.id}`} className="no-underline">
                            <Button variant="secondary" size="sm">
                                Volver a la sección
                            </Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}

export default function ModuleOverviewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#101a28] flex items-center justify-center text-white font-bold">Cargando...</div>}>
            <ModuleOverviewContent />
        </Suspense>
    )
}
