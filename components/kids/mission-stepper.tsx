'use client'

import { cn } from '@/lib/utils'

interface MissionStepperProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function MissionStepper({ currentStep, totalSteps, className }: MissionStepperProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-3 flex-1 rounded-full transition-colors',
            i <= currentStep ? 'bg-primary' : 'bg-muted',
          )}
        />
      ))}
      <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
        {currentStep + 1}/{totalSteps}
      </span>
    </div>
  )
}
