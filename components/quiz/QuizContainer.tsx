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
}

export function QuizContainer({ questions, onQuit }: QuizContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [filledGaps, setFilledGaps] = useState<(FilledGap | null)[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100

  // Initialize cloze gaps when question changes
  const initializeCloze = useCallback((question: ClozeQuestion) => {
    const gapCount = (question.sentence.match(/\[gap\]/g) || []).length
    setFilledGaps(Array(gapCount).fill(null))
  }, [])

  // Reset state for new question
  const resetState = useCallback(() => {
    setSelectedOption(null)
    setInputValue('')
    setShowFeedback(false)

    if (currentIndex < questions.length) {
      const nextQuestion = questions[currentIndex]
      if (nextQuestion.type === 'cloze') {
        initializeCloze(nextQuestion as ClozeQuestion)
      } else {
        setFilledGaps([])
      }
    }
  }, [currentIndex, questions, initializeCloze])

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
    if (correct) {
      setCorrectCount((prev) => prev + 1)
    }
    setShowFeedback(true)
  }

  // Handle continue after feedback
  const handleContinue = () => {
    const nextIndex = currentIndex + 1
    setCurrentIndex(nextIndex)

    if (nextIndex >= questions.length) {
      setShowResults(true)
    } else {
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
      xpEarned: 250,
      streakBonus: 1,
    }
    return (
      <div className="max-w-[600px] w-full mx-auto flex-1 flex flex-col p-6">
        <ResultsScreen result={result} />
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
