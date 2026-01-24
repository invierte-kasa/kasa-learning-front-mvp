'use client'

import Link from 'next/link'
import { QuizResult } from '@/types'

// Icons
const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const BoltIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
  </svg>
)

const FireIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2v20M2 12h20"></path>
  </svg>
)

const BadgeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
)

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)

const FloatingHomeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)

interface ResultsScreenProps {
  result: QuizResult
}

export function ResultsScreen({ result }: ResultsScreenProps) {
  return (
    <div className="flex flex-col animate-[fadeIn_0.5s_ease-out] pb-8">
      {/* Header */}
      <div className="text-center my-6 mb-10">
        <div className="w-[90px] h-[90px] border-4 border-kasa-primary rounded-full flex items-center justify-center text-kasa-primary mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-kasa-primary/10">
          <CheckIcon />
        </div>
        <h1 className="text-4xl font-black mb-2 text-white">Excellent!</h1>
        <p className="text-kasa-primary font-bold text-lg">You passed the module</p>
      </div>

      {/* Score card */}
      <div className="bg-kasa-card rounded-3xl p-6 w-full flex justify-between items-center mb-4 border border-kasa-border">
        <div>
          <h5 className="text-xs text-text-muted uppercase tracking-widest mb-2">Total Score</h5>
          <div className="text-3xl font-extrabold text-white">
            {result.correctAnswers}/{result.totalQuestions}
          </div>
        </div>
        <div className="text-4xl font-black text-kasa-primary">{result.percentage}%</div>
      </div>

      {/* Rewards grid */}
      <div className="grid grid-cols-3 gap-3 w-full mb-6">
        <div className="bg-kasa-card border border-kasa-border rounded-2xl py-5 px-2 text-center flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-kasa-primary/10 text-kasa-primary">
            <BoltIcon />
          </div>
          <span className="text-xs font-bold text-text-muted">+{result.xpEarned} XP</span>
        </div>
        <div className="bg-kasa-card border border-kasa-border rounded-2xl py-5 px-2 text-center flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-amber-500/10 text-amber-500">
            <FireIcon />
          </div>
          <span className="text-xs font-bold text-text-muted">+{result.streakBonus} Streak</span>
        </div>
        <div className="bg-kasa-card border border-kasa-border rounded-2xl py-5 px-2 text-center flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-blue-500/10 text-blue-500">
            <BadgeIcon />
          </div>
          <span className="text-xs font-bold text-text-muted">+1 Badge</span>
        </div>
      </div>

      {/* Upgrade card */}
      <div className="bg-[#1a273a] rounded-3xl p-6 w-full border border-kasa-primary/20 relative mb-8">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h4 className="text-lg font-extrabold mb-1 text-white">Your Casa Upgraded!</h4>
            <p className="text-sm text-text-muted">New solar panels installed</p>
          </div>
          <HomeIcon />
        </div>

        <div className="w-full h-[180px] bg-[#0c121e] rounded-2xl overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1000"
            alt="Upgraded Casa"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute bottom-3 left-3 bg-kasa-primary/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[0.65rem] font-extrabold uppercase">
            LVL 12 NEIGHBORHOOD
          </div>
        </div>

        <div className="absolute -bottom-4 right-4 w-[50px] h-[50px] bg-kasa-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] border-4 border-[#1a273a] text-white">
          <FloatingHomeIcon />
        </div>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-3">
        <Link
          href="/sections"
          className="bg-kasa-primary text-white py-4 rounded-2xl font-extrabold text-center no-underline shadow-[0_4px_0_var(--primary-dark)]"
        >
          Next Module
        </Link>
        <Link
          href="/quiz/1"
          className="bg-transparent text-white py-4 rounded-2xl font-extrabold text-center no-underline border-2 border-kasa-border"
        >
          Retry Quiz
        </Link>
      </div>
    </div>
  )
}
