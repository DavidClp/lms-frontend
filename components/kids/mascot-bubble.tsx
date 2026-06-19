'use client'

import { cn } from '@/lib/utils'

interface MascotBubbleProps {
  message: string
  className?: string
}

export function MascotBubble({ message, className }: MascotBubbleProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <span className="text-3xl shrink-0 kids-bounce" aria-hidden>
        🤖
      </span>
      <div className="rounded-2xl rounded-tl-sm bg-primary/10 border-2 border-primary/20 px-4 py-3 text-base font-medium leading-snug">
        {message}
      </div>
    </div>
  )
}
