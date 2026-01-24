'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ModuleStatus } from '@/types'

interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  status: ModuleStatus
}

const statusConfig: Record<ModuleStatus, { label: string; classes: string }> = {
  completed: {
    label: 'Completado',
    classes: 'bg-kasa-primary/15 text-kasa-primary border border-kasa-primary/20',
  },
  active: {
    label: 'Incompleto',
    classes: 'bg-white/5 text-text-muted border border-kasa-border',
  },
  locked: {
    label: 'Bloqueado',
    classes: 'bg-transparent text-text-disabled border border-kasa-border',
  },
}

const StatusPill = forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ className, status, ...props }, ref) => {
    const config = statusConfig[status]

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-[0.65rem] font-extrabold uppercase tracking-wide',
          config.classes,
          className
        )}
        {...props}
      >
        {config.label}
      </span>
    )
  }
)

StatusPill.displayName = 'StatusPill'

interface BadgePillProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info' | 'default'
}

const BadgePill = forwardRef<HTMLSpanElement, BadgePillProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      success: 'bg-kasa-primary/10 text-kasa-primary border border-kasa-primary/20',
      warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      info: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      default: 'bg-white/5 text-text-muted border border-kasa-border',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-[0.65rem] font-extrabold uppercase tracking-wide',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

BadgePill.displayName = 'BadgePill'

export { StatusPill, BadgePill }
export type { StatusPillProps, BadgePillProps }
