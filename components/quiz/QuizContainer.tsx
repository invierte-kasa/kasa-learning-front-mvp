'use client'

import { useState, useCallback } from 'react'
import { Question, QuizResult, ChoiceQuestion, ClozeQuestion, InputQuestion } from '@/types'
import { ProgressBar } from '../ui/ProgressBar'
import { QuestionChoice } from './QuestionChoice'
import { QuestionCloze } from './QuestionCloze'
import { QuestionInput } from './QuestionInput'
import { FeedbackOverlay } from './FeedbackOverlay'
import { ResultsScreen } from './ResultsScreen'
import { normalizeString } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/context/UserContext'

// Icons
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

interface FilledGap {
  word: string
  poolIdx: number
}

interface QuizContainerProps {
  questions: Question[]
  onQuit?: () => void
  quizId: string
  quizMetadata: any
}

const supabase = createClient()

export function QuizContainer({ questions, onQuit, quizId, quizMetadata }: QuizContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [filledGaps, setFilledGaps] = useState<(FilledGap | null)[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showResults, setShowResults] = useState(false)

  // Para guardar las respuestas detalle
  const [userAnswers, setUserAnswers] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const currentQuestion = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100

  // Initialize cloze gaps when question changes
  const initializeCloze = useCallback((question: ClozeQuestion) => {
    const gapCount = (question.sentence.match(/\[gap\]/g) || []).length
    setFilledGaps(Array(gapCount).fill(null))
  }, [])

  // Check if answer can be submitted
  const canSubmit = useCallback(() => {
    if (!currentQuestion) return false

    switch (currentQuestion.type) {
      case 'choice':
        return selectedOption !== null
      case 'input':
        return inputValue.trim().length > 0
      case 'cloze':
        return filledGaps.every((g) => g !== null)
      default:
        return false
    }
  }, [currentQuestion, selectedOption, inputValue, filledGaps])

  // Validate answer
  const checkAnswer = useCallback(() => {
    if (!currentQuestion) return false

    switch (currentQuestion.type) {
      case 'choice': {
        const q = currentQuestion as ChoiceQuestion
        return selectedOption === q.correct
      }
      case 'input': {
        const q = currentQuestion as InputQuestion
        const normalized = normalizeString(inputValue)
        const expected = normalizeString(q.correct)
        return normalized === expected || normalized.includes(expected)
      }
      case 'cloze': {
        const q = currentQuestion as ClozeQuestion
        return filledGaps.every((g, i) => g && g.word === q.correct[i])
      }
      default:
        return false
    }
  }, [currentQuestion, selectedOption, inputValue, filledGaps])

  // Handle check button
  const handleCheck = () => {
    const correct = checkAnswer()
    setIsCorrect(correct)

    // Guardar respuesta del usuario
    let answerText = ""
    if (currentQuestion.type === 'choice') answerText = (currentQuestion as ChoiceQuestion).options[selectedOption!]
    else if (currentQuestion.type === 'input') answerText = inputValue
    else if (currentQuestion.type === 'cloze') answerText = filledGaps.map(g => g?.word).join(', ')

    setUserAnswers(prev => [...prev, {
      question_id: currentQuestion.id,
      user_answer: answerText,
      is_correct: correct
    }])

    if (correct) {
      setCorrectCount((prev) => prev + 1)
    }
    setShowFeedback(true)
  }

  // Handle continue after feedback
  const handleContinue = async () => {
    const nextIndex = currentIndex + 1

    if (nextIndex >= questions.length) {
      await finalizeQuiz()
    } else {
      setCurrentIndex(nextIndex)
      setSelectedOption(null)
      setInputValue('')
      setShowFeedback(false)

      const nextQuestion = questions[nextIndex]
      if (nextQuestion.type === 'cloze') {
        initializeCloze(nextQuestion as ClozeQuestion)
      } else {
        setFilledGaps([])
      }
    }
  }

  const { user: appUser } = useUser()

  const finalizeQuiz = async () => {
    setIsSaving(true)
    try {
      if (!appUser?.id) {
        throw new Error("No se pudo obtener tu perfil de aprendizaje. Verifica las políticas de seguridad (RLS).")
      }
      const internalId = appUser.id

      const score = (correctCount / questions.length) * 100
      const passed = score >= (quizMetadata?.minimum_score || 70)
      const xpEarned = passed ? (quizMetadata?.xp || 0) : 0

      // 1. Guardar Intento
      const { data: attempt, error: attemptError } = await supabase
        .schema('kasa_learn_journey')
        .from('user_quizz_attempt')
        .insert({
          user_id: internalId,
          quizz_id: quizId,
          score: score,
          passed: passed,
          xp_earned: xpEarned
        })
        .select()
        .maybeSingle()

      if (attemptError) throw attemptError

      // 2. Guardar Respuestas detalle
      const detailAnswers = userAnswers.map(ans => ({
        user_id: internalId,
        quizz_attempt_id: attempt.id,
        question_id: ans.question_id,
        user_answer: ans.user_answer,
        is_correct: ans.is_correct
      }))

      await supabase
        .schema('kasa_learn_journey')
        .from('user_question_answer')
        .insert(detailAnswers)

      // 3. Si pasó, actualizar progresión
      if (passed) {
        // Actualizar XP del usuario
        const { data: userData } = await supabase
          .schema('kasa_learn_journey')
          .from('user')
          .select('xp')
          .eq('id', internalId)
          .maybeSingle()

        await supabase
          .schema('kasa_learn_journey')
          .from('user')
          .update({ xp: (userData?.xp || 0) + xpEarned })
          .eq('id', internalId)

        // Marcar módulo como completado
        const moduleId = quizMetadata.module_id || quizMetadata.module?.id
        await supabase
          .schema('kasa_learn_journey')
          .from('user_module_progress')
          .upsert({
            user_id: internalId,
            module_id: moduleId,
            status: 'completed',
            xp_earned: xpEarned,
            completed_at: new Date().toISOString()
          }, { onConflict: 'user_id, module_id' })

        // Buscar el SIGUIENTE módulo o sección
        const sectionId = quizMetadata.module?.section_id
        const { data: nextModules } = await supabase
          .schema('kasa_learn_journey')
          .from('module')
          .select('id, module_number')
          .eq('section_id', sectionId)
          .order('module_number', { ascending: true })

        const currentMod = nextModules?.find(m => m.id === moduleId)
        const nextMod = nextModules?.find(m => m.module_number === (currentMod?.module_number + 1))

        if (nextMod) {
          // Hay siguiente módulo en la misma sección
          await supabase
            .schema('kasa_learn_journey')
            .from('progress')
            .upsert({
              user_id: internalId,
              current_module: nextMod.id,
              module_percentage_completion: 0
            }, { onConflict: 'user_id' })
        } else {
          // No hay más módulos, completar sección y buscar siguiente sección
          await supabase
            .schema('kasa_learn_journey')
            .from('user_section_progress')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('user_id', internalId)
            .eq('section_id', sectionId)

          const { data: currentSec } = await supabase
            .schema('kasa_learn_journey')
            .from('section')
            .select('level')
            .eq('id', sectionId)
            .single()

          const { data: nextSec } = await supabase
            .schema('kasa_learn_journey')
            .from('section')
            .select('id')
            .eq('level', (currentSec?.level || 0) + 1)
            .maybeSingle()

          if (nextSec) {
            // Obtener primer módulo de la nueva sección
            const { data: firstModOfNextSec } = await supabase
              .schema('kasa_learn_journey')
              .from('module')
              .select('id')
              .eq('section_id', nextSec.id)
              .order('module_number', { ascending: true })
              .limit(1)
              .maybeSingle()

            await supabase
              .schema('kasa_learn_journey')
              .from('progress')
              .upsert({
                user_id: internalId,
                current_section: nextSec.id,
                current_module: firstModOfNextSec?.id || null,
                section_percentage_completion: 0
              }, { onConflict: 'user_id' })
          }
        }
      }

      setShowResults(true)
    } catch (err) {
      console.error("Error saving quiz progress:", err)
      alert("Hubo un error guardando tu progreso. Por favor intenta de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cloze word selection
  const handleSelectWord = (word: string, poolIndex: number) => {
    const emptyGapIdx = filledGaps.findIndex((g) => g === null)
    if (emptyGapIdx !== -1) {
      const newGaps = [...filledGaps]
      newGaps[emptyGapIdx] = { word, poolIdx: poolIndex }
      setFilledGaps(newGaps)
    }
  }

  // Handle cloze gap clear
  const handleClearGap = (gapIndex: number) => {
    if (filledGaps[gapIndex]) {
      const newGaps = [...filledGaps]
      newGaps[gapIndex] = null
      setFilledGaps(newGaps)
    }
  }

  // Show results
  if (showResults) {
    const result: QuizResult = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      percentage: Math.round((correctCount / questions.length) * 100),
      xpEarned: (correctCount / questions.length) >= 0.7 ? (quizMetadata?.xp || 250) : 0,
      streakBonus: 1,
    }
    return (
      <div className="max-w-[600px] w-full mx-auto flex-1 flex flex-col p-6">
        <ResultsScreen result={result} />
      </div>
    )
  }

  if (isSaving) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-kasa-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-bold">Guardando tu progreso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[600px] w-full mx-auto flex-1 flex flex-col p-6">
      {/* Header */}
      <header className="flex items-center gap-6 mb-10 pt-4">
        <button onClick={onQuit} className="bg-transparent border-none text-text-muted cursor-pointer flex items-center">
          <CloseIcon />
        </button>
        <div className="flex-1">
          <ProgressBar value={progress} size="lg" showGlow />
        </div>
      </header>

      {/* Question content */}
      <div className="flex-1 flex flex-col">
        {currentQuestion?.type === 'choice' && (
          <QuestionChoice
            question={currentQuestion.title}
            options={(currentQuestion as ChoiceQuestion).options}
            selectedOption={selectedOption}
            onSelect={setSelectedOption}
          />
        )}

        {currentQuestion?.type === 'cloze' && (
          <QuestionCloze
            question={currentQuestion.title}
            sentence={(currentQuestion as ClozeQuestion).sentence}
            pool={(currentQuestion as ClozeQuestion).pool}
            filledGaps={filledGaps}
            onSelectWord={handleSelectWord}
            onClearGap={handleClearGap}
          />
        )}

        {currentQuestion?.type === 'input' && (
          <QuestionInput
            question={currentQuestion.title}
            placeholder={(currentQuestion as InputQuestion).placeholder}
            value={inputValue}
            onChange={setInputValue}
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-kasa-border py-6 mt-8 flex justify-end">
        <button
          onClick={handleCheck}
          disabled={!canSubmit()}
          className="bg-kasa-primary text-white border-none rounded-xl py-4 px-10 font-extrabold text-base cursor-pointer transition-all shadow-[0_4px_0_#059669] disabled:bg-kasa-card disabled:text-text-disabled disabled:shadow-none disabled:cursor-not-allowed active:translate-y-0.5 active:shadow-[0_2px_0_#059669]"
        >
          COMPROBAR
        </button>
      </div>

      {/* Feedback overlay */}
      {showFeedback && (
        <FeedbackOverlay isCorrect={isCorrect} onContinue={handleContinue} />
      )}
    </div>
  )
}
