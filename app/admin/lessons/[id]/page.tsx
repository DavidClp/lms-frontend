'use client'

import { use } from 'react'
import { useLesson, useModules, useUpdateLesson } from '@/hooks/use-api'
import { PageHeader } from '@/components/layout/page-header'
import { BlockEditor } from '@/components/lessons/block-editor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { useState, useEffect } from 'react'
import type { ContentBlock } from '@/types'

export default function LessonEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: lesson, isLoading } = useLesson(id)
  const { data: modules } = useModules()
  const updateLesson = useUpdateLesson()

  const [title, setTitle] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [order, setOrder] = useState(1)
  const [content, setContent] = useState<ContentBlock[]>([])

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title)
      setModuleId(lesson.moduleId)
      setOrder(lesson.order)
      setContent(lesson.content || [])
    }
  }, [lesson])

  const handleSave = async () => {
    try {
      await updateLesson.mutateAsync({
        id,
        data: { title, moduleId, order, content }
      })
      toast.success('Aula atualizada com sucesso!')
    } catch {
      toast.error('Erro ao atualizar aula')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aula não encontrada</p>
        <Button asChild className="mt-4">
          <Link href="/admin/lessons">Voltar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/lessons">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader
            title="Editar Aula"
            description={lesson.title}
          />
        </div>
        <Button onClick={handleSave} disabled={updateLesson.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {updateLesson.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
            <CardDescription>Dados básicos da aula</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module">Módulo</Label>
              <Select value={moduleId} onValueChange={setModuleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um módulo" />
                </SelectTrigger>
                <SelectContent>
                  {modules?.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Ordem</Label>
              <Input
                id="order"
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conteúdo</CardTitle>
            <CardDescription>Adicione blocos de conteúdo à aula</CardDescription>
          </CardHeader>
          <CardContent>
            <BlockEditor
              blocks={content}
              onChange={setContent}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
