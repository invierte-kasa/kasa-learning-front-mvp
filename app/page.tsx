'use client'

import { SyncScreen, DashboardContent } from '@/components/dashboard'
import { UserStats } from '@/types'
import { useUser } from '@/context/UserContext'
import { useState, useEffect } from 'react'

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
  const { user } = useUser()
  const [isSyncing, setIsSyncing] = useState(true)
  const [isExitingSync, setIsExitingSync] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    // Stage 1: Control animations in SyncScreen (Start exit sync state)
    const syncFinishTimer = setTimeout(() => {
      setIsExitingSync(true)
    }, 3500)

    // Stage 2: Switch to main dashboard after 5s total
    const dashboardStartTimer = setTimeout(() => {
      setIsSyncing(false)
      setShowDashboard(true)
      sessionStorage.setItem('kasa_has_synced', 'true')
    }, 5000)

    return () => {
      clearTimeout(syncFinishTimer)
      clearTimeout(dashboardStartTimer)
    }
  }, [])

  const displayName = user?.display_name || (user ? `${user.names_first || ''} ${user.names_last || ''}`.trim() : 'Estudiante') || 'Estudiante'

  const userStats: UserStats = {
    level: user?.current_level || 1,
    streak: user?.streak || 0,
    xp: user?.xp || 0,
    xpToNextLevel: (user?.current_level || 1) * 1000,
    weeklyProgress: user?.modules_completed ? Math.min(Math.round((user.modules_completed / 10) * 100), 100) : 0,
  }

  return (
    <>
      <div style={{ display: isSyncing ? 'block' : 'none' }}>
        <SyncScreen user={user} isExiting={isExitingSync} />
      </div>

      <DashboardContent
        showDashboard={showDashboard}
        userName={displayName}
        userStats={userStats}
        lockedItems={lockedItems}
      />
    </>
  )
}
