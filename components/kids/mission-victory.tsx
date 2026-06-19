'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface MissionVictoryProps {
  xpEarned?: number
  level?: number
  levelName?: string
  newBadge?: { name: string; iconEmoji: string } | null
  nextLessonId?: string | null
  moduleId: string
}

export function MissionVictory({
  xpEarned = 50,
  level,
  levelName,
  newBadge,
  nextLessonId,
  moduleId,
}: MissionVictoryProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 kids-confetti">
      <div className="text-6xl">✨</div>
      <h1 className="text-3xl font-black text-primary">MISSÃO COMPLETA!</h1>
      <Card className="border-2 border-secondary w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <p className="text-2xl font-bold text-secondary">+{xpEarned} XP</p>
          {level && levelName && (
            <p className="text-muted-foreground">
              Nível {level} — {levelName}
            </p>
          )}
          {newBadge && (
            <div className="rounded-xl bg-muted p-4">
              <p className="text-sm font-semibold mb-1">Nova medalha!</p>
              <p className="text-xl">
                {newBadge.iconEmoji} {newBadge.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <Button asChild variant="outline" size="lg" className="flex-1 min-h-12">
          <Link href="/dashboard">Voltar ao Mapa</Link>
        </Button>
        {nextLessonId ? (
          <Button asChild size="lg" className="flex-1 min-h-12">
            <Link href={`/lessons/${nextLessonId}`}>Próxima Missão →</Link>
          </Button>
        ) : (
          <Button asChild size="lg" className="flex-1 min-h-12">
            <Link href={`/modules/${moduleId}`}>Ver Mundo</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
