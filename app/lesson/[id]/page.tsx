'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  quiz_number: number
}

function LessonContent() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moduleData, setModuleData] = useState<any>(null)
  const [quizzes, setQuizzes] = useState<QuizBasic[]>([])
  const [activeQuizIndex, setActiveQuizIndex] = useState(0)
  const [lessonData, setLessonData] = useState<any>(null)
  const [lessonLoading, setLessonLoading] = useState(false)

  // 1. Fetch Module and ALL associated Quizzes
  useEffect(() => {
    const fetchModuleAndQuizzes = async () => {
      if (!moduleId) return

      try {
        setLoading(true)

        // Fetch Module info
        const { data: mod, error: modError } = await supabase
          .schema('kasa_learn_journey')
          .from('module')
          .select('*, section:section_id(title)')
          .eq('id', moduleId)
          .single()

        if (modError) throw modError
        setModuleData(mod)

        // Fetch ALL Quizzes for this module
        const { data: qListData, error: qListError } = await supabase
          .schema('kasa_learn_journey')
          .from('quizz')
          .select('id, xp, quiz_number')
          .eq('module_id', moduleId)
          .order('quiz_number', { ascending: true })

        if (qListError) throw qListError

        if (!qListData || qListData.length === 0) {
          setError('Este módulo no tiene exámenes configurados todavía.')
          return
        }

        setQuizzes(qListData)
        // Start with the first quiz
        setActiveQuizIndex(0)

      } catch (err: any) {
        console.error('Error fetching module data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchModuleAndQuizzes()
  }, [moduleId])

  // 2. Fetch Lesson for the active Quiz
  useEffect(() => {
    const fetchLesson = async () => {
      const currentQuiz = quizzes[activeQuizIndex]
      if (!currentQuiz) return

      try {
        setLessonLoading(true)
        const { data: lesson, error: lessonError } = await supabase
          .schema('kasa_learn_journey')
          .from('lesson')
          .select('*')
          .eq('quiz_id', currentQuiz.id)
          .maybeSingle()

        if (lessonError) throw lessonError

        if (lesson) {
          setLessonData({
            ...lesson,
            xp: currentQuiz.xp,
            duration: moduleData?.estimated_time_in_minutes || 5
          })
        } else {
          setLessonData({
            title: 'Sin Contenido',
            text: 'Esta etapa no tiene material de lectura disponible. Puedes probar directamente el examen.',
            level: 'Básico',
            xp: currentQuiz.xp,
            duration: moduleData?.estimated_time_in_minutes || 5
          })
        }
      } catch (err: any) {
        console.error('Error fetching lesson:', err)
      } finally {
        setLessonLoading(false)
      }
    }

    if (quizzes.length > 0) {
      fetchLesson()
    }
  }, [quizzes, activeQuizIndex, moduleData])

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-kasa-body text-white min-h-screen">
      <div className="animate-pulse text-lg font-bold">Cargando módulo...</div>
    </div>
  )

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-kasa-body p-6 text-center min-h-screen">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl max-w-md">
        <p className="text-red-500 mb-6 font-bold">{error}</p>
        <Button onClick={() => router.push('/sections')} variant="secondary" fullWidth>
          Volver a Secciones
        </Button>
      </div>
    </div>
  )

  const currentQuiz = quizzes[activeQuizIndex]

  return (
    <div className="flex flex-col min-h-screen lg:flex-row bg-kasa-body text-white">
      <MainNav />

      <main className="flex-1 p-6 pb-[calc(80px+120px)] w-full lg:pb-[120px]">
        <div className="max-w-[700px] mx-auto">
          {/* Header */}
          <header className="py-6 flex items-center justify-between mb-8 border-b border-white/5 sticky top-0 bg-kasa-body/95 backdrop-blur-md z-10 px-4 -mx-4">
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
              <span className="text-xs text-kasa-primary font-bold">{lessonData?.xp || 0} XP</span>
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
                  Paso {q.quiz_number || idx + 1}
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

            {lessonData && (
              <article className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-4xl font-black leading-tight mb-8 text-white tracking-tight" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-12 mb-6 text-white border-b border-white/5 pb-2" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-8 mb-4 text-white" {...props} />,
                    p: ({ node, ...props }) => <p className="text-lg text-white/90 mb-6 leading-relaxed font-medium" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-none flex flex-col gap-5 my-8" {...props} />,
                    li: ({ node, ...props }) => {
                      const { ref, ...liProps } = props as any;
                      return (
                        <li className="flex gap-4 items-start bg-white/[0.03] p-4 rounded-2xl border border-white/[0.05]" {...liProps}>
                          <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-emerald-500/20">
                            <CheckIcon />
                          </div>
                          <div className="text-base text-white/80 leading-snug">{props.children}</div>
                        </li>
                      );
                    },
                    strong: ({ node, ...props }) => <strong className="text-kasa-primary font-black" {...props} />,
                    blockquote: ({ node, ...props }) => {
                      const { ref, ...bqProps } = props as any;
                      return (
                        <div className="bg-kasa-primary/10 border-l-4 border-kasa-primary rounded-2xl p-6 my-10 relative overflow-hidden group" {...bqProps}>
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <LightbulbIcon />
                          </div>
                          <div className="flex items-center gap-3 text-kasa-primary text-[10px] font-black uppercase tracking-widest mb-4">
                            <LightbulbIcon />
                            Concepto Clave
                          </div>
                          <div className="text-lg italic text-white/90 leading-relaxed font-semibold relative z-10">{props.children}</div>
                        </div>
                      );
                    }
                  }}
                >
                  {lessonData.text}
                </ReactMarkdown>

                {/* Meta Footer */}
                <div className="flex flex-wrap gap-6 mt-12 py-8 border-t border-white/5 text-sm font-bold text-white/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                      <ClockIcon />
                    </div>
                    <span>{lessonData.duration} minutos de lectura</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                      <StarIcon />
                    </div>
                    <span>{lessonData.level || 'Nivel Básico'}</span>
                  </div>
                </div>

                {/* Transition Hint */}
                <div className="text-center text-white/20 text-xs font-bold uppercase tracking-[0.3em] mt-4 mb-20 flex flex-col items-center gap-4">
                  <span>¿Todo claro? Presiona el botón para comenzar</span>
                  <div className="animate-bounce">
                    <ChevronDownIcon />
                  </div>
                </div>
              </article>
            )}
          </div>

          {/* Sticky Action Footer */}
          <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-0 w-full px-6 py-8 bg-gradient-to-t from-kasa-body via-kasa-body/95 to-transparent z-50 flex flex-col items-center gap-4 lg:left-[260px] lg:w-[calc(100%-260px)]">
            <Link href={`/quiz/${currentQuiz?.id}`} className="w-full max-w-[420px] no-underline">
              <Button fullWidth size="lg" className="h-16 rounded-2xl text-lg font-black tracking-wide shadow-xl shadow-kasa-primary/25 gap-3 group">
                COMENZAR EXAMEN
                <FileIcon />
              </Button>
            </Link>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Gana hasta {lessonData?.xp} XP</p>
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
    <Suspense fallback={<div className="min-h-screen bg-kasa-body flex items-center justify-center text-white font-bold">Cargando...</div>}>
      <LessonContent />
    </Suspense>
  )
}
