'use client'

import { Progress } from '@/components/ui/progress'

interface XpBarProps {
  level: number
  levelName: string
  xpProgressPercent: number
  totalXp: number
}

export function XpBar({ level, levelName, xpProgressPercent, totalXp }: XpBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span>Lv.{level} {levelName}</span>
        <span className="text-secondary">{totalXp} XP</span>
      </div>
      <Progress value={xpProgressPercent} className="h-3 bg-muted" />
    </div>
  )
}
