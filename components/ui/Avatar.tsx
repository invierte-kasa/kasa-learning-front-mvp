'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  bordered?: boolean
  borderColor?: 'default' | 'primary' | 'gold' | 'silver'
  badge?: React.ReactNode
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = 'md', bordered = false, borderColor = 'default', badge, ...props }, ref) => {
    const sizes = {
      sm: 'w-10 h-10',
      md: 'w-11 h-11',
      lg: 'w-[70px] h-[70px]',
      xl: 'w-[90px] h-[90px]',
    }

    const borders = {
      default: 'border-kasa-border',
      primary: 'border-kasa-primary shadow-[0_0_20px_rgba(16,185,129,0.2)]',
      gold: 'border-podium-gold shadow-[0_0_20px_rgba(253,176,34,0.3)]',
      silver: 'border-podium-silver',
    }

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <img
          src={src}
          alt={alt}
          className={cn(
            'rounded-full object-cover',
            sizes[size],
            bordered && 'border-2',
            bordered && borders[borderColor]
          )}
        />
        {badge && (
          <div className="absolute -bottom-1 -right-1">
            {badge}
          </div>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

interface AvatarBadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'level' | 'medal'
}

const AvatarBadge = forwardRef<HTMLDivElement, AvatarBadgeProps>(
  ({ className, variant = 'level', children, ...props }, ref) => {
    const variants = {
      level: 'bg-kasa-primary text-black font-extrabold text-xs px-3 py-1 rounded-full border-3 border-kasa-body',
      medal: 'bg-kasa-card border-2 border-kasa-body rounded-full w-7 h-7 flex items-center justify-center text-base',
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AvatarBadge.displayName = 'AvatarBadge'

export { Avatar, AvatarBadge }
export type { AvatarProps, AvatarBadgeProps }
