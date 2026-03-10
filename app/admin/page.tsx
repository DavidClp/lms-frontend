'use client'

import { useModules, useLessons, useUsers } from '@/hooks/use-api'
import { PageHeader } from '@/components/layout/page-header'
import { StatsCard } from '@/components/layout/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, GraduationCap, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@/components/ui/spinner'

export default function AdminDashboard() {
  const { data: modules, isLoading: loadingModules } = useModules()
  const { data: lessons, isLoading: loadingLessons } = useLessons()
  const { data: users, isLoading: loadingUsers } = useUsers()

  const isLoading = loadingModules || loadingLessons || loadingUsers

  const students = users?.filter(u => u.role === 'STUDENT') || []
  const completionRate = 65 // Placeholder - seria calculado via API

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
        title="Dashboard"
        description="Visão geral da plataforma"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Módulos"
          value={modules?.length || 0}
          description="Total de módulos"
          icon={BookOpen}
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Aulas"
          value={lessons?.length || 0}
          description="Total de aulas"
          icon={GraduationCap}
        />
        <StatsCard
          title="Alunos"
          value={students.length}
          description="Alunos matriculados"
          icon={Users}
          trend={{ value: 8, positive: true }}
        />
        <StatsCard
          title="Taxa de Conclusão"
          value={`${completionRate}%`}
          description="Média geral"
          icon={TrendingUp}
          trend={{ value: 5, positive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Módulos Recentes
            </CardTitle>
            <CardDescription>Últimos módulos criados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {modules?.slice(0, 5).map((module) => (
                <Link
                  key={module.id}
                  href={`/admin/modules/${module.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{module.title}</p>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">#{module.order}</span>
                </Link>
              ))}
              {(!modules || modules.length === 0) && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum módulo criado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              Alunos Recentes
            </CardTitle>
            <CardDescription>Últimos alunos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.slice(0, 5).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum aluno cadastrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
