'use client'

import { MainNav } from '@/components/layout/MainNav'
import { Header } from '@/components/layout/Header'
import { WelcomeSection, StatsGrid, LearningCard, LockedSection } from '@/components/dashboard'
import { UserStats } from '@/types'

// Mock data - will be replaced with API calls
const mockStats: UserStats = {
  level: 12,
  streak: 15,
  xp: 2450,
  xpToNextLevel: 3000,
  weeklyProgress: 85,
}

const lockedItems = [
  {
    title: 'Analisis de Mercado Local',
    subtitle: 'Bloqueado - Nivel 3 requerido',
    icon: 'chart' as const,
    href: '/sections',
  },
  {
    title: 'Financiamiento y Credito',
    subtitle: 'Bloqueado',
    icon: 'credit-card' as const,
    href: '/sections',
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <MainNav />

      <main className="flex-1 p-6 pb-[calc(80px+1.5rem)] w-full lg:p-8 lg:pb-8 lg:max-w-[1200px] lg:mx-auto">
        <Header userName="Alexandre" />

        <WelcomeSection
          userName="Alexandre"
          weeklyProgress={mockStats.weeklyProgress}
        />

        <StatsGrid stats={mockStats} />

        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] lg:gap-8 lg:items-start">
          <LearningCard
            moduleNumber={4}
            title="Advanced UI Principles: Spatial Systems & Grids"
            progress={85}
            href="/sections"
          />

          <LockedSection items={lockedItems} />
        </div>
      </main>
    </div>
  )
}
