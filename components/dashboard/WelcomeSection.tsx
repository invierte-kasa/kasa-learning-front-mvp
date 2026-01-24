'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface WelcomeSectionProps extends HTMLAttributes<HTMLElement> {
  userName: string
  weeklyProgress: number
}

const WelcomeSection = forwardRef<HTMLElement, WelcomeSectionProps>(
  ({ className, userName, weeklyProgress, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn('mb-8', className)}
        {...props}
      >
        <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-2 text-white">
          Welcome back,<br />{userName}
        </h1>
        <p className="text-text-muted">
          You&apos;ve completed {weeklyProgress}% of your weekly goal.
        </p>
      </section>
    )
  }
)

WelcomeSection.displayName = 'WelcomeSection'

export { WelcomeSection }
export type { WelcomeSectionProps }
