'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Card } from '../ui/Card'
import { StatusPill } from '../ui/StatusPill'
import { Button } from '../ui/Button'
import { Module } from '@/types'

// Icons
const ClockIcon = () => (
  <svg className="inline-block align-text-bottom mr-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
)

const BuildingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-9a4 4 0 0 1 4-4v0a4 4 0 0 1 4 4v9"/>
  </svg>
)

const GridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="9" y1="22" x2="9" y2="22.01"></line>
    <line x1="15" y1="22" x2="15" y2="22.01"></line>
    <line x1="9" y1="18" x2="9" y2="18.01"></line>
    <line x1="15" y1="18" x2="15" y2="18.01"></line>
  </svg>
)

const MapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 6l7-4 8 4 7-4v16l-7 4-8-4-7 4V6z"></path>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
)

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

const moduleIcons: Record<number, React.FC> = {
  1: BuildingIcon,
  2: GridIcon,
  3: MapIcon,
  4: LockIcon,
}

interface ModuleCardProps extends HTMLAttributes<HTMLDivElement> {
  module: Module
  href?: string
}

const ModuleCard = forwardRef<HTMLDivElement, ModuleCardProps>(
  ({ className, module, href, ...props }, ref) => {
    const IconComponent = moduleIcons[module.number] || BuildingIcon
    const variant = module.status === 'active' ? 'active' : module.status === 'locked' ? 'locked' : 'default'

    const content = (
      <Card
        ref={ref}
        variant={variant}
        className={cn(
          'p-6 gap-5 relative transition-all duration-200',
          module.status !== 'locked' && 'hover:-translate-y-0.5',
          module.status === 'active' && 'after:content-[""] after:absolute after:-top-1.5 after:-right-1.5 after:w-3.5 after:h-3.5 after:bg-kasa-primary after:rounded-full after:border-3 after:border-kasa-body',
          className
        )}
        {...props}
      >
        {/* Header row */}
        <div className="flex justify-between items-start">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              module.status === 'locked'
                ? 'bg-white/[0.02] border border-dashed border-kasa-border text-text-disabled'
                : 'bg-kasa-icon-dim text-kasa-primary'
            )}
          >
            <IconComponent />
          </div>
          <StatusPill status={module.status} />
        </div>

        {/* Content */}
        <div>
          <h5
            className={cn(
              'text-xs uppercase mb-1 font-bold',
              module.status === 'locked' ? 'text-text-disabled' : 'text-kasa-primary'
            )}
          >
            Modulo {module.number}
          </h5>
          <h3
            className={cn(
              'text-lg font-bold mb-3',
              module.status === 'locked' ? 'text-text-muted' : 'text-white'
            )}
          >
            {module.title}
          </h3>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex gap-4 text-sm text-text-muted items-center">
              <span>
                <ClockIcon />
                {module.duration} min
              </span>
              <span>•</span>
              <span>{module.xp} XP</span>
            </div>

            {module.status === 'active' && href && (
              <Link href={href} className="no-underline">
                <Button variant="continue" size="sm">
                  Continuar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    )

    return content
  }
)

ModuleCard.displayName = 'ModuleCard'

export { ModuleCard }
export type { ModuleCardProps }
