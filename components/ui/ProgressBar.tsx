'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showGlow?: boolean
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, size = 'md', showGlow = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizes = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3.5',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'w-full bg-kasa-body rounded overflow-hidden',
          sizes[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full bg-kasa-primary rounded transition-all duration-300 ease-out',
            showGlow && 'shadow-[0_0_10px_rgba(16,185,129,0.3)]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)

ProgressBar.displayName = 'ProgressBar'

interface ProgressWithLabelProps extends ProgressBarProps {
  label?: string
  showPercentage?: boolean
}

const ProgressWithLabel = forwardRef<HTMLDivElement, ProgressWithLabelProps>(
  ({ label, showPercentage = true, value, max = 100, ...props }, ref) => {
    const percentage = Math.round((value / max) * 100)

    return (
      <div ref={ref} className="w-full">
        <div className="flex justify-between text-sm text-text-muted mb-2">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className="text-white font-semibold">{percentage}%</span>
          )}
        </div>
        <ProgressBar value={value} max={max} {...props} />
      </div>
    )
  }
)

ProgressWithLabel.displayName = 'ProgressWithLabel'

export { ProgressBar, ProgressWithLabel }
export type { ProgressBarProps, ProgressWithLabelProps }
