'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Lesson, Progress as ProgressType } from '@/types'
import { PlayCircle, CheckCircle, FileText, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LessonListProps {
  lessons: Lesson[]
  baseHref: string
  progress?: ProgressType[]
  showActions?: boolean
  onEdit?: (lesson: Lesson) => void
  onDelete?: (lesson: Lesson) => void
}

export function LessonList({
  lessons,
  baseHref,
  progress,
  showActions,
  onEdit,
  onDelete,
}: LessonListProps) {
  const isCompleted = (lessonId: string) =>
    progress?.some((p) => p.lessonId === lessonId && p.completed)

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-2">
      {sortedLessons.map((lesson, index) => {
        const completed = isCompleted(lesson.id)

        return (
          <div
            key={lesson.id}
            className={cn(
              'group flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50',
              completed && 'border-green-200 bg-green-50/50'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                completed
                  ? 'bg-green-100 text-green-600'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {completed ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`${baseHref}/${lesson.id}`}
                className="font-medium hover:text-primary transition-colors line-clamp-1"
              >
                {lesson.title}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {lesson.content?.length || 0} blocos
                </Badge>
                {completed && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    Concluída
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showActions ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit?.(lesson)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete?.(lesson)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button asChild variant="ghost" size="sm" className="gap-2">
                  <Link href={`${baseHref}/${lesson.id}`}>
                    <PlayCircle className="h-4 w-4" />
                    {completed ? 'Revisar' : 'Iniciar'}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
