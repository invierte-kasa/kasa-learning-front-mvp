'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'
import { NavItem } from '@/types'
import { Home, BarChart3, User, BookOpen } from 'lucide-react'

const navItems: { href: string; label: string; icon: React.ReactNode; id: NavItem }[] = [
  { href: '/', label: 'Aprender', icon: <Home className="w-6 h-6" />, id: 'learn' },
  { href: '/sections', label: 'Secciones', icon: <BookOpen className="w-6 h-6" />, id: 'sections' },
  { href: '/ranking', label: 'Ranking', icon: <BarChart3 className="w-6 h-6" />, id: 'ranking' },
  { href: '/profile', label: 'Perfil', icon: <User className="w-6 h-6" />, id: 'profile' },
]

interface MainNavProps extends HTMLAttributes<HTMLElement> { }

const MainNav = forwardRef<HTMLElement, MainNavProps>(
  ({ className, ...props }, ref) => {
    const pathname = usePathname()

    const isActive = (href: string) => {
      if (href === '/') {
        return pathname === '/' || pathname.startsWith('/lesson') || pathname.startsWith('/quiz')
      }
      return pathname.startsWith(href)
    }

    return (
      <nav
        ref={ref}
        className={cn(
          // Mobile: Fixed bottom navigation
          'fixed bottom-0 left-0 w-full h-[calc(80px+env(safe-area-inset-bottom))] bg-kasa-body border-t border-kasa-border z-50',
          'flex justify-around items-center pb-[env(safe-area-inset-bottom)]',
          // Desktop: Sticky sidebar
          'lg:sticky lg:top-0 lg:w-[260px] lg:h-screen lg:flex-col lg:justify-start lg:items-stretch',
          'lg:py-8 lg:px-6 lg:border-t-0 lg:border-r lg:border-kasa-border lg:gap-2',
          className
        )}
        {...props}
      >
        {/* Desktop logo */}
        <div className="hidden lg:block mb-12 pl-4">
          <Logo href="/" />
        </div>

        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              // Base styles
              'flex flex-col items-center gap-1 text-xs font-bold cursor-pointer p-2 rounded-2xl transition-all',
              'w-full max-w-[80px] no-underline',
              // Desktop styles
              'lg:flex-row lg:gap-4 lg:text-base lg:p-4 lg:max-w-full lg:justify-start',
              // State styles
              isActive(item.href)
                ? 'text-kasa-primary'
                : 'text-text-muted hover:text-white hover:bg-white/5 lg:hover:bg-kasa-hover',
              // Icon animation
              '[&_svg]:transition-transform [&_svg]:duration-300',
              isActive(item.href) && '[&_svg]:scale-110',
              !isActive(item.href) && 'hover:[&_svg]:scale-115 hover:[&_svg]:-translate-y-0.5'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    )
  }
)

MainNav.displayName = 'MainNav'

export { MainNav }
export type { MainNavProps }
