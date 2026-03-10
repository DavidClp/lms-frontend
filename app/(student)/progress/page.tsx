'use client'

import { useModules, useLessons, useUserProgress } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle, Trophy } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export default function StudentProgressPage() {
  const { user } = useAuth()
  const { data: modules, isLoading: loadingModules } = useModules()
  const { data: lessons, isLoading: loadingLessons } = useLessons()
  const { data: progress, isLoading: loadingProgress } = useUserProgress(user?.id || '')

  const isLoading = loadingModules || loadingLessons || loadingProgress

  const completedLessons = progress?.filter(p => p.completed) || []
  const totalLessons = lessons?.length || 0
  const overallProgress = totalLessons > 0 
    ? Math.round((completedLessons.length / totalLessons) * 100) 
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meu Progresso"
        description="Acompanhe seu avanço no curso"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Progresso Geral
          </CardTitle>
          <CardDescription>
            {completedLessons.length} de {totalLessons} aulas concluídas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-4" />
          <p className="text-center mt-2 text-2xl font-bold text-primary">
            {overallProgress}%
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {modules?.sort((a, b) => a.order - b.order).map((module) => {
          const moduleLessons = lessons?.filter(l => l.moduleId === module.id) || []
          const moduleCompletedIds = completedLessons
            .filter(p => moduleLessons.some(l => l.id === p.lessonId))
            .map(p => p.lessonId)

          return (
            <Card key={module.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {moduleCompletedIds.length}/{moduleLessons.length}
                  </span>
                </div>
                <Progress 
                  value={moduleLessons.length > 0 ? (moduleCompletedIds.length / moduleLessons.length) * 100 : 0} 
                  className="h-2"
                />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {moduleLessons.sort((a, b) => a.order - b.order).map((lesson) => {
                    const isComplete = moduleCompletedIds.includes(lesson.id)
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                      >
                        {isComplete ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={isComplete ? 'text-foreground' : 'text-muted-foreground'}>
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
