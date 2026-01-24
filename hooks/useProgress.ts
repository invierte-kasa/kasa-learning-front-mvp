'use client'

import { useState, useCallback } from 'react'

interface ProgressState {
  currentModule: string | null
  completedModules: string[]
  currentLesson: string | null
  completedLessons: string[]
  quizScores: Record<string, number>
}

interface UseProgressReturn extends ProgressState {
  markModuleComplete: (moduleId: string) => void
  markLessonComplete: (lessonId: string) => void
  saveQuizScore: (quizId: string, score: number) => void
  getModuleProgress: (moduleId: string) => number
  reset: () => void
}

const initialState: ProgressState = {
  currentModule: '3',
  completedModules: ['1', '2'],
  currentLesson: '1',
  completedLessons: [],
  quizScores: {},
}

export function useProgress(): UseProgressReturn {
  const [state, setState] = useState<ProgressState>(initialState)

  const markModuleComplete = useCallback((moduleId: string) => {
    setState((prev) => ({
      ...prev,
      completedModules: [...new Set([...prev.completedModules, moduleId])],
    }))
  }, [])

  const markLessonComplete = useCallback((lessonId: string) => {
    setState((prev) => ({
      ...prev,
      completedLessons: [...new Set([...prev.completedLessons, lessonId])],
    }))
  }, [])

  const saveQuizScore = useCallback((quizId: string, score: number) => {
    setState((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [quizId]: Math.max(prev.quizScores[quizId] || 0, score),
      },
    }))
  }, [])

  const getModuleProgress = useCallback(
    (moduleId: string) => {
      // Mock calculation - in real app would calculate based on lessons/quizzes
      if (state.completedModules.includes(moduleId)) return 100
      if (state.currentModule === moduleId) return 50
      return 0
    },
    [state.completedModules, state.currentModule]
  )

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    ...state,
    markModuleComplete,
    markLessonComplete,
    saveQuizScore,
    getModuleProgress,
    reset,
  }
}
