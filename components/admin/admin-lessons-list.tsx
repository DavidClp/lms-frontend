'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import type { Lesson } from '@/types'
import {
  type ContentTrack,
  filterLessonsByTrack,
  filterModulesByTrack,
  adminModulesBasePath,
} from '@/lib/content-audience'

interface AdminLessonsListProps {
  track: ContentTrack
}

export function AdminLessonsList({ track }: AdminLessonsListProps) {
  const isKids = track === 'kids'
  const { data: lessons, isLoading } = useLessons()
  const { data: modules } = useModules()
  const deleteLesson = useDeleteLesson()

  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null)

  const trackModules = filterModulesByTrack(modules ?? [], track)
  const filteredLessons = filterLessonsByTrack(lessons ?? [], modules ?? [], track)

  const getModuleName = (moduleId: string) => {
    return trackModules.find((m) => m.id === moduleId)?.title || 'Sem módulo'
  }

  const handleDelete = async () => {
    if (!lessonToDelete) return
    try {
      await deleteLesson.mutateAsync(lessonToDelete.id)
      toast.success(isKids ? 'Missão excluída!' : 'Aula excluída!')
      setLessonToDelete(null)
    } catch {
      toast.error(isKids ? 'Erro ao excluir missão' : 'Erro ao excluir aula')
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
        title={isKids ? 'Missões Kids' : 'Aulas (Adultos)'}
        description={
          isKids
            ? 'Todas as missões dos mundos infantis'
            : 'Todas as aulas dos módulos para adultos'
        }
        action={
          <Button asChild>
            <Link href={adminModulesBasePath(track)}>
              <Plus className="h-4 w-4 mr-2" />
              {isKids ? 'Criar via Mundos' : 'Criar via Módulos'}
            </Link>
          </Button>
        }
      />

      {!isKids && (
        <p className="text-sm text-muted-foreground">
          Missões infantis em{' '}
          <Link href="/admin/kids/lessons" className="text-primary font-medium hover:underline">
            Missões Kids
          </Link>
          .
        </p>
      )}
      {isKids && (
        <p className="text-sm text-muted-foreground">
          Para criar uma missão, abra um mundo em{' '}
          <Link href="/admin/kids/modules" className="text-primary font-medium hover:underline">
            Mundos Kids
          </Link>{' '}
          e use &quot;Ver missões&quot;.
        </p>
      )}

      {filteredLessons.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={isKids ? 'Nenhuma missão Kids' : 'Nenhuma aula adulta'}
          description={
            isKids
              ? 'Crie missões dentro de um mundo Kids'
              : 'Crie aulas dentro de um módulo adulto'
          }
          action={
            <Button asChild>
              <Link href={adminModulesBasePath(track)}>
                {isKids ? 'Ver Mundos Kids' : 'Ver Módulos'}
              </Link>
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
                  <TableHead>{isKids ? 'Mundo' : 'Módulo'}</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Blocos</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLessons.map((lesson) => (
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
                              Editar conteúdo
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
              Tem certeza que deseja excluir {isKids ? 'a missão' : 'a aula'} &quot;{lessonToDelete?.title}&quot;?
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
