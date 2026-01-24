'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@/types'
import { getCurrentUser, isAuthenticated, logout } from '@/lib/auth'

interface UseAuthReturn {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
  refresh: () => void
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(() => {
    setIsLoading(true)
    try {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to load user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const handleLogout = useCallback(() => {
    logout()
    setUser(null)
  }, [])

  return {
    user,
    isAuthenticated: isAuthenticated(),
    isLoading,
    logout: handleLogout,
    refresh: loadUser,
  }
}
