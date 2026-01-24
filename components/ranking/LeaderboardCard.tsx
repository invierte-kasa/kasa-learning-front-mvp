'use client'

import { Avatar } from '../ui/Avatar'
import { cn } from '@/lib/utils'
import { RankingUser, RankingTab } from '@/types'

interface LeaderboardCardProps {
  user: RankingUser
  tab: RankingTab
  isCurrentUser?: boolean
}

export function LeaderboardCard({ user, tab, isCurrentUser = false }: LeaderboardCardProps) {
  return (
    <div
      className={cn(
        'bg-kasa-card border border-kasa-border rounded-item p-4 flex items-center gap-4 transition-all duration-300',
        'hover:scale-[1.02] hover:-translate-y-0.5 hover:border-kasa-primary hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-kasa-hover'
      )}
    >
      <div className="font-extrabold text-text-muted w-6">{user.rank}</div>

      <div className="flex-1 flex items-center gap-4">
        <Avatar
          src={user.avatar}
          alt={user.name}
          size="md"
          className={cn(isCurrentUser && 'ring-2 ring-kasa-primary')}
        />
        <div>
          <h4 className="text-base font-bold text-white">
            {user.name}
            {isCurrentUser && <span className="text-text-muted font-normal"> (You)</span>}
          </h4>
          <p className="text-xs text-text-muted uppercase">{user.title}</p>
        </div>
      </div>

      <div className="text-right font-extrabold text-base text-white">
        {tab === 'xp' ? user.xp.toLocaleString() : user.streak}
        <span className="text-xs text-text-muted ml-0.5">
          {tab === 'xp' ? 'XP' : 'Days'}
        </span>
      </div>
    </div>
  )
}
