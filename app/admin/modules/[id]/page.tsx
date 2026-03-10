'use client'

import { use } from 'react'
import { useModule, useModuleLessons, useUpdateModule } from '@/hooks/use-api'
import { PageHeader } from '@/components/layout/page-header'
import { ModuleForm } from '@/components/modules/module-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import type { Module } from '@/types'

export default function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: module, isLoading } = useModule(id)
  const { data: lessons } = useModuleLessons(id)
  const updateModule = useUpdateModule()

  const handleUpdate = async (data: Partial<Module>) => {
    try {
      await updateModule.mutateAsync({ id, data })
      toast.success('Módulo atualizado com sucesso!')
    } catch {
      toast.error('Erro ao atualizar módulo')
    }
  }

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
          <Link href="/admin/modules">Voltar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/modules">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={module.title}
          description="Editar informações do módulo"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Módulo</CardTitle>
              <CardDescription>Atualize os dados do módulo</CardDescription>
            </CardHeader>
            <CardContent>
              <ModuleForm
                defaultValues={module}
                onSubmit={handleUpdate}
                isLoading={updateModule.isPending}
                submitLabel="Salvar Alterações"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Aulas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{lessons?.length || 0}</div>
              <p className="text-sm text-muted-foreground">aulas neste módulo</p>
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href={`/admin/modules/${id}/lessons`}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Gerenciar Aulas
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
