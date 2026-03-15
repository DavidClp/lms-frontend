'use client'

import { use } from 'react'
import { useLesson, useModules, useUpdateLesson, useLessonQuizResults } from '@/hooks/use-api'
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
import { ArrowLeft, Save, CheckCircle, XCircle, Minus, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { useState, useEffect } from 'react'
import type { ContentBlock, QuizBlock, QuizQuestion } from '@/types'
import { normalizeLessonContent } from '@/lib/lesson-content'
import { cn } from '@/lib/utils'

export default function LessonEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: lesson, isLoading } = useLesson(id)
  const { data: modules } = useModules()
  const { data: quizResults, isLoading: loadingQuizResults } = useLessonQuizResults(id)
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
      setContent(normalizeLessonContent(lesson.content || []))
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

      <div className="flex flex-col gap-6">
        <Card>
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

        <Card>
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

        {content.some((b) => b.type === 'QUIZ') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resultados do Quiz
              </CardTitle>
              <CardDescription>
                Histórico de acertos e erros por aluno nesta aula
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingQuizResults ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : quizResults && quizResults.students.length > 0 ? (
                <QuizResultsTable content={content} quizResults={quizResults} />
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  Nenhum aluno respondeu ao quiz desta aula ainda.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Button
        size="icon"
        onClick={handleSave}
        disabled={updateLesson.isPending}
        title="Salvar"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
      >
        {updateLesson.isPending ? (
          <Spinner className="h-6 w-6" />
        ) : (
          <Save className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
}

/** Colunas: Aluno + uma coluna por pergunta de cada bloco de quiz */
function QuizResultsTable({
  content,
  quizResults,
}: {
  content: ContentBlock[]
  quizResults: { lessonTitle: string; quizBlockIndexes: number[]; students: { userId: string; userName: string; quizResults: Record<string, { questionId: string; correct: boolean }[]> }[] }
}) {
  const columns: { blockIndex: number; questionId: string; label: string }[] = []
  content.forEach((block, index) => {
    if (block.type === 'QUIZ' && 'questions' in block) {
      const questions = (block as QuizBlock).questions as QuizQuestion[]
      questions.forEach((q, qIdx) => {
        columns.push({
          blockIndex: index,
          questionId: q.id,
          label: `P${qIdx + 1}`,
        })
      })
    }
  })

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Aluno</th>
            {columns.map((col) => (
              <th key={`${col.blockIndex}-${col.questionId}`} className="text-left p-3 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {quizResults.students.map((student) => (
            <tr key={student.userId} className="border-b last:border-0">
              <td className="p-3 font-medium">{student.userName}</td>
              {columns.map((col) => {
                const blockResults = student.quizResults[String(col.blockIndex)] ?? []
                const item = blockResults.find((r) => r.questionId === col.questionId)
                return (
                  <td key={`${col.blockIndex}-${col.questionId}`} className="p-3">
                    {item === undefined ? (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Minus className="h-4 w-4" /> —
                      </span>
                    ) : item.correct ? (
                      <span className={cn('flex items-center gap-1 text-green-600')}>
                        <CheckCircle className="h-4 w-4" /> Acertou
                      </span>
                    ) : (
                      <span className={cn('flex items-center gap-1 text-red-600')}>
                        <XCircle className="h-4 w-4" /> Errou
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
