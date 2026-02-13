'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { Avatar } from '../ui/Avatar'

// Icons
const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted cursor-pointer hover:text-white transition-colors">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
)

interface HeaderProps extends HTMLAttributes<HTMLElement> {
  userName?: string
  userAvatar?: string
  showMobileBrand?: boolean
}

const Header = forwardRef<HTMLElement, HeaderProps>(
  ({ className, userName = 'User', userAvatar, showMobileBrand = true, ...props }, ref) => {
    const avatarUrl = userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=10B981&color=fff`

    return (
      <header
        ref={ref}
        className={cn(
          'flex justify-between items-center mb-8',
          'lg:justify-end', // On desktop, push content to the right
          className
        )}
        {...props}
      >
        {/* Mobile brand - hidden on desktop */}
        {showMobileBrand && (
          <div className="lg:hidden">
            <Logo href="/" size="sm" />
          </div>
        )}

        {/* User actions */}
        <div className="flex items-center gap-4">
          <Avatar
            src={avatarUrl}
            alt={userName}
            size="sm"
            bordered
          />
        </div>
      </header>
    )
  }
)

Header.displayName = 'Header'

export { Header }
export type { HeaderProps }
