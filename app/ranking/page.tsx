'use client'

import { useState } from 'react'
import { MainNav } from '@/components/layout/MainNav'
import { Podium, LeaderboardCard, UserStatusBar } from '@/components/ranking'
import { RankingUser, RankingTab } from '@/types'
import { cn } from '@/lib/utils'

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

// Mock data
const xpRankings: RankingUser[] = [
  { id: '1', name: 'Sarah K.', avatar: 'https://ui-avatars.com/api/?name=Sarah+K&background=064E3B&color=F8FAFC', rank: 1, xp: 15400, streak: 24, level: 'Master', title: 'MASTER' },
  { id: '2', name: 'Michael B.', avatar: 'https://ui-avatars.com/api/?name=Michael+B&background=1E293B&color=94A3B8', rank: 2, xp: 14850, streak: 18, level: 'Pro II', title: 'PRO II' },
  { id: '3', name: 'Juan R.', avatar: 'https://ui-avatars.com/api/?name=Juan+R&background=1E293B&color=94A3B8', rank: 3, xp: 14600, streak: 12, level: 'Pro I', title: 'PRO I' },
  { id: '4', name: 'Elena M.', avatar: 'https://ui-avatars.com/api/?name=Elena+M&background=334155&color=F8FAFC', rank: 4, xp: 13200, streak: 15, level: 'Expert', title: 'EXPERT ASSOCIATE' },
  { id: '5', name: 'David P.', avatar: 'https://ui-avatars.com/api/?name=David+P&background=334155&color=F8FAFC', rank: 5, xp: 12950, streak: 26, level: 'Expert', title: 'BROKER LEVEL 4' },
  { id: '6', name: 'Lisa W.', avatar: 'https://ui-avatars.com/api/?name=Lisa+W&background=334155&color=F8FAFC', rank: 6, xp: 11400, streak: 9, level: 'Advanced', title: 'HOUSE HUNTER' },
  { id: '7', name: 'Marcus J.', avatar: 'https://ui-avatars.com/api/?name=Marcus+J&background=334155&color=F8FAFC', rank: 7, xp: 10850, streak: 7, level: 'Advanced', title: 'KNOWLEDGE SEEKER' },
]

const streakRankings: RankingUser[] = [
  { id: '8', name: 'Ana L.', avatar: 'https://ui-avatars.com/api/?name=Ana+L&background=064E3B&color=F8FAFC', rank: 1, xp: 8200, streak: 32, level: 'Unstoppable', title: 'UNSTOPPABLE' },
  { id: '5', name: 'David P.', avatar: 'https://ui-avatars.com/api/?name=David+P&background=1E293B&color=94A3B8', rank: 2, xp: 12950, streak: 26, level: 'Steady', title: 'STEADY' },
  { id: '1', name: 'Sarah K.', avatar: 'https://ui-avatars.com/api/?name=Sarah+K&background=1E293B&color=94A3B8', rank: 3, xp: 15400, streak: 24, level: 'Relentless', title: 'RELENTLESS' },
  { id: '2', name: 'Michael B.', avatar: 'https://ui-avatars.com/api/?name=Michael+B&background=334155&color=F8FAFC', rank: 4, xp: 14850, streak: 18, level: 'Consistent', title: 'CONSISTENT' },
  { id: '4', name: 'Elena M.', avatar: 'https://ui-avatars.com/api/?name=Elena+M&background=334155&color=F8FAFC', rank: 5, xp: 13200, streak: 15, level: 'Regular', title: 'REGULAR' },
  { id: '3', name: 'Juan R. (You)', avatar: 'https://ui-avatars.com/api/?name=Juan+Rodriguez&background=10B981&color=fff', rank: 6, xp: 14600, streak: 12, level: 'Active', title: 'ACTIVE' },
]

const currentUser = {
  name: 'Juan Rodriguez',
  avatar: 'https://ui-avatars.com/api/?name=Juan+Rodriguez&background=10B981&color=fff',
  xp: 14600,
  streak: 12,
}

export default function RankingPage() {
  const [tab, setTab] = useState<RankingTab>('xp')

  const rankings = tab === 'xp' ? xpRankings : streakRankings
  const podiumUsers = rankings.slice(0, 3)
  const listUsers = rankings.slice(3)

  const statusProps = tab === 'xp'
    ? { progress: 80, nextRankGap: 250, nextRankName: 'Michael B.' }
    : { progress: 60, nextRankGap: 3, nextRankName: '5' }

  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <MainNav />

      <main className="flex-1 p-6 pb-[calc(80px+140px)] w-full lg:p-12 lg:pb-12 lg:max-w-[900px] lg:mx-auto">
        {/* Header */}
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

        {/* Podium */}
        <Podium users={podiumUsers} tab={tab} />

        {/* Leaderboard list */}
        <span className="block text-xs uppercase tracking-widest text-text-muted font-bold mb-6">
          {tab === 'xp' ? 'Top 10 Rankings' : 'Consistency Leaders'}
        </span>

        <div className="flex flex-col gap-3">
          {listUsers.map((user) => (
            <LeaderboardCard
              key={user.id}
              user={user}
              tab={tab}
              isCurrentUser={user.name.includes('You') || user.name === 'Juan R.'}
            />
          ))}
        </div>

        {/* User status bar */}
        <UserStatusBar
          name={currentUser.name}
          avatar={currentUser.avatar}
          tab={tab}
          xp={currentUser.xp}
          streak={currentUser.streak}
          {...statusProps}
        />
      </main>
    </div>
  )
}
