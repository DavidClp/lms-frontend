'use client'

import { useState } from 'react'
import { useLessons, useModules, useDeleteLesson } from '@/hooks/use-api'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/layout/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { GraduationCap, MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import type { Lesson } from '@/types'

export default function AdminLessonsPage() {
  const { data: lessons, isLoading } = useLessons()
  const { data: modules } = useModules()
  const deleteLesson = useDeleteLesson()

  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null)

  const handleDelete = async () => {
    if (!lessonToDelete) return
    try {
      await deleteLesson.mutateAsync(lessonToDelete.id)
      toast.success('Aula excluída com sucesso!')
      setLessonToDelete(null)
    } catch {
      toast.error('Erro ao excluir aula')
    }
  }

  const getModuleName = (moduleId: string) => {
    return modules?.find(m => m.id === moduleId)?.title || 'Sem módulo'
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
        title="Aulas"
        description="Todas as aulas da plataforma"
        action={
          <Button asChild>
            <Link href="/admin/modules">
              <Plus className="h-4 w-4 mr-2" />
              Nova Aula
            </Link>
          </Button>
        }
      />

      {!lessons || lessons.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhuma aula"
          description="Crie aulas dentro de um módulo"
          action={
            <Button asChild>
              <Link href="/admin/modules">Ver Módulos</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Blocos</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getModuleName(lesson.moduleId)}</Badge>
                    </TableCell>
                    <TableCell>{lesson.order}</TableCell>
                    <TableCell>{lesson.content?.length || 0}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/lessons/${lesson.id}`}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setLessonToDelete(lesson)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!lessonToDelete} onOpenChange={() => setLessonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a aula &quot;{lessonToDelete?.title}&quot;?
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
