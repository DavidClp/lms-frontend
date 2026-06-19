'use client'

import type { Badge } from '@/types'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface BadgeGridProps {
  badges: Badge[]
  title?: string
}

export function BadgeGrid({ badges, title = 'Meus Tesouros' }: BadgeGridProps) {
  const earned = badges.filter((b) => b.earned)
  const total = badges.length

  return (
    <Card className="border-2 border-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🏆</span> {title} ({earned.length}/{total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                'flex flex-col items-center rounded-xl border-2 p-3 text-center min-h-[100px]',
                badge.earned
                  ? 'border-secondary bg-secondary/10'
                  : 'border-muted bg-muted/30 opacity-50 grayscale',
              )}
            >
              <span className="text-3xl mb-1">{badge.earned ? badge.iconEmoji : '░'}</span>
              <p className="text-xs font-bold leading-tight">{badge.earned ? badge.name : '???'}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface AchievementProgressProps {
  label: string
  current: number
  target: number
}

export function AchievementProgress({ label, current, target }: AchievementProgressProps) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  return (
    <div className="space-y-2 rounded-xl border p-4 bg-muted/30">
      <div className="flex justify-between text-sm font-semibold">
        <span>Próxima conquista: {label}</span>
        <span>
          {current}/{target}
        </span>
      </div>
      <Progress value={pct} className="h-3" />
    </div>
  )
}
