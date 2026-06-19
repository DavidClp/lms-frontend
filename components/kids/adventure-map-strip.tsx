'use client'

import Link from 'next/link'
import type { Module, Lesson, Progress } from '@/types'
import { cn } from '@/lib/utils'
import { Lock } from 'lucide-react'

interface AdventureMapStripProps {
  modules: Module[]
  lessons: Lesson[]
  progress: Progress[]
  compact?: boolean
}

export function AdventureMapStrip({ modules, lessons, progress, compact = false }: AdventureMapStripProps) {
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId))
  const sorted = [...modules].sort((a, b) => a.order - b.order)

  const getModuleProgress = (moduleId: string) => {
    const moduleLessons = lessons.filter((l) => l.moduleId === moduleId && l.isActive !== false)
    const done = moduleLessons.filter((l) => completedIds.has(l.id)).length
    return { done, total: moduleLessons.length }
  }

  const isWorldUnlocked = (index: number) => {
    if (index === 0) return true
    const prev = sorted[index - 1]
    if (!prev) return true
    const { done, total } = getModuleProgress(prev.id)
    return total > 0 && done === total
  }

  const getNextHref = (mod: Module, unlocked: boolean) => {
    if (!unlocked) return undefined
    const moduleLessons = lessons
      .filter((l) => l.moduleId === mod.id && l.isActive !== false)
      .sort((a, b) => a.order - b.order)
    const next = moduleLessons.find((l) => !completedIds.has(l.id))
    return next ? `/lessons/${next.id}` : `/modules/${mod.id}`
  }

  if (sorted.length === 0) return null

  return (
    <div className={cn('overflow-x-auto pb-2', compact ? '' : 'px-1')}>
      <div className="flex min-w-max items-start gap-0 px-2">
        {sorted.map((mod, index) => {
          const unlocked = isWorldUnlocked(index)
          const { done, total } = getModuleProgress(mod.id)
          const href = getNextHref(mod, unlocked)
          const icon = mod.kidsMeta?.worldIcon ?? '💻'
          const isActive = unlocked && done < total

          const node = (
            <div className="flex flex-col items-center w-[88px]">
              <div
                className={cn(
                  'relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] text-3xl shadow-sm transition-transform',
                  isActive && 'scale-105 border-[#3B82F6] bg-white ring-4 ring-[#BFDBFE]',
                  unlocked && !isActive && done === total && 'border-[#22C55E] bg-[#F0FDF4]',
                  unlocked && !isActive && done < total && 'border-[#93C5FD] bg-white',
                  !unlocked && 'border-[#E2E8F0] bg-[#F8FAFC] opacity-70',
                )}
              >
                {unlocked ? icon : <Lock className="h-6 w-6 text-[#94A3B8]" />}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#3B82F6] px-2 py-0.5 text-[10px] font-bold text-white">
                    Agora
                  </span>
                )}
              </div>
              <p className="mt-2 text-center text-xs font-bold text-[#334155] line-clamp-2 leading-tight">
                {mod.title.replace(/^Mundo (do|da|de) /i, '').replace(/^Mundo /i, '') || mod.title}
              </p>
              <p className="text-[10px] font-semibold text-[#64748B]">
                {done}/{total || 0}
              </p>
            </div>
          )

          return (
            <div key={mod.id} className="flex items-start">
              {index > 0 && (
                <div
                  className={cn(
                    'mt-9 h-1 w-8 rounded-full',
                    isWorldUnlocked(index) ? 'bg-[#93C5FD]' : 'bg-[#E2E8F0]',
                  )}
                />
              )}
              {href ? (
                <Link href={href} className="hover:opacity-90">
                  {node}
                </Link>
              ) : (
                node
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
