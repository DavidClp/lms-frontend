'use client'

import { use } from 'react'
import { useModule, useModuleLessons, useUserProgress } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import { PageHeader } from '@/components/layout/page-header'
import { LessonList } from '@/components/lessons/lesson-list'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'

export default function StudentModuleDetailPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = use(params)
  const { user } = useAuth()
  const { data: module, isLoading } = useModule(moduleId)
  const { data: lessons } = useModuleLessons(moduleId)
  const { data: progress } = useUserProgress(user?.id || '')

  const completedLessonIds = progress?.filter(p => p.completed).map(p => p.lessonId) || []
  const moduleProgress = lessons?.length
    ? Math.round((completedLessonIds.filter(id => lessons.some(l => l.id === id)).length / lessons.length) * 100)
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!module) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Módulo não encontrado</p>
        <Button asChild className="mt-4">
          <Link href="/modules">Voltar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/modules">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={module.title}
          description={module.description}
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-medium">Progresso do Módulo</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedLessonIds.filter(id => lessons?.some(l => l.id === id)).length} de {lessons?.length || 0} aulas
            </span>
          </div>
          <Progress value={moduleProgress} className="h-3" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Aulas</h2>
        <LessonList
          lessons={lessons || []}
          progress={progress || []}
          baseHref="/lessons"
        />
      </div>
    </div>
  )
}
