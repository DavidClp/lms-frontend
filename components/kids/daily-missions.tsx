'use client'

import type { DailyMission } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DAILY_MISSION_LABELS } from '@/lib/kids-messages'

interface DailyMissionsProps {
  missions: DailyMission[]
}

export function DailyMissions({ missions }: DailyMissionsProps) {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>🌟</span> Missões de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {missions.map((mission) => {
          const pct = mission.target > 0 ? Math.round((mission.progress / mission.target) * 100) : 0
          return (
            <div key={mission.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>
                  {mission.completed ? '★' : '☆'} {DAILY_MISSION_LABELS[mission.type] ?? mission.type}
                </span>
                <span className="text-muted-foreground">
                  {mission.completed ? 'Feito!' : `${mission.progress}/${mission.target}`}
                </span>
              </div>
              <Progress value={mission.completed ? 100 : pct} className="h-2" />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
