'use client'

import { ProgressBar } from '../ui/ProgressBar'

interface XPCardProps {
  currentXP: number
  targetXP: number
  currentLevel: number
}

export function XPCard({ currentXP, targetXP, currentLevel }: XPCardProps) {
  const remaining = targetXP - currentXP
  const nextLevel = currentLevel + 1

  return (
    <section className="bg-kasa-card border border-kasa-border rounded-card p-6 mb-6">
      <p className="text-sm text-text-muted mb-2">Faltan {remaining} XP para el Nivel {nextLevel}</p>
      <div className="flex justify-between items-end mb-4">
        <span className="text-lg font-extrabold text-white">Experiencia</span>
        <span className="text-kasa-primary font-black text-base">
          {currentXP.toLocaleString()} / {targetXP.toLocaleString()} XP
        </span>
      </div>
      <ProgressBar value={currentXP} max={targetXP} size="lg" />
    </section>
  )
}
