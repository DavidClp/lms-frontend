'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Module } from '@/types'
import { BookOpen, ArrowRight, Edit, Trash2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModuleCardProps {
  module: Module
  href: string
  progress?: number
  showActions?: boolean
  locked?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function ModuleCard({
  module,
  href,
  progress,
  showActions,
  locked = false,
  onEdit,
  onDelete,
}: ModuleCardProps) {
  return (
    <Card className={cn('group relative overflow-hidden transition-all hover:shadow-md', locked && 'opacity-90')}>
      <div className={cn('absolute inset-x-0 top-0 h-1 transition-opacity group-hover:opacity-100', locked ? 'bg-muted' : 'bg-primary opacity-0')} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', locked ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary')}>
              {locked ? <Lock className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
            </div>
            <Badge variant="secondary" className="text-xs">
              Módulo {module.order}
            </Badge>
          </div>
          {showActions && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault()
                  onEdit?.()
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault()
                  onDelete?.()
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <CardTitle className="mt-3 line-clamp-1 text-lg">{module.title}</CardTitle>
        <CardDescription className="line-clamp-2">{module.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {typeof progress === 'number' && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {module.lessonsCount || 0} aulas
          </span>
          {locked ? (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              Módulo bloqueado
            </span>
          ) : (
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link href={href}>
                Acessar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
