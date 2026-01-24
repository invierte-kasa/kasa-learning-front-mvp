import { User } from '@/types'

// Cookie name for shared authentication
const AUTH_COOKIE_NAME = 'kasa_session'

// Mock user data for development
const mockUser: User = {
  id: '1',
  name: 'Alexandre',
  email: 'alexandre@kasa.com',
  avatar: 'https://ui-avatars.com/api/?name=Alexandre&background=10B981&color=fff',
  level: 12,
  xp: 2450,
  xpToNextLevel: 3000,
  streak: 15,
  role: 'Real Estate Apprentice',
  memberSince: 'Ene 2024',
  modulesCompleted: 8,
  totalModules: 10,
  achievements: 12,
}

export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === AUTH_COOKIE_NAME) {
      return value
    }
  }
  return null
}

export function isAuthenticated(): boolean {
  // In development, always return true
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  return getAuthCookie() !== null
}

export function getCurrentUser(): User | null {
  // In development, return mock user
  if (process.env.NODE_ENV === 'development') {
    return mockUser
  }

  const cookie = getAuthCookie()
  if (!cookie) return null

  try {
    // In production, decode JWT or fetch user from API
    return mockUser
  } catch {
    return null
  }
}

export function logout(): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }
}
