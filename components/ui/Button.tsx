'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'continue'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-50'

    const variants = {
      primary: 'bg-kasa-primary text-white border-none rounded-2xl uppercase tracking-wide border-b-4 border-b-kasa-primary-dark hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0.5 active:border-b-0 active:mb-1',
      secondary: 'bg-kasa-card text-white border border-kasa-border rounded-2xl hover:bg-kasa-hover',
      ghost: 'bg-transparent text-text-muted hover:text-white hover:bg-white/5 rounded-xl',
      continue: 'bg-kasa-primary text-white border-none rounded-full uppercase tracking-wide border-b-4 border-b-kasa-primary-dark hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-kasa-primary/30 active:translate-y-0.5 active:border-b-0 active:mb-1',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'p-4 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
