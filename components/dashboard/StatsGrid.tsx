'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ProgressBar } from '../ui/ProgressBar'
import { UserStats } from '@/types'
import { formatXP } from '@/lib/utils'

interface StatsGridProps extends HTMLAttributes<HTMLElement> {
  stats: UserStats
}

const StatsGrid = forwardRef<HTMLElement, StatsGridProps>(
  ({ className, stats, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          'flex bg-kasa-card border border-kasa-border rounded-2xl p-4 mb-10 gap-4',
          'lg:p-6 lg:gap-8',
          className
        )}
        {...props}
      >
        {/* Level */}
        <div className="flex-1 flex flex-col items-center justify-center border-r border-kasa-border">
          <span className="stat-label">Level</span>
          <span className="stat-value">{stats.level}</span>
        </div>

        {/* Streak */}
        <div className="flex-1 flex flex-col items-center justify-center border-r border-kasa-border">
          <span className="stat-label">Streak</span>
          <span className="stat-value">{stats.streak} 🔥</span>
        </div>

        {/* XP */}
        <div className="flex-[1.5] flex flex-col items-center lg:items-start">
          <span className="stat-label">XP</span>
          <span className="text-xl font-extrabold text-white">
            {stats.xp.toLocaleString()}{' '}
            <span className="text-text-muted text-base font-normal">
              / {formatXP(stats.xpToNextLevel)}
            </span>
          </span>
          <div className="w-full mt-2">
            <ProgressBar
              value={stats.xp}
              max={stats.xpToNextLevel}
              size="sm"
            />
          </div>
        </div>
      </section>
    )
  }
)

StatsGrid.displayName = 'StatsGrid'

export { StatsGrid }
export type { StatsGridProps }
