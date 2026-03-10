'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ContentBlock, QuizBlock, ImagesBlock } from '@/types'
import { Video, CheckSquare, FileText, HelpCircle, CheckCircle, XCircle, ImageIcon } from 'lucide-react'
import { imagesApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface BlockRendererProps {
  blocks: ContentBlock[]
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <div className="space-y-6">
      {blocks?.map((block, index) => (
        <div key={index}>
          {block.type === 'TEXT' && <TextBlockComponent value={block.value} />}
          {block.type === 'VIDEO' && <VideoBlockComponent url={block.url} title={block.title} />}
          {block.type === 'ACTIVITY_CHECKLIST' && (
            <ChecklistBlockComponent title={block.title} items={block.items} />
          )}
          {block.type === 'QUIZ' && <QuizBlockComponent block={block} />}
          {block.type === 'IMAGES' && <ImagesBlockComponent block={block} />}
        </div>
      ))}
    </div>
  )
}

function TextBlockComponent({ value }: { value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <FileText className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function VideoBlockComponent({ url, title }: { url: string; title?: string }) {
  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
    return url
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-5 w-5 text-primary" />
          {title || 'Vídeo'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="aspect-video overflow-hidden rounded-lg bg-muted">
          <iframe
            src={getEmbedUrl(url)}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ChecklistBlockComponent({ title, items }: { title?: string; items: string[] }) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedItems(newChecked)
  }

  const allChecked = checkedItems.size === items.length

  return (
    <Card className={cn(allChecked && 'border-green-200 bg-green-50/50')}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            {title || 'Atividade Prática'}
          </div>
          {allChecked && (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle className="mr-1 h-3 w-3" />
              Concluída
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer',
                checkedItems.has(index)
                  ? 'border-green-200 bg-green-50'
                  : 'hover:bg-muted/50'
              )}
              onClick={() => toggleItem(index)}
            >
              <Checkbox
                checked={checkedItems.has(index)}
                onCheckedChange={() => toggleItem(index)}
              />
              <span
                className={cn(
                  'flex-1',
                  checkedItems.has(index) && 'line-through text-muted-foreground'
                )}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ImagesBlockComponent({ block }: { block: ImagesBlock }) {
  if (!block.imageIds || block.imageIds.length === 0) return null

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
          <ImageIcon className="h-4 w-4 text-primary" />
          <span>Imagens</span>
        </div>
        <div className={cn(
          'grid gap-3',
          block.imageIds.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        )}>
          {block.imageIds.map((id) => (
            <div key={id} className="overflow-hidden rounded-lg border bg-muted">
              <img
                src={imagesApi.getUrl(id)}
                alt={block.caption ?? ''}
                className="w-full object-cover"
              />
            </div>
          ))}
        </div>
        {block.caption && (
          <p className="mt-2 text-center text-sm text-muted-foreground italic">{block.caption}</p>
        )}
      </CardContent>
    </Card>
  )
}

function QuizBlockComponent({ block }: { block: QuizBlock }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const isCorrect = selectedOption === block.correctOptionId

  const handleSubmit = () => {
    if (selectedOption) {
      setSubmitted(true)
    }
  }

  const handleReset = () => {
    setSelectedOption(null)
    setSubmitted(false)
  }

  return (
    <Card className={cn(submitted && (isCorrect ? 'border-green-200' : 'border-red-200'))}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <HelpCircle className="h-5 w-5 text-primary" />
          Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-4 text-lg font-medium">{block.question}</p>
        <div className="space-y-2">
          {block.options.map((option) => {
            const isSelected = selectedOption === option.id
            const showCorrect = submitted && option.id === block.correctOptionId
            const showIncorrect = submitted && isSelected && !isCorrect

            return (
              <button
                key={option.id}
                disabled={submitted}
                onClick={() => setSelectedOption(option.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                  !submitted && isSelected && 'border-primary bg-primary/5',
                  !submitted && !isSelected && 'hover:bg-muted/50',
                  showCorrect && 'border-green-500 bg-green-50',
                  showIncorrect && 'border-red-500 bg-red-50'
                )}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30'
                  )}
                >
                  {option.id.toUpperCase()}
                </div>
                <span className="flex-1">{option.text}</span>
                {showCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                {showIncorrect && <XCircle className="h-5 w-5 text-red-600" />}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex gap-2">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={!selectedOption}>
              Verificar Resposta
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset}>
                Tentar Novamente
              </Button>
              {isCorrect && (
                <Badge className="bg-green-100 text-green-700 h-10 px-4">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Correto!
                </Badge>
              )}
              {!isCorrect && (
                <Badge className="bg-red-100 text-red-700 h-10 px-4">
                  <XCircle className="mr-1 h-4 w-4" />
                  Incorreto
                </Badge>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
