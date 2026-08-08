'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Lesson, Module, Progress, GamificationSnapshot } from '@/types'
import { BlockRendererKids } from '@/components/kids/block-renderer-kids'
import { MissionStepper } from '@/components/kids/mission-stepper'
import { MascotBubble } from '@/components/kids/mascot-bubble'
import { MissionVictory } from '@/components/kids/mission-victory'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { KIDS_MESSAGES } from '@/lib/kids-messages'
import { progressApi } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import type { QuizResultItem } from '@/components/lessons/block-renderer'

interface KidsLessonViewProps {
  lesson: Lesson
  module?: Module
  progress?: Progress
  nextLesson: Lesson | null
  sortedLessons: Lesson[]
  onComplete: () => Promise<{ gamification?: GamificationSnapshot | null }>
  isCompleting: boolean
  activityUploadsDone?: boolean
}

export function KidsLessonView({
  lesson,
  module,
  progress,
  nextLesson,
  sortedLessons,
  onComplete,
  isCompleting,
  activityUploadsDone = true,
}: KidsLessonViewProps) {
  const queryClient = useQueryClient()
  const blocks = lesson.content ?? []
  const totalSteps = Math.max(blocks.length, 1)
  const [currentStep, setCurrentStep] = useState(0)
  const [showVictory, setShowVictory] = useState(false)
  const [victoryGamification, setVictoryGamification] = useState<GamificationSnapshot | null>(null)

  const lessonIndex = sortedLessons.findIndex((l) => l.id === lesson.id)
  const isCompleted = progress?.completed ?? false

  const savedOpenAnswers: Record<number, string> = {}
  if (progress?.openQuestionAnswers) {
    Object.entries(progress.openQuestionAnswers).forEach(([key, value]) => {
      const index = parseInt(key, 10)
      if (!Number.isNaN(index)) savedOpenAnswers[index] = value
    })
  }

  const savedQuizResults: Record<number, QuizResultItem[]> = {}
  if (progress?.quizResults) {
    Object.entries(progress.quizResults).forEach(([key, list]) => {
      const index = parseInt(key, 10)
      if (!Number.isNaN(index) && Array.isArray(list) && list.length > 0) {
        savedQuizResults[index] = list as QuizResultItem[]
      }
    })
  }

  const checklistState: Record<number, boolean[]> = {}
  if (progress?.checklistState) {
    Object.entries(progress.checklistState).forEach(([key, value]) => {
      const index = parseInt(key, 10)
      if (!Number.isNaN(index) && Array.isArray(value)) {
        checklistState[index] = value
      }
    })
  }

  const savedGameResults: Record<number, import('@/types').GameResultItem> = {}
  if (progress?.gameResults) {
    Object.entries(progress.gameResults).forEach(([key, value]) => {
      const index = parseInt(key, 10)
      if (!Number.isNaN(index) && value && typeof value === 'object') {
        savedGameResults[index] = value as import('@/types').GameResultItem
      }
    })
  }

  const savedActivityUploads: Record<number, import('@/types').ActivityUploadMeta> = {}
  if (progress?.activityUploads) {
    Object.entries(progress.activityUploads).forEach(([key, value]) => {
      const index = parseInt(key, 10)
      if (!Number.isNaN(index) && value?.key) {
        savedActivityUploads[index] = value
      }
    })
  }

  const mascotMessage = useMemo(() => {
    if (currentStep === 0) return module?.kidsMeta?.mascotIntro ?? KIDS_MESSAGES.missionStart
    if (currentStep >= totalSteps - 1) return 'Último passo! Você consegue!'
    return KIDS_MESSAGES.missionStep
  }, [currentStep, totalSteps, module?.kidsMeta?.mascotIntro])

  const handleQuizResult = useCallback(
    (blockIndex: number, results: QuizResultItem[]) => {
      progressApi
        .saveQuizResults(lesson.id, blockIndex, results)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['progress'] })
          queryClient.invalidateQueries({ queryKey: ['gamification'] })
        })
        .catch(() => {})
    },
    [lesson.id, queryClient],
  )

  const handleSaveOpenQuestion = useCallback(
    async (blockIndex: number, answer: string) => {
      await progressApi.saveOpenQuestionAnswer(lesson.id, blockIndex, answer)
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
    [lesson.id, queryClient],
  )

  const handleActivityUpload = useCallback(
    async (blockIndex: number, file: File) => {
      await progressApi.saveActivityUpload(lesson.id, blockIndex, file)
      await queryClient.invalidateQueries({ queryKey: ['progress'] })
      toast.success('Arquivo enviado!')
    },
    [lesson.id, queryClient],
  )

  const handleChecklistChange = useCallback(
    (blockIndex: number, checked: boolean[]) => {
      progressApi
        .saveChecklistState(lesson.id, blockIndex, checked)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['progress'] })
          queryClient.invalidateQueries({ queryKey: ['gamification'] })
        })
        .catch(() => {})
    },
    [lesson.id, queryClient],
  )

  const handleGameComplete = useCallback(
    (blockIndex: number, result: import('@/types').GameResultItem) => {
      progressApi
        .saveGameResult(lesson.id, blockIndex, result)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['progress'] })
        })
        .catch(() => {})
    },
    [lesson.id, queryClient],
  )

  const handleFinishMission = async () => {
    if (isCompleted) {
      setShowVictory(true)
      return
    }
    if (!activityUploadsDone) {
      toast.error('Envie o arquivo de todas as atividades antes de completar a missão.')
      return
    }
    try {
      const result = await onComplete()
      setVictoryGamification(result.gamification ?? null)
      setShowVictory(true)
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    } catch {
      toast.error('Erro ao completar missão')
    }
  }

  if (showVictory) {
    return (
      <MissionVictory
        xpEarned={50}
        level={victoryGamification?.level}
        nextLessonId={nextLesson?.id ?? null}
        moduleId={lesson.moduleId}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/modules/${lesson.moduleId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-muted-foreground truncate">
            {module?.title ?? 'Mundo'} · Missão {lessonIndex + 1}/{sortedLessons.length}
          </p>
          <h1 className="text-xl font-black truncate">{lesson.title}</h1>
        </div>
      </div>

      <MissionStepper currentStep={currentStep} totalSteps={totalSteps} />

      <MascotBubble message={mascotMessage} />

      <Card className="border-2 border-primary/20">
        <CardContent className="p-5">
          {blocks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Esta missão ainda não tem conteúdo.</p>
          ) : (
            <BlockRendererKids
              blocks={blocks}
              blockIndex={currentStep}
              onQuizResult={handleQuizResult}
              savedOpenAnswers={savedOpenAnswers}
              onSaveOpenQuestion={handleSaveOpenQuestion}
              savedQuizResults={savedQuizResults}
              checklistState={checklistState}
              onChecklistChange={handleChecklistChange}
              savedGameResults={savedGameResults}
              onGameComplete={handleGameComplete}
              savedActivityUploads={savedActivityUploads}
              onActivityUpload={handleActivityUpload}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {currentStep < totalSteps - 1 ? (
          <Button
            size="lg"
            className="min-h-14 text-lg font-bold w-full"
            onClick={() => setCurrentStep((s) => s + 1)}
          >
            Próximo Passo →
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              className="min-h-14 text-lg font-bold w-full"
              onClick={handleFinishMission}
              disabled={isCompleting || (!isCompleted && !activityUploadsDone)}
            >
              {isCompleting ? <Spinner className="h-5 w-5" /> : isCompleted ? 'Ver Vitória 🎉' : 'Completar Missão! 🚀'}
            </Button>
            {!isCompleted && !activityUploadsDone && (
              <p className="text-sm text-muted-foreground text-center">
                Envie o arquivo de todas as atividades para liberar a conclusão.
              </p>
            )}
          </>
        )}
        {currentStep > 0 && (
          <Button variant="outline" size="lg" className="min-h-12" onClick={() => setCurrentStep((s) => s - 1)}>
            ← Voltar
          </Button>
        )}
      </div>
    </div>
  )
}
