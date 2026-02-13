'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Lock icon for locked sections
const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
)

// Checkmark icon for completed sections
const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
)

// Arrow icon for active/available sections
const ArrowIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
)

interface SectionCardProps extends HTMLAttributes<HTMLDivElement> {
    section: {
        id: string
        title: string
        topic: string
        level: number
    }
    progress: number // 0-100
    totalModules: number
    completedModules: number
    status: 'completed' | 'active' | 'locked'
    href: string
}

const statusConfig = {
    completed: {
        badge: 'Completado',
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        progressBarClass: 'bg-emerald-500',
        accentClass: 'from-emerald-500/20 to-emerald-500/5',
        levelBg: 'bg-emerald-500',
        ringClass: 'ring-emerald-500/30',
    },
    active: {
        badge: 'En Progreso',
        badgeClass: 'bg-kasa-primary/20 text-kasa-primary border-kasa-primary/30',
        progressBarClass: 'bg-kasa-primary',
        accentClass: 'from-kasa-primary/20 to-kasa-primary/5',
        levelBg: 'bg-kasa-primary',
        ringClass: 'ring-kasa-primary/30',
    },
    locked: {
        badge: 'Bloqueado',
        badgeClass: 'bg-white/5 text-white/40 border-white/10',
        progressBarClass: 'bg-white/20',
        accentClass: 'from-white/5 to-transparent',
        levelBg: 'bg-white/20',
        ringClass: 'ring-white/10',
    },
}

const SectionCard = forwardRef<HTMLDivElement, SectionCardProps>(
    ({ className, section, progress, totalModules, completedModules, status, href, ...props }, ref) => {
        const config = statusConfig[status]
        const isLocked = status === 'locked'
        const isCompleted = status === 'completed'

        const cardContent = (
            <div
                ref={ref}
                className={cn(
                    'relative rounded-2xl border transition-all duration-300 overflow-hidden',
                    'bg-[#141e30] border-white/[0.06]',
                    !isLocked && 'hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 cursor-pointer group',
                    isLocked && 'opacity-60 cursor-not-allowed',
                    className
                )}
                {...props}
            >
                {/* Top accent gradient */}
                <div className={cn(
                    'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
                    isCompleted && 'from-emerald-500 to-emerald-400',
                    status === 'active' && 'from-kasa-primary to-teal-400',
                    isLocked && 'from-white/10 to-white/5',
                )} />

                <div className="p-5 sm:p-6">
                    {/* Row: Level badge + Status badge */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {/* Level circle */}
                            <div className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm text-white ring-2 transition-transform duration-300',
                                config.levelBg,
                                config.ringClass,
                                !isLocked && 'group-hover:scale-110'
                            )}>
                                {isCompleted ? <CheckIcon /> : isLocked ? <LockIcon /> : section.level}
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold tracking-wider text-white/40">Nivel</span>
                                <p className="text-base font-bold text-white leading-tight">{section.level}</p>
                            </div>
                        </div>

                        {/* Status badge */}
                        <span className={cn(
                            'text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border',
                            config.badgeClass
                        )}>
                            {config.badge}
                        </span>
                    </div>

                    {/* Title & Topic */}
                    <h3 className={cn(
                        'text-xl font-bold mb-1 transition-colors duration-300',
                        isLocked ? 'text-white/50' : 'text-white group-hover:text-kasa-primary'
                    )}>
                        {section.title}
                    </h3>
                    <p className={cn(
                        'text-base mb-5 line-clamp-2',
                        isLocked ? 'text-white/30' : 'text-white/50'
                    )}>
                        {section.topic}
                    </p>

                    {/* Progress section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className={cn(
                                'font-semibold',
                                isLocked ? 'text-white/30' : 'text-white/60'
                            )}>
                                {completedModules}/{totalModules} Módulos
                            </span>
                            <span className={cn(
                                'font-bold',
                                isCompleted ? 'text-emerald-400' : status === 'active' ? 'text-kasa-primary' : 'text-white/30'
                            )}>
                                {progress}%
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all duration-700 ease-out',
                                    config.progressBarClass,
                                    !isLocked && 'shadow-sm'
                                )}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Action row */}
                    {!isLocked && (
                        <div className="mt-5 flex items-center justify-end">
                            <div className={cn(
                                'flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300',
                                isCompleted ? 'text-emerald-400' : 'text-kasa-primary',
                                'group-hover:gap-3'
                            )}>
                                <span>{isCompleted ? 'Repasar' : 'Continuar'}</span>
                                <ArrowIcon />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )

        if (isLocked) {
            return cardContent
        }

        return (
            <Link href={href} className="no-underline block">
                {cardContent}
            </Link>
        )
    }
)

SectionCard.displayName = 'SectionCard'

export { SectionCard }
export type { SectionCardProps }
