'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ className, showText = true, size = 'md', href = '/', ...props }, ref) => {
    const sizes = {
      sm: 'h-8',
      md: 'h-10',
      lg: 'h-12',
    }

    const content = (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3',
          className
        )}
        {...props}
      >
        <img
          src="https://res.cloudinary.com/dtgrcjcbd/image/upload/v1756610797/logo-kasa-blanco_p9uhqg.png"
          alt="Kasa Learning"
          className={cn("w-auto", sizes[size])}
        />
      </div>
    )

    if (href) {
      return (
        <Link href={href} className="no-underline">
          {content}
        </Link>
      )
    }

    return content
  }
)

Logo.displayName = 'Logo'

export { Logo }
export type { LogoProps }
