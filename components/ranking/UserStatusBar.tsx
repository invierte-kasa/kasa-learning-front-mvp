'use client'

import { Avatar } from '../ui/Avatar'
import { ProgressBar } from '../ui/ProgressBar'
import { RankingTab } from '@/types'

interface UserStatusBarProps {
  name: string
  avatar: string
  tab: RankingTab
  xp?: number
  streak?: number
  progress: number
  nextRankGap: number
  nextRankName: string
}

export function UserStatusBar({
  name,
  avatar,
  tab,
  xp = 0,
  streak = 0,
  progress,
  nextRankGap,
  nextRankName,
}: UserStatusBarProps) {
  const statValue = tab === 'xp' ? `${xp.toLocaleString()} XP` : `${streak} Day Streak`
  const gapText = tab === 'xp'
    ? `${nextRankGap} XP to #${nextRankName}`
    : `${nextRankGap} Days to #${nextRankName}`
  const quoteText = tab === 'xp'
    ? `Keep it up! You're only <b>${nextRankGap} XP</b> away from ${nextRankName}!`
    : `Consistency is key! <b>${nextRankGap} more days</b> to beat ${nextRankName}!`

  return (
    <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom)+1rem)] left-4 right-4 bg-kasa-body border-2 border-kasa-primary rounded-3xl p-4 z-[90] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-w-[500px] mx-auto lg:left-[calc(260px+2rem)] lg:right-8 lg:ml-0">
      <div className="flex items-center gap-4 mb-3">
        <Avatar
          src={avatar}
          alt={name}
          size="md"
          bordered
          borderColor="primary"
        />
        <div className="flex-1">
          <h4 className="text-base font-extrabold text-white">
            {name} <span className="text-text-muted font-medium">(You)</span>
          </h4>
        </div>
        <div className="text-kasa-primary font-black text-lg">{statValue}</div>
      </div>

      <ProgressBar value={progress} size="sm" className="mb-1" />
      <div className="text-right text-xs text-text-muted font-bold mb-2">{gapText}</div>

      <div
        className="text-center text-xs text-text-muted mt-2 [&_b]:text-kasa-primary"
        dangerouslySetInnerHTML={{ __html: quoteText }}
      />
    </div>
  )
}
