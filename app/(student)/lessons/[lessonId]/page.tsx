'use client'

import { use, useState } from 'react'
import { useLesson, useModule, useUserProgress, useMarkLessonComplete } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import { PageHeader } from '@/components/layout/page-header'
import { BlockRenderer } from '@/components/lessons/block-renderer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'

export default function StudentLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params)
  const { user } = useAuth()
  const { data: lesson, isLoading } = useLesson(lessonId)
  const { data: module } = useModule(lesson?.moduleId || '')
  const { data: progress } = useUserProgress(user?.id || '')
  const markComplete = useMarkLessonComplete()

  const [checklistState, setChecklistState] = useState<Record<string, boolean[]>>({})

  const isCompleted = progress?.some(p => p.lessonId === lessonId && p.completed) || false

  const handleMarkComplete = async () => {
    if (!user) return
    try {
      await markComplete.mutateAsync({
        userId: user.id,
        lessonId,
        completed: true
      })
      toast.success('Aula marcada como concluída!')
    } catch {
      toast.error('Erro ao marcar aula como concluída')
    }
  }

  console.log("lesson", lesson)

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
          <Link href="/modules">Voltar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/modules/${lesson.moduleId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{module?.title}</Badge>
              {isCompleted && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Concluída
                </Badge>
              )}
            </div>
            <PageHeader title={lesson.title} />
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
         {/*  {lesson.content?.map((block, index) => (
            <BlockRenderer
              key={index}
              blocks={block}
              checklistState={checklistState[index] || []}
              onChecklistChange={(newState) => {
                setChecklistState(prev => ({ ...prev, [index]: newState }))
              }}
            />
          ))} */}

          <BlockRenderer
              blocks={lesson.content}
            //  checklistState={checklistState[index] || []}
            /*   onChecklistChange={(newState) => {
                setChecklistState(prev => ({ ...prev, [index]: newState }))
              }} */
            />

          {(!lesson.content || lesson.content.length === 0) && (
            <p className="text-muted-foreground text-center py-8">
              Esta aula ainda não possui conteúdo
            </p>
          )}
        </CardContent>
      </Card>

      {!isCompleted && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleMarkComplete}
            disabled={markComplete.isPending}
            className="gap-2"
          >
            {markComplete.isPending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            Marcar como Concluída
          </Button>
        </div>
      )}
    </div>
  )
}
