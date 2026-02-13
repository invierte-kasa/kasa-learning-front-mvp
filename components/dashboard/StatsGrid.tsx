'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { UserStats } from '@/types'
import { formatXP } from '@/lib/utils'
import { motion } from 'motion/react'

const AnimatedFlame = () => (
  <span className="relative inline-flex items-center justify-center ml-1">
    {/* Glow effect layer */}
    <motion.span
      className="absolute inset-0 blur-[6px] opacity-70"
      animate={{
        scale: [1, 1.4, 1],
        opacity: [0.4, 0.8, 0.4],
        filter: [
          'drop-shadow(0 0 4px #ff4500)',
          'drop-shadow(0 0 8px #ff8c00)',
          'drop-shadow(0 0 4px #ff4500)'
        ]
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      🔥
    </motion.span>

    {/* Core flame emoji */}
    <motion.span
      className="relative z-10 inline-block"
      animate={{
        scale: [1, 1.1, 1],
        y: [0, -1, 0, -2, 0],
        rotate: [-2, 2, -2, 1, -2],
        filter: [
          'brightness(1)',
          'brightness(1.2)',
          'brightness(1)'
        ]
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      🔥
    </motion.span>
  </span>
)

interface StatsGridProps extends HTMLAttributes<HTMLElement> {
  stats: UserStats
}

const StatsGrid = forwardRef<HTMLElement, StatsGridProps>(
  ({ className, stats, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          'flex bg-[#1E293B] border border-[#334155] rounded-[1rem] p-4 mb-10 gap-4',
          'lg:p-6 lg:gap-8',
          className
        )}
        {...props}
      >
        {/* Level */}
        <div className="flex-1 flex flex-col items-center lg:items-start justify-center border-r border-[#334155]">
          <span className="stat-label">Level</span>
          <span className="stat-value">{stats.level}</span>
        </div>

        {/* Streak */}
        <div className="flex-1 flex flex-col items-center lg:items-start justify-center border-r border-[#334155]">
          <span className="stat-label">Streak</span>
          <span className="stat-value flex items-center">
            {stats.streak} <AnimatedFlame />
          </span>
        </div>

        {/* XP */}
        <div className="flex-[1.5] flex flex-col items-stretch justify-center">
          <div className="flex flex-col items-center lg:items-start w-full">
            <span className="stat-label">XP</span>
            <span className="stat-value text-[1.1rem]">
              {stats.xp.toLocaleString()}{' '}
              <span className="text-[#94A3B8] text-[0.9rem] font-normal">
                / {formatXP(stats.xpToNextLevel)}
              </span>
            </span>
            <div className="xp-bar-bg">
              <div
                className="xp-bar-fill"
                style={{ width: `${Math.min(100, (stats.xp / stats.xpToNextLevel) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>
    )
  }
)

StatsGrid.displayName = 'StatsGrid'

export { StatsGrid }
export type { StatsGridProps }


