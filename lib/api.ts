// API client for Kasa Learning
// This will be connected to the backend API in production

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

interface ApiResponse<T> {
  data: T
  error?: string
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for auth
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return {
      data: null as T,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// User endpoints
export const userApi = {
  getProfile: () => fetchApi('/user/profile'),
  updateProfile: (data: Record<string, unknown>) =>
    fetchApi('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getStats: () => fetchApi('/user/stats'),
}

// Learning endpoints
export const learningApi = {
  getSections: () => fetchApi('/sections'),
  getSection: (id: string) => fetchApi(`/sections/${id}`),
  getLesson: (id: string) => fetchApi(`/lessons/${id}`),
  markLessonComplete: (id: string) =>
    fetchApi(`/lessons/${id}/complete`, { method: 'POST' }),
}

// Quiz endpoints
export const quizApi = {
  getQuiz: (id: string) => fetchApi(`/quizzes/${id}`),
  submitQuiz: (id: string, answers: Record<string, unknown>) =>
    fetchApi(`/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(answers),
    }),
}

// Ranking endpoints
export const rankingApi = {
  getLeaderboard: (type: 'xp' | 'streak') =>
    fetchApi(`/ranking?type=${type}`),
  getUserRank: () => fetchApi('/ranking/me'),
}

export { fetchApi }
