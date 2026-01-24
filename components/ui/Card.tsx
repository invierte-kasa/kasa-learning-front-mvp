'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'active' | 'locked' | 'hover'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-kasa-card border border-kasa-border',
      active: 'bg-kasa-card border-2 border-kasa-primary shadow-lg shadow-kasa-primary/20',
      locked: 'bg-kasa-card/50 border border-kasa-border opacity-80',
      hover: 'bg-kasa-card border border-kasa-border hover:transform hover:-translate-y-0.5 hover:border-kasa-border transition-all cursor-pointer',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-card overflow-hidden flex flex-col',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

interface CardImageProps extends HTMLAttributes<HTMLDivElement> {
  gradient?: boolean
}

const CardImage = forwardRef<HTMLDivElement, CardImageProps>(
  ({ className, gradient = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'h-36 relative',
          gradient && 'bg-gradient-to-br from-kasa-body to-emerald-900',
          className
        )}
        {...props}
      >
        {gradient && (
          <div className="absolute -bottom-5 -right-5 w-24 h-24 bg-kasa-primary blur-[50px] opacity-50 rounded-full" />
        )}
        {children}
      </div>
    )
  }
)

CardImage.displayName = 'CardImage'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-6', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

export { Card, CardImage, CardContent }
export type { CardProps }
