'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Icons
const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
)

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
    <line x1="12" y1="12" x2="12.01" y2="12"></line>
    <line x1="2" y1="10" x2="20" y2="10"></line>
  </svg>
)

const ChevronIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

interface LockedItemProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle: string
  icon?: 'chart' | 'credit-card'
  href?: string
}

const LockedItem = forwardRef<HTMLDivElement, LockedItemProps>(
  ({ className, title, subtitle, icon = 'chart', href = '/sections', ...props }, ref) => {
    const IconComponent = icon === 'chart' ? ChartIcon : CreditCardIcon

    const content = (
      <div
        ref={ref}
        className={cn(
          'bg-kasa-card border border-kasa-border rounded-item p-5 flex items-center gap-4 cursor-pointer transition-colors hover:border-kasa-hover',
          className
        )}
        {...props}
      >
        {/* Icon box */}
        <div className="w-12 h-12 bg-kasa-icon-dim rounded-xl flex items-center justify-center flex-shrink-0 text-text-muted">
          <IconComponent />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="text-base font-semibold text-white mb-1">{title}</div>
          <div className="text-sm text-text-disabled font-medium">{subtitle}</div>
        </div>

        {/* Arrow */}
        <div className="text-text-disabled">
          <ChevronIcon />
        </div>
      </div>
    )

    if (href) {
      return (
        <Link href={href} className="no-underline text-inherit block">
          {content}
        </Link>
      )
    }

    return content
  }
)

LockedItem.displayName = 'LockedItem'

interface LockedSectionProps extends HTMLAttributes<HTMLDivElement> {
  items: { title: string; subtitle: string; icon?: 'chart' | 'credit-card'; href?: string }[]
}

const LockedSection = forwardRef<HTMLDivElement, LockedSectionProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('', className)} {...props}>
        <h3 className="section-title">
          Proximos Pasos
          <LockIcon />
        </h3>
        <div className="flex flex-col gap-4">
          {items.map((item, index) => (
            <LockedItem
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              href={item.href}
            />
          ))}
        </div>
      </div>
    )
  }
)

LockedSection.displayName = 'LockedSection'

export { LockedItem, LockedSection }
export type { LockedItemProps, LockedSectionProps }
