'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Card, CardImage, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { ProgressWithLabel } from '../ui/ProgressBar'

// Arrow icon
const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
)

interface LearningCardProps extends HTMLAttributes<HTMLDivElement> {
  moduleNumber: number
  title: string
  progress: number
  href: string
}

const LearningCard = forwardRef<HTMLDivElement, LearningCardProps>(
  ({ className, moduleNumber, title, progress, href, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        <h3 className="section-title">Continue Learning</h3>
        <Link href={href} className="no-underline text-inherit block">
          <Card variant="hover" className="cursor-pointer">
            <CardImage gradient />
            <CardContent>
              <span className="text-kasa-primary font-bold text-xs mb-2 block">
                MODULE {moduleNumber}
              </span>
              <h2 className="text-xl font-bold mb-6 leading-snug text-white">
                {title}
              </h2>

              <ProgressWithLabel
                label="Progress"
                value={progress}
                className="mb-6"
              />

              <Button fullWidth>
                Continuar
                <ArrowIcon />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    )
  }
)

LearningCard.displayName = 'LearningCard'

export { LearningCard }
export type { LearningCardProps }
