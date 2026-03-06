'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import Link from 'next/link'
import { MainNav } from '@/components/layout/MainNav'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { createClient } from '@/utils/supabase/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

// Icons
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
)

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
)

const StarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
)

const FileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="9" y1="15" x2="15" y2="15"></line>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const LightbulbIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6M10 22h4m-7-5 a7 7 0 1 1 10 0a3 3 0 0 0 -3 3v1h-4v-1a3 3 0 0 0 -3-3z"></path>
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
)

const BookOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
)

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const supabase = createClient()

interface QuizBasic {
  id: string
  xp: number
  quizz_number: number
}

interface LessonData {
  id?: string
  text: string
  level: string
  quizz_id: string
  xp: number
  duration: number
  author?: string | null
}

function LessonContent() {
  const { user: appUser, loading: userLoading } = useUser()
  const params = useParams()
  const router = useRouter()
  const paramId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moduleData, setModuleData] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<QuizBasic[]>([])
  const [activeQuizIndex, setActiveQuizIndex] = useState(0)
  const [lessonsData, setLessonsData] = useState<LessonData[]>([])
  const [lessonLoading, setLessonLoading] = useState(false)
  const [hasQuestions, setHasQuestions] = useState(true)

  // Track which lesson the user is currently viewing (within the current quiz's lessons)
  const [activeLessonIndex, setActiveLessonIndex] = useState(0)

  // Total steps = lessons + 1 (the quiz itself as the final step, only if has questions)
  const totalSteps = hasQuestions ? lessonsData.length + 1 : lessonsData.length
  // Whether the user has finished reading all lessons
  const allLessonsRead = hasQuestions
    ? activeLessonIndex >= lessonsData.length
    : activeLessonIndex >= lessonsData.length - 1 && lessonsData.length > 0

  // 1. Fetch EVERYTHING (Module, Quizzes, AND the first Lesson)
  useEffect(() => {
    const fetchInitialData = async () => {
      const quizzId = params.id as string
      if (!quizzId) return

      try {
        console.log(`🚀 [LessonPage] Carga única iniciada para Quizz ID: ${quizzId}`);
        setLoading(true)

        // A. Fetch quizz metadata + module + section
        let { data: quizzData, error: qError } = await supabase
          .schema('kasa_learn_journey')
          .from('quizz')
          .select('*, module:module_id(*, section:section_id(*))')
          .eq('id', quizzId)
          .maybeSingle()

        if (qError || !quizzData) {
          // Fallback logic...
          const { data: publicQ } = await supabase
            .from('quizz')
            .select('*, module:module_id(*, section:section_id(*))')
            .eq('id', quizzId)
            .maybeSingle()
          if (publicQ) quizzData = publicQ
        }

        if (!quizzData) {
          setError('No se encontró el examen o el módulo asociado.')
          return
        }

        const currentModuleId = quizzData.module_id

        // B. Fetch the list of quizzes for this module (for the selector)
        let { data: qList } = await supabase
          .schema('kasa_learn_journey')
          .from('quizz')
          .select('id, xp, quizz_number')
          .eq('module_id', currentModuleId)
          .order('quizz_number', { ascending: true })

        if (!qList || qList.length === 0) {
          const { data: publicQList } = await supabase.from('quizz').select('id, xp, quizz_number').eq('module_id', currentModuleId);
          if (publicQList) qList = publicQList;
        }

        // C. Fetch the lessons for THIS quizzId specifically (STRICT schema)
        console.log(`📖 [LessonPage] Petición de lecciones para: ${quizzId}`);
        const [lessonsRes, questionsRes] = await Promise.all([
          supabase
            .schema('kasa_learn_journey')
            .from('lesson')
            .select('*')
            .eq('quizz_id', quizzId),
          supabase
            .schema('kasa_learn_journey')
            .from('question')
            .select('id')
            .eq('quizz_id', quizzId)
        ])

        let lessons = lessonsRes.data || []
        const questionCount = questionsRes.data?.length || 0
        setHasQuestions(questionCount > 0)

        // If this quiz has NO lessons but HAS questions → redirect to quiz directly
        if (lessons.length === 0 && questionCount > 0) {
          router.replace(`/quiz/${quizzId}`)
          return
        }

        // Final State Consolidation
        setModuleData(quizzData.module)
        if (qList && qList.length > 0) {
          setQuizzes(qList)
          const currentIndex = qList.findIndex(q => q.id === quizzId)
          setActiveQuizIndex(currentIndex >= 0 ? currentIndex : 0)
        }

        // --- INICIALIZACIÓN DE PROGRESO DE MÓDULO ---
        if (appUser && !userLoading) {
          const internalId = appUser.id

          const moduleId = quizzData.module_id
          const sectionId = quizzData.module?.section_id

          // 1. Check module progress
          const { data: modProgress } = await supabase
            .schema('kasa_learn_journey')
            .from('user_module_progress')
            .select('*')
            .eq('user_id', internalId)
            .eq('module_id', moduleId)
            .maybeSingle()

          if (modProgress?.status === 'completed') {
          }

          if (!modProgress) {
            await supabase
              .schema('kasa_learn_journey')
              .from('user_module_progress')
              .insert({
                user_id: internalId,
                module_id: moduleId,
                status: 'in_progress'
              })

            // 2. Update global progress
            await supabase
              .schema('kasa_learn_journey')
              .from('progress')
              .upsert({
                user_id: internalId,
                current_section: sectionId,
                current_module: moduleId,
                module_percentage_completion: 0
              }, { onConflict: 'user_id' })
          }
        }
        // --------------------------------------------

        if (lessons && lessons.length > 0) {
          setLessonsData(lessons.map(l => ({
            ...l,
            xp: quizzData.xp,
            duration: quizzData.module?.estimated_time_in_minutes || 5
          })))
        } else {
          setLessonsData([{
            title: 'Sin Contenido',
            text: 'Esta etapa no tiene material de lectura disponible.',
            level: 'Básico',
            xp: quizzData.xp,
            duration: quizzData.module?.estimated_time_in_minutes || 5,
            quizz_id: quizzId
          } as any])
        }

        // Reset lesson index when loading new data
        setActiveLessonIndex(0)

      } catch (err: any) {
        console.error('💥 [LessonPage] Error:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [paramId])

  // 2. ONLY for when the user clicks a DIFFERENT stage in the selector
  useEffect(() => {
    const currentQuiz = quizzes[activeQuizIndex]
    // Avoid running on the very first load because fetchInitialData handled it
    if (!currentQuiz || loading) return

    // Check if we already have the lessons for this quiz to prevent double-fetch
    if (lessonsData.length > 0 && lessonsData[0]?.quizz_id === currentQuiz.id) return

    const fetchNewLessons = async () => {
      try {
        setLessonLoading(true)
        console.log(`🔄 [LessonPage] Cambiando lecciones a Quizz ID: ${currentQuiz.id}`);

        const [lessonsRes, questionsRes] = await Promise.all([
          supabase
            .schema('kasa_learn_journey')
            .from('lesson')
            .select('*')
            .eq('quizz_id', currentQuiz.id),
          supabase
            .schema('kasa_learn_journey')
            .from('question')
            .select('id')
            .eq('quizz_id', currentQuiz.id)
        ])

        const lessons = lessonsRes.data || []
        const questionCount = questionsRes.data?.length || 0
        setHasQuestions(questionCount > 0)

        // If no lessons but has questions → redirect to quiz
        if (lessons.length === 0 && questionCount > 0) {
          router.replace(`/quiz/${currentQuiz.id}`)
          return
        }

        if (lessons && lessons.length > 0) {
          setLessonsData(lessons.map(l => ({
            ...l,
            xp: currentQuiz.xp,
            duration: moduleData?.estimated_time_in_minutes || 5
          })))
        } else {
          // If no lesson found for the new quiz, provide a default message
          setLessonsData([{
            title: 'Sin Contenido',
            text: 'Esta etapa no tiene material de lectura disponible.',
            level: 'Básico',
            xp: currentQuiz.xp,
            duration: moduleData?.estimated_time_in_minutes || 5,
            quizz_id: currentQuiz.id
          } as any])
        }

        // Reset lesson navigation when switching quiz
        setActiveLessonIndex(0)
      } catch (err) {
        console.error(err)
      } finally {
        setLessonLoading(false)
      }
    }

    fetchNewLessons()
  }, [activeQuizIndex, quizzes, moduleData, loading, lessonsData])

  // Handlers for lesson navigation
  const handleNextLesson = () => {
    setActiveLessonIndex(prev => prev + 1)
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePreviousLesson = () => {
    setActiveLessonIndex(prev => Math.max(0, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle quiz stage change (for modules with multiple quizzes)
  const handleStageChange = (idx: number) => {
    setActiveQuizIndex(idx)
    setActiveLessonIndex(0)
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#101a28] text-white min-h-screen">
      <div className="animate-pulse text-lg font-bold">Cargando módulo...</div>
    </div>
  )

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#101a28] p-6 text-center min-h-screen">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-md">
        <p className="text-red-500 mb-6 font-bold">{error}</p>
        <Button onClick={() => router.push('/sections')} variant="secondary" fullWidth>
          Volver a Secciones
        </Button>
      </div>
    </div>
  )

  const currentQuiz = quizzes[activeQuizIndex]
  const hasMultipleLessons = lessonsData.length > 1
  const currentLesson = lessonsData[activeLessonIndex]
  // Progress: lesson step / total steps
  const stepProgress = ((activeLessonIndex + 1) / totalSteps) * 100

  // Metadata for the current step
  const stepMetadata = lessonsData[0] || { xp: currentQuiz?.xp || 0, duration: 5, level: 'Básico' }

  return (
    <div className="flex flex-col min-h-screen lg:flex-row bg-transparent text-white">
      <MainNav />

      <main className="flex-1 p-6 pb-[calc(80px+120px)] w-full lg:pb-[120px] relative">
        <div className="max-w-[700px] mx-auto">
          {/* Header */}
          <header className="py-6 flex items-center justify-between mb-8 border-b border-white/5 sticky top-0 bg-transparent backdrop-blur-md z-10 px-4 -mx-4">
            <Link
              href={quizzes.length > 1 ? `/module/${moduleData?.id}` : `/sections/${moduleData?.section_id}`}
              className="w-10 h-10 bg-kasa-card border border-kasa-border rounded-full flex items-center justify-center text-white no-underline hover:bg-white/10 transition-colors"
            >
              <BackIcon />
            </Link>

            <div className="flex-1 ml-4 overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">{moduleData?.title}</h4>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">
                {allLessonsRead
                  ? (hasQuestions ? 'Listo para el examen' : 'Lectura completada')
                  : `Lección ${activeLessonIndex + 1} de ${lessonsData.length}`
                }
              </p>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-xs text-kasa-primary font-bold">{stepMetadata.xp} XP</span>
              <div className="w-16">
                <ProgressBar value={stepProgress} size="sm" />
              </div>
            </div>
          </header>

          {/* Stage Selector (If multiple quizzes per module) */}
          {quizzes.length > 1 && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
              {quizzes.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => handleStageChange(idx)}
                  className={cn(
                    "flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border",
                    activeQuizIndex === idx
                      ? "bg-kasa-primary border-kasa-primary text-white shadow-lg shadow-kasa-primary/20"
                      : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10"
                  )}
                >
                  Paso {q.quizz_number || idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* Lesson Step Indicators (only when multiple lessons) */}
          {hasMultipleLessons && (
            <div className="flex items-center gap-2 mb-8">
              {lessonsData.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveLessonIndex(idx)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                    idx === activeLessonIndex
                      ? "bg-kasa-primary/15 border-kasa-primary/40 text-kasa-primary"
                      : idx < activeLessonIndex
                        ? "bg-kasa-primary/10 border-kasa-primary/20 text-kasa-primary/70"
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                  )}
                >
                  {idx < activeLessonIndex ? (
                    <span className="w-5 h-5 rounded-full bg-kasa-primary flex items-center justify-center">
                      <CheckIcon />
                    </span>
                  ) : (
                    <span className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border",
                      idx === activeLessonIndex
                        ? "border-kasa-primary text-kasa-primary"
                        : "border-white/20 text-white/30"
                    )}>
                      {idx + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">Lección {idx + 1}</span>
                </button>
              ))}

              {/* Quiz step indicator (only if has questions) */}
              {hasQuestions && (
                <div className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border",
                  allLessonsRead
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                    : "bg-white/5 border-white/10 text-white/30"
                )}>
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center",
                    allLessonsRead ? "bg-amber-500/20" : ""
                  )}>
                    <FileIcon />
                  </span>
                  <span className="hidden sm:inline">Examen</span>
                </div>
              )}
            </div>
          )}

          {/* Lesson Content Area */}
          <div className={cn("transition-opacity duration-300", lessonLoading ? "opacity-50" : "opacity-100")}>
            {/* Breadcrumbs */}
            <nav className="text-[10px] font-black text-kasa-primary uppercase tracking-[0.2em] mb-4 flex gap-2">
              {moduleData?.section?.title} <span className="text-white/20">/</span> {moduleData?.title}
            </nav>

            {/* Show current lesson (or the "ready for quiz" screen) */}
            {!allLessonsRead && currentLesson ? (
              <article
                key={`lesson-${activeLessonIndex}`}
                className="prose prose-invert max-w-none relative animate-[fadeIn_0.4s_ease-out]"
              >
                {/* Lesson counter badge (only when multiple) */}
                {hasMultipleLessons && (
                  <div className="flex items-center gap-3 mb-8 p-4 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
                    <div className="w-10 h-10 rounded-xl bg-kasa-primary/15 flex items-center justify-center text-kasa-primary">
                      <BookOpenIcon />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
                        Lección {activeLessonIndex + 1} de {lessonsData.length}
                      </p>
                      <p className="text-sm text-white/60">
                        {currentLesson.level || 'Nivel Básico'}
                      </p>
                    </div>
                  </div>
                )}

                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: (props) => <h1 className="text-4xl font-black leading-tight mb-8 text-white tracking-tight" {...props} />,
                    h2: (props) => <h2 className="text-2xl font-bold mt-12 mb-6 text-white border-b border-white/5 pb-2" {...props} />,
                    h3: (props) => <h3 className="text-xl font-bold mt-8 mb-4 text-white" {...props} />,
                    p: (props) => <p className="text-lg text-white/90 mb-6 leading-relaxed font-medium" {...props} />,
                    ul: (props) => <ul className="list-none flex flex-col gap-5 my-8" {...props} />,
                    li: (props) => (
                      <li className="flex gap-4 items-start bg-white/[0.03] p-4 rounded-2xl border border-white/[0.05]">
                        <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-emerald-500/20">
                          <CheckIcon />
                        </div>
                        <div className="text-base text-white/80 leading-snug">{props.children}</div>
                      </li>
                    ),
                    strong: (props) => <strong className="text-kasa-primary font-black" {...props} />,
                    blockquote: (props) => (
                      <div className="bg-kasa-primary/10 border-l-4 border-kasa-primary rounded-2xl p-6 my-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                          <LightbulbIcon />
                        </div>
                        <div className="flex items-center gap-3 text-kasa-primary text-[10px] font-black uppercase tracking-widest mb-4">
                          <LightbulbIcon />
                          Concepto Clave
                        </div>
                        <div className="text-lg italic text-white/90 leading-relaxed font-semibold relative z-10">{props.children}</div>
                      </div>
                    )
                  }}
                >
                  {currentLesson.text}
                </ReactMarkdown>

                {/* Meta footer for the current lesson */}
                <div className="flex flex-wrap gap-6 mt-12 py-8 border-t border-white/5 text-sm font-bold text-white/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                      <ClockIcon />
                    </div>
                    <span>{currentLesson.duration} minutos de lectura</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                      <StarIcon />
                    </div>
                    <span>{currentLesson.level || 'Nivel Básico'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                      <UserIcon />
                    </div>
                    <span>{currentLesson.author || 'Anónimo'}</span>
                  </div>
                </div>

                {/* Navigation hint */}
                {hasMultipleLessons && (
                  <div className="text-center text-white/20 text-xs font-bold uppercase tracking-[0.3em] mt-4 mb-20 flex flex-col items-center gap-4">
                    <span>
                      {activeLessonIndex < lessonsData.length - 1
                        ? '¿Todo claro? Avanza a la siguiente lección'
                        : '¿Todo claro? Presiona el botón para comenzar el examen'
                      }
                    </span>
                    <div className="animate-bounce">
                      <ChevronDownIcon />
                    </div>
                  </div>
                )}

                {/* Single lesson mode hint */}
                {!hasMultipleLessons && (
                  <div className="text-center text-white/20 text-xs font-bold uppercase tracking-[0.3em] mt-4 mb-20 flex flex-col items-center gap-4">
                    <span>{hasQuestions ? '¿Todo claro? Presiona el botón para comenzar' : '¿Terminaste de leer? Vuelve al módulo'}</span>
                    <div className="animate-bounce">
                      <ChevronDownIcon />
                    </div>
                  </div>
                )}
              </article>
            ) : allLessonsRead && hasMultipleLessons ? (
              /* "All lessons complete" summary */
              <div className="flex flex-col items-center text-center py-12 animate-[fadeIn_0.4s_ease-out]">
                <div className="w-20 h-20 rounded-full bg-kasa-primary/15 flex items-center justify-center text-kasa-primary mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-white mb-3">¡Lecciones completadas!</h2>
                <p className="text-lg text-white/60 mb-2">
                  Has leído {lessonsData.length === 1 ? 'la' : 'las'} <strong className="text-kasa-primary">{lessonsData.length} {lessonsData.length === 1 ? 'lección' : 'lecciones'}</strong> de esta etapa.
                </p>
                <p className="text-sm text-white/40 mb-10">
                  {hasQuestions ? 'Ahora es momento de poner a prueba lo que aprendiste.' : 'Ya completaste el material de lectura de esta etapa.'}
                </p>

                {/* Recap of lessons read */}
                <div className="w-full max-w-md flex flex-col gap-3 mb-12">
                  {lessonsData.map((lesson, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveLessonIndex(idx)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-left hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <span className="w-8 h-8 rounded-full bg-kasa-primary flex items-center justify-center flex-shrink-0">
                        <CheckIcon />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">Lección {idx + 1}</p>
                        <p className="text-xs text-white/40">{lesson.level || 'Nivel Básico'}</p>
                      </div>
                      <span className="text-xs text-white/30 font-bold">Repasar</span>
                    </button>
                  ))}
                </div>

                <div className="text-center text-white/20 text-xs font-bold uppercase tracking-[0.3em] flex flex-col items-center gap-4">
                  <span>{hasQuestions ? 'Presiona el botón para comenzar el examen' : 'Presiona el botón para volver'}</span>
                  <div className="animate-bounce">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Sticky Action Footer */}
            <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-0 w-full px-6 py-8 bg-transparent z-50 flex flex-col items-center gap-4 lg:left-[260px] lg:w-[calc(100%-260px)]">
              {/* If user hasn't finished all lessons yet */}
              {!allLessonsRead ? (
                <div className="flex w-full max-w-[420px] gap-3">
                  {/* Back button (only if not first lesson) */}
                  {activeLessonIndex > 0 && (
                    <button
                      onClick={handlePreviousLesson}
                      className="w-14 h-16 rounded-2xl bg-kasa-card border-2 border-kasa-border flex items-center justify-center text-white hover:bg-kasa-hover transition-all flex-shrink-0"
                    >
                      <BackIcon />
                    </button>
                  )}

                  {activeLessonIndex < lessonsData.length - 1 ? (
                    /* Next Lesson button */
                    <Button
                      onClick={handleNextLesson}
                      fullWidth
                      size="lg"
                      className="h-16 rounded-2xl text-lg font-black tracking-wide shadow-xl shadow-kasa-primary/25 gap-3 group"
                    >
                      SIGUIENTE LECCIÓN
                      <ArrowRightIcon />
                    </Button>
                  ) : hasQuestions ? (
                    /* Last lesson + has questions → Start quiz */
                    <Link href={`/quiz/${currentQuiz?.id}`} className="w-full no-underline">
                      <Button fullWidth size="lg" className="h-16 rounded-2xl text-lg font-black tracking-wide shadow-xl shadow-kasa-primary/25 gap-3 group">
                        COMENZAR EXAMEN
                        <FileIcon />
                      </Button>
                    </Link>
                  ) : (
                    /* Last lesson + no questions → Go back to module */
                    <Link
                      href={quizzes.length > 1 ? `/module/${moduleData?.id}` : `/sections/${moduleData?.section_id}`}
                      className="w-full no-underline"
                    >
                      <Button fullWidth size="lg" variant="secondary" className="h-16 rounded-2xl text-lg font-black tracking-wide gap-3 group">
                        VOLVER AL MÓDULO
                        <BackIcon />
                      </Button>
                    </Link>
                  )}
                </div>
              ) : hasQuestions ? (
                /* All lessons read + has questions → Show quiz button */
                <Link href={`/quiz/${currentQuiz?.id}`} className="w-full max-w-[420px] no-underline">
                  <Button fullWidth size="lg" className="h-16 rounded-2xl text-lg font-black tracking-wide shadow-xl shadow-kasa-primary/25 gap-3 group">
                    COMENZAR EXAMEN
                    <FileIcon />
                  </Button>
                </Link>
              ) : (
                /* All lessons read + no questions → Go back */
                <Link
                  href={quizzes.length > 1 ? `/module/${moduleData?.id}` : `/sections/${moduleData?.section_id}`}
                  className="w-full max-w-[420px] no-underline"
                >
                  <Button fullWidth size="lg" variant="secondary" className="h-16 rounded-2xl text-lg font-black tracking-wide gap-3 group">
                    VOLVER AL MÓDULO
                    <BackIcon />
                  </Button>
                </Link>
              )}
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                {hasQuestions ? `Gana hasta ${stepMetadata.xp} XP` : 'Solo lectura'}
              </p>
            </div>
        </div>
      </main>

      <style jsx global>{`
                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-none {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
    </div>
  )
}

export default function LessonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#101a28] flex items-center justify-center text-white font-bold">Cargando...</div>}>
      <LessonContent />
    </Suspense>
  )
}
