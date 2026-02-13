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

const supabase = createClient()

interface QuizBasic {
  id: string
  xp: number
  quizz_number: number
}

function LessonContent() {
  const { user: appUser, loading: userLoading } = useUser()
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moduleData, setModuleData] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<QuizBasic[]>([])
  const [activeQuizIndex, setActiveQuizIndex] = useState(0)
  const [lessonsData, setLessonsData] = useState<any[]>([])
  const [lessonLoading, setLessonLoading] = useState(false)

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
        let { data: lessons } = await supabase
          .schema('kasa_learn_journey')
          .from('lesson')
          .select('*')
          .eq('quizz_id', quizzId)

        if (!lessons) lessons = []

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
          }])
        }

      } catch (err: any) {
        console.error('💥 [LessonPage] Error:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [moduleId])

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

        let { data: lessons } = await supabase
          .schema('kasa_learn_journey')
          .from('lesson')
          .select('*')
          .eq('quizz_id', currentQuiz.id)

        if (!lessons) lessons = []

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
          }])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLessonLoading(false)
      }
    }

    fetchNewLessons()
  }, [activeQuizIndex, quizzes, moduleData, loading, lessonsData]) // Only trigger on manual index change, include lessonsData[0]?.quizz_id to prevent re-fetch if already loaded

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
  // Metadata for the current step (taken from the first lesson or quiz defaults)
  const stepMetadata = lessonsData[0] || { xp: currentQuiz?.xp || 0, duration: 5, level: 'Básico' }

  return (
    <div className="flex flex-col min-h-screen lg:flex-row bg-transparent text-white">
      <MainNav />

      <main className="flex-1 p-6 pb-[calc(80px+120px)] w-full lg:pb-[120px] relative">
        <div className="max-w-[700px] mx-auto">
          {/* Header */}
          <header className="py-6 flex items-center justify-between mb-8 border-b border-white/5 sticky top-0 bg-transparent backdrop-blur-md z-10 px-4 -mx-4">
            <Link
              href={`/sections/${moduleData?.section_id}`}
              className="w-10 h-10 bg-kasa-card border border-kasa-border rounded-full flex items-center justify-center text-white no-underline hover:bg-white/10 transition-colors"
            >
              <BackIcon />
            </Link>

            <div className="flex-1 ml-4 overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">{moduleData?.title}</h4>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Lección {activeQuizIndex + 1} de {quizzes.length}</p>
            </div>

            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-xs text-kasa-primary font-bold">{stepMetadata.xp} XP</span>
              <div className="w-16">
                <ProgressBar value={((activeQuizIndex + 1) / quizzes.length) * 100} size="sm" />
              </div>
            </div>
          </header>

          {/* Stage Selector (If multiple quizzes) */}
          {quizzes.length > 1 && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
              {quizzes.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setActiveQuizIndex(idx)}
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

          {/* Lesson Content Area */}
          <div className={cn("transition-opacity duration-300", lessonLoading ? "opacity-50" : "opacity-100")}>
            {/* Breadcrumbs */}
            <nav className="text-[10px] font-black text-kasa-primary uppercase tracking-[0.2em] mb-4 flex gap-2">
              {moduleData?.section?.title} <span className="text-white/20">/</span> {moduleData?.title}
            </nav>

            {lessonsData.length > 0 && (
              <div className="flex flex-col gap-12">
                {lessonsData.map((lesson, idx) => (
                  <article key={lesson.id || idx} className="prose prose-invert max-w-none relative">
                    {idx > 0 && <div className="h-px w-full bg-white/5 mb-12" />}

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
                      {lesson.text}
                    </ReactMarkdown>

                    {/* Only show meta footer on the last lesson of the block */}
                    {idx === lessonsData.length - 1 && (
                      <div className="flex flex-wrap gap-6 mt-12 py-8 border-t border-white/5 text-sm font-bold text-white/30">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                            <ClockIcon />
                          </div>
                          <span>{lesson.duration} minutos de lectura</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                            <StarIcon />
                          </div>
                          <span>{lesson.level || 'Nivel Básico'}</span>
                        </div>
                      </div>
                    )}
                  </article>
                ))}

                {/* Transition Hint */}
                <div className="text-center text-white/20 text-xs font-bold uppercase tracking-[0.3em] mt-4 mb-20 flex flex-col items-center gap-4">
                  <span>¿Todo claro? Presiona el botón para comenzar</span>
                  <div className="animate-bounce">
                    <ChevronDownIcon />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Action Footer */}
          <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-0 w-full px-6 py-8 bg-transparent z-50 flex flex-col items-center gap-4 lg:left-[260px] lg:w-[calc(100%-260px)]">
            <Link href={`/quiz/${currentQuiz?.id}`} className="w-full max-w-[420px] no-underline">
              <Button fullWidth size="lg" className="h-16 rounded-2xl text-lg font-black tracking-wide shadow-xl shadow-kasa-primary/25 gap-3 group">
                COMENZAR EXAMEN
                <FileIcon />
              </Button>
            </Link>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Gana hasta {stepMetadata.xp} XP</p>
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
