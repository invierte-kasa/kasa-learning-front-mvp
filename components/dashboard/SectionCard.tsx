'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

// Icons
const FolderIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
)

const TargetIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
    </svg>
)

interface SectionCardProps extends HTMLAttributes<HTMLDivElement> {
    section: {
        id: string
        title: string
        topic: string
        progress?: number
    }
    href: string
}

const SectionCard = forwardRef<HTMLDivElement, SectionCardProps>(
    ({ className, section, href, ...props }, ref) => {
        return (
            <Card
                ref={ref}
                variant="default"
                className={cn(
                    'p-6 gap-5 relative transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-kasa-primary/5 group',
                    className
                )}
                {...props}
            >
                <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-kasa-icon-dim text-kasa-primary rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <FolderIcon />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs font-medium text-text-muted">
                        <TargetIcon />
                        <span>Explorar</span>
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-kasa-primary transition-colors">
                        {section.title}
                    </h3>
                    <p className="text-text-muted text-sm line-clamp-2 mb-6">
                        {section.topic}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-text-disabled tracking-wider">Estado</span>
                            <span className="text-sm font-semibold text-kasa-primary">Disponible</span>
                        </div>

                        <Link href={href} className="no-underline">
                            <Button variant="secondary" size="sm" className="group-hover:bg-kasa-primary group-hover:text-white group-hover:border-kasa-primary transition-all duration-300">
                                Ver Módulos
                                <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14m-7-7 7 7-7 7" />
                                </svg>
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        )
    }
)

SectionCard.displayName = 'SectionCard'

export { SectionCard }
