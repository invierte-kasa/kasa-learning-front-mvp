'use client'

import { useState, useEffect } from 'react'
import { MainNav } from '@/components/layout/MainNav'
import { Podium, LeaderboardCard, UserStatusBar } from '@/components/ranking'
import { RankingUser, RankingTab } from '@/types'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'

// Icons
const XPIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2v20M2 12h20"></path>
  </svg>
)

const StreakIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
  </svg>
)

export default function RankingPage() {
  const [tab, setTab] = useState<RankingTab>('xp')
  const [isExitingPage, setIsExitingPage] = useState(false)
  const [rankings, setRankings] = useState<RankingUser[]>([])
  const [loadingRankings, setLoadingRankings] = useState(true)
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    async function fetchRankings() {
      setLoadingRankings(true)
      try {
        const res = await fetch(`/api/ranking?tab=${tab}`)
        const contentType = res.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
          console.error('❌ /api/ranking returned non-JSON:', res.status, contentType)
          throw new Error(`API returned ${res.status} with content-type: ${contentType}`)
        }
        if (!res.ok) throw new Error(`Failed to fetch rankings: ${res.status}`)
        const data: RankingUser[] = await res.json()
        console.log('📊 [Ranking Page] Fetched rankings:', data)
        setRankings(data)
      } catch (err) {
        console.error('❌ Error fetching rankings:', err)
        setRankings([])
      } finally {
        setLoadingRankings(false)
      }
    }

    fetchRankings()
  }, [tab])

  const hasPodium = rankings.length >= 3
  const podiumUsers = hasPodium ? rankings.slice(0, 3) : []
  const listUsers = hasPodium ? rankings.slice(3) : rankings

  // Calculate status props based on the current user's position in rankings
  const currentUserRank = rankings.findIndex(r => r.id === user?.id)
  const userAbove = currentUserRank > 0 ? rankings[currentUserRank - 1] : null

  const statusProps = (() => {
    if (!userAbove || currentUserRank < 0) {
      return { progress: 0, nextRankGap: 0, nextRankName: '—' }
    }

    const currentUserData = rankings[currentUserRank]
    if (tab === 'xp') {
      const gap = (userAbove.xp || 0) - (currentUserData.xp || 0)
      const progress = gap > 0 ? Math.min(Math.round(((currentUserData.xp || 0) / (userAbove.xp || 1)) * 100), 99) : 100
      return { progress, nextRankGap: gap, nextRankName: userAbove.name }
    } else {
      const gap = (userAbove.streak || 0) - (currentUserData.streak || 0)
      const progress = gap > 0 ? Math.min(Math.round(((currentUserData.streak || 0) / (userAbove.streak || 1)) * 100), 99) : 100
      return { progress, nextRankGap: gap, nextRankName: userAbove.name }
    }
  })()

  const handleNavItemClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    if (isExitingPage) return

    setIsExitingPage(true)

    setTimeout(() => {
      router.push(href)
    }, 1700)
  }

  return (
    <div className="flex flex-col min-h-screen lg:flex-row bg-transparent">
      <MainNav onNavItemClick={handleNavItemClick} />

      <main className="flex-1 p-6 pb-[calc(80px+140px)] w-full lg:p-12 lg:pb-12 lg:max-w-[900px] lg:mx-auto relative">
        {/* Header + Filter Tabs */}
        <motion.div
          initial={{ y: '-100%', opacity: 0 }}
          animate={isExitingPage
            ? { y: '-100%', opacity: 0 }
            : { y: 0, opacity: 1 }
          }
          transition={isExitingPage
            ? { duration: 0.4, ease: [0.4, 0, 1, 1], delay: 0 }
            : {
              type: "spring",
              stiffness: 180,
              damping: 13,
              mass: 1,
              bounce: 0.7,
              delay: 1
            }
          }
        >
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold leading-tight mb-2 text-white">League Rankings</h1>
            <p className="text-text-muted">Top Kasa Investors this week</p>
          </header>

          {/* Filter tabs */}
          <div className="flex bg-kasa-card border border-kasa-border rounded-xl p-1 mb-8">
            <button
              onClick={() => setTab('xp')}
              className={cn(
                'flex-1 py-2.5 border-none rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all',
                tab === 'xp'
                  ? 'bg-kasa-primary text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
                  : 'bg-transparent text-text-muted'
              )}
            >
              <XPIcon />
              By XP
            </button>
            <button
              onClick={() => setTab('streak')}
              className={cn(
                'flex-1 py-2.5 border-none rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all',
                tab === 'streak'
                  ? 'bg-kasa-primary text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]'
                  : 'bg-transparent text-text-muted'
              )}
            >
              <StreakIcon />
              By Streak
            </button>
          </div>
        </motion.div>

        {loadingRankings ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-kasa-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-text-muted text-sm font-bold">Loading rankings...</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-text-muted text-lg font-bold">No rankings yet</p>
            <p className="text-text-muted text-sm">Be the first to earn XP!</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {hasPodium && (
              <motion.div
                initial={{ y: '-100%', opacity: 0 }}
                animate={isExitingPage
                  ? { y: '-100%', opacity: 0 }
                  : { y: 0, opacity: 1 }
                }
                transition={isExitingPage
                  ? { duration: 0.4, ease: [0.4, 0, 1, 1], delay: 1 }
                  : {
                    type: "spring",
                    stiffness: 180,
                    damping: 13,
                    mass: 1,
                    bounce: 0.7,
                    delay: 0
                  }
                }
              >
                <Podium users={podiumUsers} tab={tab} />
              </motion.div>
            )}

            {/* Leaderboard list */}
            {listUsers.length > 0 && (
              <motion.div
                initial={{ y: '-100%', opacity: 0 }}
                animate={isExitingPage
                  ? { y: '-100%', opacity: 0 }
                  : { y: 0, opacity: 1 }
                }
                transition={isExitingPage
                  ? { duration: 0.4, ease: [0.4, 0, 1, 1], delay: 0.6 }
                  : {
                    type: "spring",
                    stiffness: 180,
                    damping: 13,
                    mass: 1,
                    bounce: 0.7,
                    delay: 0.4
                  }
                }
              >
                <span className="block text-xs uppercase tracking-widest text-text-muted font-bold mb-6">
                  {tab === 'xp' ? 'Top 10 Rankings' : 'Consistency Leaders'}
                </span>

                <div className="flex flex-col gap-3">
                  {listUsers.map((rankUser) => (
                    <LeaderboardCard
                      key={rankUser.id}
                      user={rankUser}
                      tab={tab}
                      isCurrentUser={rankUser.id === user?.id}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* User Status Bar */}
        {currentUserRank >= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isExitingPage
              ? { opacity: 0 }
              : { opacity: 1 }
            }
            transition={{
              duration: 0.4,
              ease: "easeInOut",
              delay: isExitingPage ? 0.7 : 0.3
            }}
          >
            <UserStatusBar
              tab={tab}
              {...statusProps}
            />
          </motion.div>
        )}
      </main>
    </div>
  )
}
