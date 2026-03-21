'use client'

import { useModules, useLessons, useUserProgress } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import { PageHeader } from '@/components/layout/page-header'
import { StudentProgressView } from '@/components/progress/student-progress-view'
import { Spinner } from '@/components/ui/spinner'

export default function StudentProgressPage() {
  const { user } = useAuth()
  const { data: modules, isLoading: loadingModules } = useModules()
  const { data: lessons, isLoading: loadingLessons } = useLessons()
  const { data: progress, isLoading: loadingProgress } = useUserProgress(user?.id || '')

  const isLoading = loadingModules || loadingLessons || loadingProgress

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

      <StudentProgressView
        modules={modules || []}
        lessons={lessons || []}
        progress={progress || []}
      />
    </div>
  )
}
