'use client'

import { Avatar, AvatarBadge } from '../ui/Avatar'
import { cn } from '@/lib/utils'
import { RankingUser, RankingTab } from '@/types'

interface PodiumProps {
  users: RankingUser[]
  tab: RankingTab
}

export function Podium({ users, tab }: PodiumProps) {
  // Sort to get positions: [0]=2nd, [1]=1st, [2]=3rd
  const sortedForDisplay = [users[1], users[0], users[2]]

  const medals = ['🥈', '🏆', '🥉']
  const borderColors = ['silver', 'gold', 'silver'] as const

  return (
    <section className="flex justify-center items-end gap-2 mb-12 py-4">
      {sortedForDisplay.map((user, displayIndex) => {
        const isFirst = displayIndex === 1
        const medalIndex = displayIndex

        return (
          <div
            key={user.id}
            className={cn(
              'flex flex-col items-center flex-1 max-w-[110px] relative',
              isFirst && 'max-w-[120px]'
            )}
          >
            {/* Avatar with medal */}
            <div className="relative mb-4">
              <Avatar
                src={user.avatar}
                alt={user.name}
                size={isFirst ? 'xl' : 'lg'}
                bordered
                borderColor={isFirst ? 'gold' : 'default'}
                badge={
                  <AvatarBadge variant="medal">
                    {medals[medalIndex]}
                  </AvatarBadge>
                }
              />
            </div>

            {/* Podium box */}
            <div
              className={cn(
                'bg-kasa-card border border-kasa-border rounded-t-2xl w-full flex flex-col justify-center text-center p-2',
                isFirst
                  ? 'h-[130px] w-[120px] bg-gradient-to-br from-kasa-primary/20 to-kasa-primary/5 border-kasa-primary/30'
                  : 'h-[90px]'
              )}
            >
              <div className="font-bold text-sm mb-0.5 text-white">{user.name}</div>
              <div className="text-kasa-primary font-extrabold text-xs">
                {tab === 'xp' ? `${user.xp.toLocaleString()} XP` : `${user.streak} Days`}
              </div>
              <div className="text-[0.6rem] text-text-muted font-bold uppercase">{user.level}</div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
