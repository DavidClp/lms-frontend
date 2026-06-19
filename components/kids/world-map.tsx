'use client'

import Link from 'next/link'
import type { Module, Lesson, Progress } from '@/types'
import { cn } from '@/lib/utils'
import { KIDS_MESSAGES } from '@/lib/kids-messages'
import { Lock } from 'lucide-react'

interface WorldMapProps {
  modules: Module[]
  lessons: Lesson[]
  progress: Progress[]
}

export function WorldMap({ modules, lessons, progress }: WorldMapProps) {
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId))

  const getModuleProgress = (moduleId: string) => {
    const moduleLessons = lessons.filter((l) => l.moduleId === moduleId && l.isActive !== false)
    const done = moduleLessons.filter((l) => completedIds.has(l.id)).length
    return { done, total: moduleLessons.length }
  }

  const isWorldUnlocked = (index: number) => {
    if (index === 0) return true
    const prev = modules[index - 1]
    if (!prev) return true
    const { done, total } = getModuleProgress(prev.id)
    return total > 0 && done === total
  }

  const getNextLessonId = (moduleId: string) => {
    const moduleLessons = lessons
      .filter((l) => l.moduleId === moduleId && l.isActive !== false)
      .sort((a, b) => a.order - b.order)
    return moduleLessons.find((l) => !completedIds.has(l.id))?.id
  }

  return (
    <div className="space-y-4">
      {modules.map((mod, index) => {
        const unlocked = isWorldUnlocked(index)
        const { done, total } = getModuleProgress(mod.id)
        const icon = mod.kidsMeta?.worldIcon ?? '🏝️'
        const color = mod.kidsMeta?.worldColor ?? '#4F46E5'
        const nextLessonId = getNextLessonId(mod.id)
        const allDone = total > 0 && done === total

        const content = (
          <div
            className={cn(
              'relative rounded-2xl border-2 p-4 transition-all',
              unlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-60 cursor-not-allowed',
            )}
            style={{ borderColor: color, backgroundColor: `${color}15` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-4xl">{unlocked ? icon : '🔒'}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg">{mod.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{mod.description}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {Array.from({ length: Math.max(total, 1) }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm border-2',
                        i < done ? 'bg-secondary border-secondary text-white' : 'bg-background border-muted',
                      )}
                    >
                      {i < done ? '⭐' : '○'}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-semibold mt-2">
                  {allDone ? 'Mundo conquistado!' : `${done}/${total} missões`}
                </p>
              </div>
            </div>
          </div>
        )

        if (!unlocked) {
          return (
            <div key={mod.id} title={KIDS_MESSAGES.lockedWorld}>
              {content}
            </div>
          )
        }

        if (allDone) {
          return <div key={mod.id}>{content}</div>
        }

        return (
          <Link key={mod.id} href={nextLessonId ? `/lessons/${nextLessonId}` : `/modules/${mod.id}`}>
            {content}
          </Link>
        )
      })}
    </div>
  )
}
