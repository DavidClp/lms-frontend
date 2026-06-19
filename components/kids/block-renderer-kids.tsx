'use client'

import type { ContentBlock } from '@/types'
import {
  BlockRenderer,
  type QuizResultItem,
} from '@/components/lessons/block-renderer'
import { cn } from '@/lib/utils'

interface BlockRendererKidsProps {
  blocks: ContentBlock[]
  blockIndex: number
  onQuizResult?: (blockIndex: number, results: QuizResultItem[]) => void
  savedOpenAnswers?: Record<number, string>
  onSaveOpenQuestion?: (blockIndex: number, answer: string) => void
  savedQuizResults?: Record<number, QuizResultItem[]>
  checklistState?: Record<number, boolean[]>
  onChecklistChange?: (blockIndex: number, checked: boolean[]) => void
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
}: BlockRendererKidsProps) {
  const block = blocks[blockIndex]
  if (!block) return null

  return (
    <div className={cn('kids-block text-lg leading-relaxed [&_p]:text-lg [&_p]:leading-relaxed')}>
      <BlockRenderer
        blocks={[block]}
        onQuizResult={onQuizResult}
        savedOpenAnswers={savedOpenAnswers}
        onSaveOpenQuestion={onSaveOpenQuestion}
        savedQuizResults={savedQuizResults}
        variant="kids"
        checklistState={checklistState}
        onChecklistChange={onChecklistChange}
      />
    </div>
  )
}
