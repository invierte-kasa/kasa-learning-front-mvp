'use client'

import { QuizResult } from '@/types'

// Icons
const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const SadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
)

const BoltIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
  </svg>
)

const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
)

const RetryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6"></path>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
    <path d="M3 22v-6h6"></path>
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
  </svg>
)

interface ResultsScreenProps {
  result: QuizResult
  passed: boolean
  onNextModule: () => void
  onRetryQuiz: () => void
}

export function ResultsScreen({ result, passed, onNextModule, onRetryQuiz }: ResultsScreenProps) {
  return (
    <div className="flex flex-col animate-[fadeIn_0.5s_ease-out] pb-8">
      {/* Header */}
      <div className="text-center my-6 mb-10">
        <div className={`w-[90px] h-[90px] border-4 rounded-full flex items-center justify-center mx-auto mb-6 ${passed
            ? 'border-kasa-primary text-kasa-primary shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-kasa-primary/10'
            : 'border-red-400 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)] bg-red-500/10'
          }`}>
          {passed ? <CheckIcon /> : <SadIcon />}
        </div>
        <h1 className="text-4xl font-black mb-2 text-white">
          {passed ? '¡Excelente!' : '¡Sigue intentando!'}
        </h1>
        <p className={`font-bold text-lg ${passed ? 'text-kasa-primary' : 'text-red-400'}`}>
          {passed ? 'Aprobaste el módulo' : 'No alcanzaste el puntaje mínimo'}
        </p>
      </div>

      {/* Score card */}
      <div className="bg-kasa-card rounded-3xl p-6 w-full flex justify-between items-center mb-4 border border-kasa-border">
        <div>
          <h5 className="text-xs text-text-muted uppercase tracking-widest mb-2">Puntaje Total</h5>
          <div className="text-3xl font-extrabold text-white">
            {result.correctAnswers}/{result.totalQuestions}
          </div>
        </div>
        <div className={`text-4xl font-black ${passed ? 'text-kasa-primary' : 'text-red-400'}`}>{result.percentage}%</div>
      </div>

      {/* Rewards grid - 2 columns: XP earned + Ranking */}
      <div className="grid grid-cols-2 gap-3 w-full mb-8">
        <div className="bg-kasa-card border border-kasa-border rounded-2xl py-5 px-3 text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1 bg-kasa-primary/10 text-kasa-primary">
            <BoltIcon />
          </div>
          <span className="text-lg font-extrabold text-white">+{result.xpEarned} XP</span>
          <span className="text-xs text-text-muted">
            Total: {result.totalXp} XP
          </span>
        </div>
        <div className="bg-kasa-card border border-kasa-border rounded-2xl py-5 px-3 text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1 bg-amber-500/10 text-amber-500">
            <TrophyIcon />
          </div>
          <span className="text-lg font-extrabold text-white">
            {result.rankPosition ? `#${result.rankPosition}` : '-'}
          </span>
          <span className="text-xs text-text-muted">Tu posición en el ranking</span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-3">
        {passed ? (
          <button
            onClick={onNextModule}
            className="bg-kasa-primary text-white py-4 rounded-2xl font-extrabold text-center shadow-[0_4px_0_var(--primary-dark)] flex items-center justify-center gap-2 active:translate-y-0.5 active:shadow-[0_2px_0_var(--primary-dark)] transition-all cursor-pointer border-none text-base"
          >
            Siguiente Módulo
            <ArrowRightIcon />
          </button>
        ) : null}
        <button
          onClick={onRetryQuiz}
          className="bg-transparent text-white py-4 rounded-2xl font-extrabold text-center border-2 border-kasa-border flex items-center justify-center gap-2 hover:bg-kasa-hover transition-all cursor-pointer text-base"
        >
          <RetryIcon />
          Reintentar Quiz
        </button>
      </div>
    </div>
  )
}
