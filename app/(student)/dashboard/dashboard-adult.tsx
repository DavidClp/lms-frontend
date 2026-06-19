'use client'

import { useModules, useLessons, useUserProgress } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import { PageHeader } from '@/components/layout/page-header'
import { StatsCard } from '@/components/layout/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'

export default function StudentDashboard() {
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
        title={`Olá, ${user?.name?.split(' ')[0] || 'Aluno'}!`}
        description="Continue sua jornada de aprendizado"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Módulos"
          value={modules?.length || 0}
          description="disponíveis"
          icon={BookOpen}
        />
        <StatsCard
          title="Aulas Concluídas"
          value={completedLessons.length}
          description={`de ${totalLessons} aulas`}
          icon={CheckCircle}
        />
        <StatsCard
          title="Progresso Geral"
          value={`${overallProgress}%`}
          description="do curso"
          icon={TrendingUp}
        />
        <StatsCard
          title="Em Andamento"
          value={totalLessons - completedLessons.length}
          description="aulas restantes"
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progresso por Módulo</CardTitle>
            <CardDescription>Seu avanço em cada módulo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modules?.map((module) => {
              const moduleLessons = lessons?.filter(l => l.moduleId === module.id) || []
              const moduleCompleted = completedLessons.filter(p => 
                moduleLessons.some(l => l.id === p.lessonId)
              ).length
              const moduleProgress = moduleLessons.length > 0
                ? Math.round((moduleCompleted / moduleLessons.length) * 100)
                : 0

              return (
                <Link
                  key={module.id}
                  href={`/modules/${module.id}`}
                  className="block p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{module.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {moduleCompleted}/{moduleLessons.length}
                    </span>
                  </div>
                  <Progress value={moduleProgress} className="h-2" />
                </Link>
              )
            })}
            {(!modules || modules.length === 0) && (
              <p className="text-muted-foreground text-center py-4">
                Nenhum módulo disponível
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aulas Recentes</CardTitle>
            <CardDescription>Suas últimas conclusões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedLessons.slice(0, 5).map((p) => {
                const lesson = lessons?.find(l => l.id === p.lessonId)
                const module = modules?.find(m => m.id === lesson?.moduleId)
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{lesson?.title}</p>
                      <p className="text-sm text-muted-foreground">{module?.title}</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                )
              })}
              {completedLessons.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma aula concluída ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
