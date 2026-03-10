'use client'

import { useState } from 'react'
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
import Link from 'next/link'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import type { Module } from '@/types'

export default function AdminModulesPage() {
  const { data: modules, isLoading } = useModules()
  const createModule = useCreateModule()
  const deleteModule = useDeleteModule()
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null)

  const handleCreate = async (data: Partial<Module>) => {
    try {
      await createModule.mutateAsync(data as Omit<Module, 'id'>)
      toast.success('Módulo criado com sucesso!')
      setIsCreateOpen(false)
    } catch {
      toast.error('Erro ao criar módulo')
    }
  }

  const handleDelete = async () => {
    if (!moduleToDelete) return
    try {
      await deleteModule.mutateAsync(moduleToDelete.id)
      toast.success('Módulo excluído com sucesso!')
      setModuleToDelete(null)
    } catch {
      toast.error('Erro ao excluir módulo')
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
        title="Módulos"
        description="Gerencie os módulos do curso"
        action={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Módulo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Módulo</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo módulo
                </DialogDescription>
              </DialogHeader>
              <ModuleForm
                onSubmit={handleCreate}
                isLoading={createModule.isPending}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {!modules || modules.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum módulo"
          description="Comece criando seu primeiro módulo"
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Módulo
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.sort((a, b) => a.order - b.order).map((module) => (
            <Card key={module.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
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
                  <Link
                    href={`/admin/modules/${module.id}/lessons`}
                    className="text-primary hover:underline"
                  >
                    Ver aulas
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
              Tem certeza que deseja excluir o módulo &quot;{moduleToDelete?.title}&quot;?
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
