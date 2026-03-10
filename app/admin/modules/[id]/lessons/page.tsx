'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Plus, ArrowLeft, Edit, Trash2, GripVertical, FileText } from 'lucide-react'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Spinner } from '@/components/ui/spinner'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/layout/empty-state'
import { useModule, useModuleLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from '@/hooks/use-api'
import type { Lesson } from '@/types'
import { cn } from '@/lib/utils'

interface CreateLessonData {
  moduleId: string
  title: string
  order: number
  content: never[]
}

export default function ModuleLessonsPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string

  const { data: module, isLoading: moduleLoading } = useModule(moduleId)
  const { data: lessons = [], isLoading: lessonsLoading } = useModuleLessons(moduleId)
  const createLesson = useCreateLesson()
  const updateLesson = useUpdateLesson()
  const deleteLesson = useDeleteLesson()

  const [orderedLessons, setOrderedLessons] = useState<Lesson[]>([])
  const [isSavingOrder, setIsSavingOrder] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateLessonData>({
    defaultValues: { moduleId, title: '', order: 1, content: [] }
  })

  const isLoading = moduleLoading || lessonsLoading

  // Sync ordered list when server data changes
  useEffect(() => {
    setOrderedLessons([...lessons].sort((a, b) => a.order - b.order))
  }, [lessons])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedLessons.findIndex((l) => l.id === active.id)
    const newIndex = orderedLessons.findIndex((l) => l.id === over.id)
    const reordered = arrayMove(orderedLessons, oldIndex, newIndex)

    // Update local state immediately (optimistic)
    setOrderedLessons(reordered)

    // Persist only lessons whose order changed
    const toUpdate = reordered.filter((lesson, i) => lesson.order !== i + 1)
    if (toUpdate.length === 0) return

    setIsSavingOrder(true)
    try {
      await Promise.all(
        toUpdate.map((lesson) => {
          const newOrder = reordered.indexOf(lesson) + 1
          return updateLesson.mutateAsync({
            id: lesson.id,
            data: { moduleId: lesson.moduleId, title: lesson.title, order: newOrder, content: lesson.content },
          })
        })
      )
      toast.success('Ordem salva!')
    } catch {
      toast.error('Erro ao salvar ordem')
      setOrderedLessons([...lessons].sort((a, b) => a.order - b.order))
    } finally {
      setIsSavingOrder(false)
    }
  }

  const openCreateDialog = () => {
    setEditingLesson(null)
    reset({ moduleId, title: '', order: orderedLessons.length + 1, content: [] })
    setIsDialogOpen(true)
  }

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson)
    reset({ moduleId: lesson.moduleId, title: lesson.title, order: lesson.order, content: [] })
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: CreateLessonData) => {
    try {
      if (editingLesson) {
        await updateLesson.mutateAsync({ id: editingLesson.id, data })
        toast.success('Aula atualizada com sucesso!')
      } else {
        await createLesson.mutateAsync(data)
        toast.success('Aula criada com sucesso!')
      }
      setIsDialogOpen(false)
      reset()
    } catch {
      toast.error('Erro ao salvar aula')
    }
  }

  const handleDelete = async () => {
    if (!deletingLessonId) return
    try {
      await deleteLesson.mutateAsync(deletingLessonId)
      toast.success('Aula excluída com sucesso!')
      setDeletingLessonId(null)
    } catch {
      toast.error('Erro ao excluir aula')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!module) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Módulo não encontrado</p>
        <Button variant="outline" onClick={() => router.push('/admin/modules')}>
          Voltar para Módulos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/modules/${moduleId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title={`Aulas: ${module.title}`}
          description="Gerencie as aulas deste módulo"
        >
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Aula
          </Button>
        </PageHeader>
      </div>

      {orderedLessons.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma aula cadastrada"
          description="Este módulo ainda não possui aulas. Comece criando a primeira."
          action={
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Aula
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Lista de Aulas
              {isSavingOrder && <Spinner className="h-4 w-4" />}
            </CardTitle>
            <CardDescription>
              {orderedLessons.length} {orderedLessons.length === 1 ? 'aula' : 'aulas'} — arraste para reordenar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedLessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {orderedLessons.map((lesson, index) => (
                    <SortableLessonRow
                      key={lesson.id}
                      lesson={lesson}
                      index={index}
                      onEdit={() => openEditDialog(lesson)}
                      onDelete={() => setDeletingLessonId(lesson.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Editar Aula' : 'Nova Aula'}</DialogTitle>
            <DialogDescription>
              {editingLesson
                ? 'Atualize as informações básicas da aula'
                : 'Adicione uma nova aula a este módulo'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                {...register('title', { required: 'Título é obrigatório' })}
                placeholder="Ex: O que é um computador?"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Ordem</Label>
              <Input
                id="order"
                type="number"
                min={1}
                {...register('order', {
                  required: 'Ordem é obrigatória',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Ordem deve ser no mínimo 1' },
                })}
              />
              {errors.order && (
                <p className="text-sm text-destructive">{errors.order.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createLesson.isPending || updateLesson.isPending}>
                {(createLesson.isPending || updateLesson.isPending) && (
                  <Spinner className="mr-2 h-4 w-4" />
                )}
                {editingLesson ? 'Salvar Alterações' : 'Criar Aula'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingLessonId} onOpenChange={() => setDeletingLessonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Aula</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.
              Todo o conteúdo da aula será perdido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLesson.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SortableLessonRow({
  lesson,
  index,
  onEdit,
  onDelete,
}: {
  lesson: Lesson
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className="cursor-grab active:cursor-grabbing text-muted-foreground touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {index + 1}
        </div>
        <div>
          <h4 className="font-medium">{lesson.title}</h4>
          <p className="text-sm text-muted-foreground">
            {lesson.content.length} {lesson.content.length === 1 ? 'bloco' : 'blocos'} de conteúdo
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/lessons/${lesson.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Conteúdo
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
