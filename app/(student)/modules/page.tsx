'use client'

import { useModules, useLessons, useUserProgress, useStudentModuleAccess } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import { PageHeader } from '@/components/layout/page-header'
import { ModuleCard } from '@/components/modules/module-card'
import { EmptyState } from '@/components/layout/empty-state'
import { BookOpen } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export default function StudentModulesPage() {
  const { user } = useAuth()
  const { data: modules, isLoading } = useModules()
  const { data: lessons } = useLessons()
  const { data: progress } = useUserProgress(user?.id || '')
  const { data: moduleAccessData } = useStudentModuleAccess(user?.id ?? '')
  const allowedModuleIds = moduleAccessData?.moduleIds ?? []

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
        title="Módulos"
        description="Explore todos os módulos do curso"
      />

      {!modules || modules.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum módulo disponível"
          description="Aguarde o professor adicionar módulos ao curso"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.sort((a, b) => a.order - b.order).map((module) => {
            const isLocked = !allowedModuleIds.includes(module.id)
            return (
              <ModuleCard
                key={module.id}
                module={module}
                href={`/modules/${module.id}`}
                locked={isLocked}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
