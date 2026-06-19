'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useModules, useCreateModule, useDeleteModule } from '@/hooks/use-api'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/layout/empty-state'
import { ModuleForm } from '@/components/modules/module-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, BookOpen, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import type { Module, ModuleFormData } from '@/types'
import {
  type ContentTrack,
  filterModulesByTrack,
  defaultAudienceForTrack,
} from '@/lib/content-audience'

interface AdminModulesListProps {
  track: ContentTrack
}

export function AdminModulesList({ track }: AdminModulesListProps) {
  const isKids = track === 'kids'
  const { data: modules, isLoading } = useModules()
  const createModule = useCreateModule()
  const deleteModule = useDeleteModule()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null)

  const filteredModules = filterModulesByTrack(modules ?? [], track).sort((a, b) => a.order - b.order)

  const handleCreate = async (data: Partial<Module>) => {
    try {
      await createModule.mutateAsync({
        ...data,
        audience: defaultAudienceForTrack(track),
      } as ModuleFormData)
      toast.success(isKids ? 'Mundo criado com sucesso!' : 'Módulo criado com sucesso!')
      setIsCreateOpen(false)
    } catch {
      toast.error(isKids ? 'Erro ao criar mundo' : 'Erro ao criar módulo')
    }
  }

  const handleDelete = async () => {
    if (!moduleToDelete) return
    try {
      await deleteModule.mutateAsync(moduleToDelete.id)
      toast.success(isKids ? 'Mundo excluído!' : 'Módulo excluído!')
      setModuleToDelete(null)
    } catch {
      toast.error(isKids ? 'Erro ao excluir mundo' : 'Erro ao excluir módulo')
    }
  }

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
        title={isKids ? 'Mundos Kids' : 'Módulos (Adultos)'}
        description={
          isKids
            ? 'Crie mundos e missões separados para crianças de 7 a 10 anos'
            : 'Gerencie os módulos do curso para adultos'
        }
      >
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {isKids ? 'Novo Mundo' : 'Novo Módulo'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isKids ? 'Criar Mundo Kids' : 'Criar Módulo'}</DialogTitle>
              <DialogDescription>
                {isKids
                  ? 'Este conteúdo ficará visível apenas para alunos com perfil Kids'
                  : 'Este conteúdo ficará visível apenas para alunos adultos'}
              </DialogDescription>
            </DialogHeader>
            <ModuleForm
              onSubmit={handleCreate}
              isLoading={createModule.isPending}
              lockAudience={defaultAudienceForTrack(track)}
              defaultValues={{ audience: defaultAudienceForTrack(track), order: filteredModules.length + 1 }}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {!isKids && (
        <p className="text-sm text-muted-foreground">
          Conteúdo infantil é gerenciado em{' '}
          <Link href="/admin/kids/modules" className="text-primary font-medium hover:underline">
            Mundos Kids
          </Link>
          .
        </p>
      )}
      {isKids && (
        <p className="text-sm text-muted-foreground">
          Conteúdo para adultos fica em{' '}
          <Link href="/admin/modules" className="text-primary font-medium hover:underline">
            Módulos (Adultos)
          </Link>
          .
        </p>
      )}

      {filteredModules.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={isKids ? 'Nenhum mundo Kids' : 'Nenhum módulo adulto'}
          description={
            isKids
              ? 'Comece criando o primeiro mundo para as crianças'
              : 'Comece criando seu primeiro módulo para adultos'
          }
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {isKids ? 'Criar Mundo' : 'Criar Módulo'}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((module) => (
            <Card key={module.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isKids && (
                      <span className="text-2xl">{module.kidsMeta?.worldIcon ?? '🏝️'}</span>
                    )}
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                  <CardDescription>{module.description}</CardDescription>
                  {module.audience === 'ALL' && (
                    <Badge variant="outline" className="text-xs">
                      Todos os perfis
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/modules/${module.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalhes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/modules/${module.id}`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setModuleToDelete(module)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ordem: {module.order}</span>
                  <Link href={`/admin/modules/${module.id}/lessons`} className="text-primary hover:underline">
                    {isKids ? 'Ver missões' : 'Ver aulas'}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!moduleToDelete} onOpenChange={() => setModuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {isKids ? 'o mundo' : 'o módulo'} &quot;{moduleToDelete?.title}&quot;?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
