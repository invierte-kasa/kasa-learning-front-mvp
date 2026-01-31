'use client'

import { SyncScreen, DashboardContent } from '@/components/dashboard'
import { UserStats } from '@/types'
import { useUser } from '@/context/UserContext'
import { useState, useEffect } from 'react'

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
  const { user } = useUser()
  const [isSyncing, setIsSyncing] = useState(true)
  const [isExitingSync, setIsExitingSync] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    // Check if user has already synced in this session
    // const hasSynced = sessionStorage.getItem('kasa_has_synced')

    /* if (hasSynced) {
      setIsSyncing(false)
      setShowDashboard(true)
      return
    } */

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

  const userName = user ? `${user.names_first || ''} ${user.names_last || ''}`.trim() || 'Estudiante' : 'Estudiante'

  return (
    <>
      <div style={{ display: isSyncing ? 'block' : 'none' }}>
        <SyncScreen user={user} isExiting={isExitingSync} />
      </div>

      <DashboardContent
        showDashboard={showDashboard}
        userName={userName}
        mockStats={mockStats}
        lockedItems={lockedItems}
      />
    </>
  )
}
