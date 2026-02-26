'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QuizContainer } from '@/components/quiz'
import { Question } from '@/types'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/context/UserContext'

const supabase = createClient()

function QuizContent() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  const { user: appUser, loading: userLoading } = useUser()

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)
  const [quizMetadata, setQuizMetadata] = useState<any>(null)

  useEffect(() => {
    const fetchQuizData = async () => {
      // Esperar a que el usuario esté cargado para evitar peticiones sin auth
      if (!quizId || userLoading || !appUser?.id) return

      try {
        console.log(`🚀 [QuizPage] Iniciando carga de preguntas para examen: ${quizId}`);
        setLoading(true)

        // 1. Get Quizz Metadata
        const { data: qMeta, error: mError } = await supabase
          .schema('kasa_learn_journey')
          .from('quizz')
          .select('*, module:module_id(id, section_id)')
          .eq('id', quizId)
          .maybeSingle()

        if (mError || !qMeta) {
          throw new Error('No se pudo encontrar la metadata del examen.')
        }
        setQuizMetadata(qMeta)

        // 2. Get all base questions
        const { data: baseQuestions, error: qError } = await supabase
          .schema('kasa_learn_journey')
          .from('question')
          .select('id, question_type')
          .eq('quizz_id', quizId)

        if (qError || !baseQuestions || baseQuestions.length === 0) {
          setError('No hay preguntas configuradas para este examen.')
          return
        }

        // 3. Optimized Fetching: Batch by type
        const typeGroups = {
          choice: baseQuestions.filter(q => q.question_type === 'choice').map(q => q.id),
          cloze: baseQuestions.filter(q => q.question_type === 'cloze').map(q => q.id),
          input: baseQuestions.filter(q => q.question_type === 'input' || q.question_type === 'input_question').map(q => q.id),
          pairs: baseQuestions.filter(q => q.question_type === 'pairs').map(q => q.id),
        }

        const [choicesRes, clozesRes, inputsRes, pairsRes] = await Promise.all([
          typeGroups.choice.length > 0
            ? supabase.schema('kasa_learn_journey').from('choice').select('*').in('question_id', typeGroups.choice)
            : Promise.resolve({ data: [] }),
          typeGroups.cloze.length > 0
            ? supabase.schema('kasa_learn_journey').from('cloze').select('*').in('question_id', typeGroups.cloze)
            : Promise.resolve({ data: [] }),
          typeGroups.input.length > 0
            ? supabase.schema('kasa_learn_journey').from('input_question').select('*').in('question_id', typeGroups.input)
            : Promise.resolve({ data: [] }),
          typeGroups.pairs.length > 0
            ? supabase.schema('kasa_learn_journey').from('pairs').select('*').in('question_id', typeGroups.pairs)
            : Promise.resolve({ data: [] })
        ])

        const detailedQuestions: Question[] = []

        // Process Choices
        choicesRes.data?.forEach(data => {
          const correctIndex = data.answers.indexOf(data.correct_answers)
          detailedQuestions.push({
            id: data.question_id,
            type: 'choice',
            title: data.question || 'Selecciona la respuesta correcta',
            options: data.answers || [],
            correct: correctIndex >= 0 ? correctIndex : 0
          })
        })

        // Process Cloze
        clozesRes.data?.forEach(data => {
          let sentence = (data.words || []).join(' ')
          const correct = data.correct_words || []
          if (!sentence.includes('[gap]')) {
            correct.forEach((word: string) => {
              sentence = sentence.replace(word, '[gap]')
            })
          }
          detailedQuestions.push({
            id: data.question_id,
            type: 'cloze',
            title: data.question || 'Completa la oración correctamente',
            sentence: sentence,
            pool: data.words || [],
            correct: correct
          })
        })

        // Process Input
        inputsRes.data?.forEach(data => {
          detailedQuestions.push({
            id: data.question_id,
            type: 'input',
            title: data.question || 'Escribe la respuesta correcta',
            placeholder: 'Escribe aquí...',
            correct: (data.correct_answers && data.correct_answers.length > 0) ? data.correct_answers[0] : ''
          })
        })

        // Process Pairs
        pairsRes.data?.forEach(data => {
          const shuffledRight = [...(data.right_words || [])].sort(() => 0.5 - Math.random())
          detailedQuestions.push({
            id: data.question_id,
            type: 'pairs',
            title: data.question || 'Conecta cada concepto con su definición',
            leftWords: data.left_words || [],
            rightWords: shuffledRight,
            correctRelations: data.correct_relations || {}
          })
        })

        const shuffled = [...detailedQuestions].sort(() => 0.5 - Math.random())
        const selectionSize = Math.min(7, Math.max(1, shuffled.length))
        const selected = shuffled.slice(0, selectionSize)

        setQuestions(selected)
      } catch (err: any) {
        console.error('💥 [QuizData] Error fatal:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizData()
  }, [quizId, appUser?.id, userLoading])

  const handleQuit = () => {
    router.back()
  }

  // Mientras carga el usuario o los datos, mostramos el spinner
  if (userLoading || (loading && !error)) return (
    <div className="min-h-screen bg-[#101a28] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-kasa-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl font-bold animate-pulse">Preparando examen...</p>
      </div>
    </div>
  )

  if (error || questions.length === 0) return (
    <div className="min-h-screen bg-[#101a28] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white/5 border border-white/10 p-10 rounded-3xl max-w-md">
        <p className="text-red-400 mb-6 font-bold">{error || 'No hay preguntas disponibles.'}</p>
        <Button onClick={handleQuit} variant="secondary" fullWidth>Volver atrás</Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-transparent flex flex-col overflow-x-hidden relative">
      <QuizContainer
        questions={questions}
        onQuit={handleQuit}
        quizId={quizId}
        quizMetadata={quizMetadata}
      />
    </div>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#101a28]" />}>
      <QuizContent />
    </Suspense>
  )
}
