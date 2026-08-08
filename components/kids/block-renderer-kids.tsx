'use client'

import type { ContentBlock } from '@/types'
import {
  BlockRenderer,
  type QuizResultItem,
} from '@/components/lessons/block-renderer'
import { cn } from '@/lib/utils'
import type { ActivityUploadMeta, GameResultItem } from '@/types'

interface BlockRendererKidsProps {
  blocks: ContentBlock[]
  blockIndex: number
  onQuizResult?: (blockIndex: number, results: QuizResultItem[]) => void
  savedOpenAnswers?: Record<number, string>
  onSaveOpenQuestion?: (blockIndex: number, answer: string) => void
  savedQuizResults?: Record<number, QuizResultItem[]>
  checklistState?: Record<number, boolean[]>
  onChecklistChange?: (blockIndex: number, checked: boolean[]) => void
  savedGameResults?: Record<number, GameResultItem>
  onGameComplete?: (blockIndex: number, result: GameResultItem) => void
  savedActivityUploads?: Record<number, ActivityUploadMeta>
  onActivityUpload?: (blockIndex: number, file: File) => Promise<void>
}

export function BlockRendererKids({
  blocks,
  blockIndex,
  onQuizResult,
  savedOpenAnswers,
  onSaveOpenQuestion,
  savedQuizResults,
  checklistState,
  onChecklistChange,
  savedGameResults,
  onGameComplete,
  savedActivityUploads,
  onActivityUpload,
}: BlockRendererKidsProps) {
  const block = blocks[blockIndex]
  if (!block) return null

  const remappedOpen =
    savedOpenAnswers?.[blockIndex] !== undefined
      ? { 0: savedOpenAnswers[blockIndex] }
      : undefined
  const remappedQuiz =
    savedQuizResults?.[blockIndex] !== undefined
      ? { 0: savedQuizResults[blockIndex] }
      : undefined
  const remappedChecklist =
    checklistState?.[blockIndex] !== undefined
      ? { 0: checklistState[blockIndex] }
      : undefined
  const remappedGame =
    savedGameResults?.[blockIndex] !== undefined
      ? { 0: savedGameResults[blockIndex] }
      : undefined
  const remappedUpload =
    savedActivityUploads?.[blockIndex] !== undefined
      ? { 0: savedActivityUploads[blockIndex] }
      : undefined

  return (
    <div className={cn('kids-block text-lg leading-relaxed [&_p]:text-lg [&_p]:leading-relaxed')}>
      <BlockRenderer
        blocks={[block]}
        onQuizResult={onQuizResult ? (_i, results) => onQuizResult(blockIndex, results) : undefined}
        savedOpenAnswers={remappedOpen}
        onSaveOpenQuestion={
          onSaveOpenQuestion ? (_i, answer) => onSaveOpenQuestion(blockIndex, answer) : undefined
        }
        savedQuizResults={remappedQuiz}
        variant="kids"
        checklistState={remappedChecklist}
        onChecklistChange={
          onChecklistChange ? (_i, checked) => onChecklistChange(blockIndex, checked) : undefined
        }
        savedGameResults={remappedGame}
        onGameComplete={
          onGameComplete ? (_i, result) => onGameComplete(blockIndex, result) : undefined
        }
        savedActivityUploads={remappedUpload}
        onActivityUpload={
          onActivityUpload ? (_i, file) => onActivityUpload(blockIndex, file) : undefined
        }
      />
    </div>
  )
}
