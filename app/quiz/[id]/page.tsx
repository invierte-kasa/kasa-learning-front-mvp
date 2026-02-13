'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QuizContainer } from '@/components/quiz'
import { Question } from '@/types'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

function QuizContent() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return

      try {
        setLoading(true)

        // 1. Get all base questions for this quiz
        const { data: baseQuestions, error: qError } = await supabase
          .schema('kasa_learn_journey')
          .from('question')
          .select('id, question_type')
          .eq('quizz_id', quizId)

        if (qError) throw qError

        if (!baseQuestions || baseQuestions.length === 0) {
          setError('No hay preguntas configuradas para este examen.')
          return
        }

        // 2. Fetch specific details for each question in parallel
        const detailedQuestions: Question[] = []

        for (const q of baseQuestions) {
          let detailed: any = null

          if (q.question_type === 'choice') {
            const { data } = await supabase
              .schema('kasa_learn_journey')
              .from('choice')
              .select('*')
              .eq('question_id', q.id)
              .maybeSingle()

            if (data) {
              const correctIndex = data.answers.indexOf(data.correct_answers)
              detailed = {
                id: q.id,
                type: 'choice',
                title: data.question || 'Selecciona la respuesta correcta',
                options: data.answers || [],
                correct: correctIndex >= 0 ? correctIndex : 0
              }
            }
          } else if (q.question_type === 'cloze') {
            const { data } = await supabase
              .schema('kasa_learn_journey')
              .from('cloze')
              .select('*')
              .eq('question_id', q.id)
              .maybeSingle()

            if (data) {
              let sentence = (data.words || []).join(' ')
              const correct = data.correct_words || []

              // Ensure the sentence has the required [gap] format for the frontend
              if (!sentence.includes('[gap]')) {
                correct.forEach((word: string) => {
                  sentence = sentence.replace(word, '[gap]')
                })
              }

              detailed = {
                id: q.id,
                type: 'cloze',
                title: data.question || 'Completa la oración correctamente',
                sentence: sentence,
                pool: data.words || [],
                correct: correct
              }
            }
          } else if (q.question_type === 'input' || q.question_type === 'input_question') {
            const { data } = await supabase
              .schema('kasa_learn_journey')
              .from('input_question')
              .select('*')
              .eq('question_id', q.id)
              .maybeSingle()

            if (data) {
              detailed = {
                id: q.id,
                type: 'input',
                title: data.question || 'Escribe la respuesta correcta',
                placeholder: 'Escribe aquí...',
                correct: (data.correct_answers && data.correct_answers.length > 0) ? data.correct_answers[0] : ''
              }
            }
          }

          if (detailed) {
            detailedQuestions.push(detailed)
          }
        }

        // 3. APPLY RANDOM LOGIC: Shuffle and pick 1-10
        // Shuffling the questions
        const shuffled = [...detailedQuestions].sort(() => 0.5 - Math.random())

        // Picking between 1 and 10 questions based on availability
        const selectionSize = Math.min(10, Math.max(1, shuffled.length))
        const selected = shuffled.slice(0, selectionSize)

        console.log(`✅ [QuizData] Cargadas ${selected.length} preguntas de un total de ${detailedQuestions.length}`)
        setQuestions(selected)

      } catch (err: any) {
        console.error('💥 [QuizData] Error fatal:', err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizData()
  }, [quizId])

  const handleQuit = () => {
    router.back()
  }

  if (loading) return (
    <div className="min-h-screen bg-kasa-body flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-kasa-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl font-bold animate-pulse">Preparando examen...</p>
      </div>
    </div>
  )

  if (error || questions.length === 0) return (
    <div className="min-h-screen bg-kasa-body flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white/5 border border-white/10 p-10 rounded-3xl max-w-md">
        <p className="text-red-400 mb-6 font-bold">{error || 'No hay preguntas disponibles.'}</p>
        <Button onClick={handleQuit} variant="secondary" fullWidth>Volver atrás</Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-kasa-body flex flex-col overflow-x-hidden">
      <QuizContainer questions={questions} onQuit={handleQuit} />
    </div>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-kasa-body" />}>
      <QuizContent />
    </Suspense>
  )
}
