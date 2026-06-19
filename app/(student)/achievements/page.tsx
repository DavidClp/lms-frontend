'use client'

import { useGamification, useUserProgress } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import { BadgeGrid, AchievementProgress } from '@/components/kids/badge-grid'
import { MascotBubble } from '@/components/kids/mascot-bubble'
import { Spinner } from '@/components/ui/spinner'

export default function AchievementsPage() {
  const { user } = useAuth()
  const { data: gamification, isLoading } = useGamification()
  const { data: progress } = useUserProgress(user?.id ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const completedCount = progress?.filter((p) => p.completed).length ?? 0

  return (
    <div className="space-y-6">
      <MascotBubble message="Cada tesouro mostra o quanto você já conquistou!" />
      {gamification?.allBadges && <BadgeGrid badges={gamification.allBadges} />}
      <AchievementProgress label="Conquistador — complete 5 missões" current={completedCount} target={5} />
    </div>
  )
}
