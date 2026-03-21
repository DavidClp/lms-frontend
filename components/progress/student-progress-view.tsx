'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, Trophy } from 'lucide-react'
import type { Lesson, Module, Progress as ProgressType } from '@/types'

type StudentProgressViewProps = {
  modules: Module[]
  lessons: Lesson[]
  progress: ProgressType[]
}

export function StudentProgressView({ modules, lessons, progress }: StudentProgressViewProps) {
  const completedLessons = progress?.filter((p) => p.completed) || []
  const totalLessons = lessons?.length || 0
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Progresso geral
          </CardTitle>
          <CardDescription>
            {completedLessons.length} de {totalLessons} aulas concluídas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-4" />
          <p className="text-center mt-2 text-2xl font-bold text-primary">{overallProgress}%</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {modules
          ?.slice()
          .sort((a, b) => a.order - b.order)
          .map((module) => {
            const moduleLessons = lessons?.filter((l) => l.moduleId === module.id) || []
            const moduleCompletedIds = completedLessons
              .filter((p) => moduleLessons.some((l) => l.id === p.lessonId))
              .map((p) => p.lessonId)

            return (
              <Card key={module.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {moduleCompletedIds.length}/{moduleLessons.length}
                    </span>
                  </div>
                  <Progress
                    value={
                      moduleLessons.length > 0
                        ? (moduleCompletedIds.length / moduleLessons.length) * 100
                        : 0
                    }
                    className="h-2"
                  />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {moduleLessons
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => {
                        const isComplete = moduleCompletedIds.includes(lesson.id)
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                          >
                            {isComplete ? (
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <span
                              className={
                                isComplete ? 'text-foreground' : 'text-muted-foreground'
                              }
                            >
                              {lesson.title}
                            </span>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>
    </div>
  )
}
