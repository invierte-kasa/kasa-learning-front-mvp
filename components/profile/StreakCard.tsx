'use client'

import { BadgePill } from '../ui/StatusPill'

// Check icon
const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

interface StreakCardProps {
  streak: number
  days: string[]
}

export function StreakCard({ streak, days }: StreakCardProps) {
  return (
    <section className="bg-kasa-card border border-kasa-border rounded-card p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2.5 text-xl font-extrabold text-white">
          <span className="text-2xl">🔥</span>
          Racha de {streak} dias
        </div>
        <BadgePill variant="success">¡IMPARABLE!</BadgePill>
      </div>

      <div className="flex justify-between gap-2">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-2.5">
            <div className="w-9 h-9 bg-kasa-primary text-black rounded-full flex items-center justify-center font-extrabold text-sm">
              {day}
            </div>
            <div className="w-[18px] h-[18px] bg-kasa-primary rounded-full flex items-center justify-center text-black">
              <CheckIcon />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
