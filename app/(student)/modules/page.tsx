'use client'

import { useModules, useLessons, useUserProgress, useStudentModuleAccess } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import { useProfileMode } from '@/contexts/profile-mode-context'
import { PageHeader } from '@/components/layout/page-header'
import { ModuleCard } from '@/components/modules/module-card'
import { AdventureMapStrip } from '@/components/kids/adventure-map-strip'
import { EmptyState } from '@/components/layout/empty-state'
import { BookOpen } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export default function StudentModulesPage() {
  const { user } = useAuth()
  const { isKids } = useProfileMode()
  const { data: modules, isLoading } = useModules()
  const { data: lessons } = useLessons()
  const { data: progress } = useUserProgress(user?.id || '')
  const { data: moduleAccessData } = useStudentModuleAccess(user?.id ?? '')
  const allowedModuleIds = moduleAccessData?.moduleIds ?? []

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-[#3B82F6]" />
      </div>
    )
  }

  if (isKids) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#1E293B]">Mapa da Aventura</h1>
          <p className="mt-1 text-sm font-semibold text-[#64748B]">Escolha um mundo para explorar</p>
        </div>

        {!modules || modules.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhum mundo disponível"
            description="Aguarde o professor adicionar mundos ao curso"
          />
        ) : (
          <>
            <section className="rounded-2xl border-2 border-[#E2E8F0] bg-white p-5 shadow-sm md:p-6">
              <AdventureMapStrip
                modules={modules}
                lessons={lessons ?? []}
                progress={progress ?? []}
              />
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              {modules
                .sort((a, b) => a.order - b.order)
                .map((module) => {
                  const isLocked = !allowedModuleIds.includes(module.id)
                  return (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      href={`/modules/${module.id}`}
                      locked={isLocked}
                      isKids
                    />
                  )
                })}
            </section>
          </>
        )}
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
