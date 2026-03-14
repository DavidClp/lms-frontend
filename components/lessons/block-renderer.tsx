'use client'

import { useState, useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ContentBlock, QuizBlock, QuizQuestion, ImagesBlock, OpenQuestionBlock } from '@/types'
import { Video, CheckSquare, HelpCircle, CheckCircle, XCircle, ImageIcon, PenLine } from 'lucide-react'
import { imagesApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'a', 'span', 'ul', 'ol', 'li']
const ALLOWED_ATTR = ['href', 'target', 'rel', 'style']

export type QuizResultItem = { questionId: string; correct: boolean }

interface BlockRendererProps {
  blocks: ContentBlock[]
  /** Chamado quando o aluno verifica respostas do quiz (para salvar histórico). Opcional. */
  onQuizResult?: (blockIndex: number, results: QuizResultItem[]) => void
  /** Respostas já salvas das atividades de pergunta em texto (índice do bloco -> texto). Opcional. */
  savedOpenAnswers?: Record<number, string>
  /** Chamado quando o aluno clica em Salvar em uma atividade de pergunta em texto. Opcional. */
  onSaveOpenQuestion?: (blockIndex: number, answer: string) => void
  /** Resultados já salvos do quiz por bloco (histórico imutável). Quando existe, o aluno não pode enviar de novo. Opcional. */
  savedQuizResults?: Record<number, QuizResultItem[]>
}

export function BlockRenderer({ blocks, onQuizResult, savedOpenAnswers, onSaveOpenQuestion, savedQuizResults }: BlockRendererProps) {
  return (
    <div className="space-y-6">
      {blocks?.map((block, index) => (
        <div key={index}>
          {block.type === 'TEXT' && <TextBlockComponent value={block.value} />}
          {block.type === 'VIDEO' && <VideoBlockComponent url={block.url} title={block.title} />}
          {block.type === 'ACTIVITY_CHECKLIST' && (
            <ChecklistBlockComponent title={block.title} items={block.items} />
          )}
          {block.type === 'QUIZ' && (
            <QuizBlockComponent
              block={block}
              blockIndex={index}
              onQuizResult={onQuizResult}
              savedBlockResults={savedQuizResults?.[index]}
            />
          )}
          {block.type === 'IMAGES' && <ImagesBlockComponent block={block} />}
          {block.type === 'OPEN_QUESTION' && (
            <OpenQuestionBlockComponent
              block={block}
              blockIndex={index}
              initialAnswer={savedOpenAnswers?.[index] ?? ''}
              onSave={onSaveOpenQuestion}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function TextBlockComponent({ value }: { value: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(value)
  const sanitized = isHtml
    ? DOMPurify.sanitize(value, { ALLOWED_TAGS, ALLOWED_ATTR })
    : ''
  const isPlainText = !isHtml || sanitized.replace(/<[^>]+>/g, '').trim() === value.trim()

  console.log("isPlainText", isPlainText)
  console.log("sanitized", sanitized)
  // Visualização “editor desabilitado”: mesmo estilo da área de conteúdo do editor, sem bordas, só leitura
  const editorContentClass =
    'prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed min-h-[60px] px-3 py-2 rounded-lg [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_p]:block [&_p]:mb-3 [&_p:last-child]:mb-0 [&_li]:mb-1'

  return (
    <div className="rounded-lg bg-muted/20 overflow-hidden">
      {isPlainText ? (
        <div className={cn(editorContentClass, 'whitespace-pre-wrap')}>{value}</div>
      ) : sanitized ? (
        <div
          className={editorContentClass}
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      ) : null}
    </div>
  )
}

const YOUTUBE_ID_REGEX = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/

function getYouTubeVideoId(videoUrl: string): string | null {
  const match = videoUrl.match(YOUTUBE_ID_REGEX)
  return match && match[2].length === 11 ? match[2] : null
}

function VideoBlockComponent({ url, title }: { url: string; title?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<unknown>(null)
  const videoId = getYouTubeVideoId(url)
  const isYouTube = videoId !== null

  useEffect(() => {
    if (!isYouTube || !containerRef.current || !videoId) return

    const initPlayer = () => {
      const YT = (window as Window & { YT?: { Player: new (el: HTMLElement, opts: unknown) => unknown } }).YT
      if (!YT || !containerRef.current) return
      if (playerRef.current) return
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: { target: { setPlaybackQuality?: (q: string) => void } }) => {
            try {
              event.target.setPlaybackQuality?.('highres')
            } catch {
              event.target.setPlaybackQuality?.('hd1080')
            }
          },
        },
      })
    }

    const win = window as Window & {
      YT?: { Player: new (el: HTMLElement, opts: unknown) => unknown }
      onYouTubeIframeAPIReady?: () => void
      __ytQueue?: Array<() => void>
    }

    if (win.YT) {
      initPlayer()
      return () => {
        if (playerRef.current && typeof (playerRef.current as { destroy?: () => void }).destroy === 'function') {
          (playerRef.current as { destroy: () => void }).destroy()
          playerRef.current = null
        }
      }
    }

    win.__ytQueue = win.__ytQueue ?? []
    win.__ytQueue.push(initPlayer)

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScript = document.getElementsByTagName('script')[0]
      firstScript?.parentNode?.insertBefore(tag, firstScript)
    }

    const prevReady = win.onYouTubeIframeAPIReady
    win.onYouTubeIframeAPIReady = () => {
      prevReady?.()
      win.__ytQueue?.forEach((fn) => fn())
      win.__ytQueue = []
    }

    return () => {
      if (playerRef.current && typeof (playerRef.current as { destroy?: () => void }).destroy === 'function') {
        (playerRef.current as { destroy: () => void }).destroy()
        playerRef.current = null
      }
    }
  }, [videoId, isYouTube])

  const getEmbedUrl = (videoUrl: string) => {
    const id = getYouTubeVideoId(videoUrl)
    if (id) {
      const params = new URLSearchParams({
        modestbranding: '1',
        rel: '0',
        iv_load_policy: '3',
      })
      return `https://www.youtube.com/embed/${id}?${params.toString()}`
    }
    return videoUrl
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
          {isYouTube ? (
            <div ref={containerRef} className="h-full w-full" />
          ) : (
            <iframe
              src={getEmbedUrl(url)}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || 'Vídeo'}
            />
          )}
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

function OpenQuestionBlockComponent({
  block,
  blockIndex,
  initialAnswer,
  onSave,
}: {
  block: OpenQuestionBlock
  blockIndex: number
  initialAnswer: string
  onSave?: (blockIndex: number, answer: string) => void
}) {
  const [answer, setAnswer] = useState(initialAnswer)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setAnswer(initialAnswer)
  }, [initialAnswer])

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(blockIndex, answer)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <PenLine className="h-5 w-5 text-primary" />
          Atividade
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <p className="text-lg font-medium whitespace-pre-wrap">{block.question || 'Responda abaixo:'}</p>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Sua resposta</label>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Digite sua resposta aqui..."
            rows={5}
            className="resize-y min-h-[120px]"
          />
        </div>
        {onSave && (
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Salvo!
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getQuizQuestions(block: QuizBlock): QuizQuestion[] {
  if (Array.isArray(block.questions) && block.questions.length > 0) return block.questions
  const legacy = block as QuizBlock & { question?: string; options?: QuizQuestion['options']; correctOptionId?: string }
  return [{
    id: `q-${Date.now()}`,
    question: legacy.question ?? '',
    options: legacy.options ?? [],
    correctOptionId: legacy.correctOptionId ?? '',
  }]
}

function QuizBlockComponent({
  block,
  blockIndex,
  onQuizResult,
  savedBlockResults,
}: {
  block: QuizBlock
  blockIndex: number
  onQuizResult?: (blockIndex: number, results: QuizResultItem[]) => void
  savedBlockResults?: QuizResultItem[]
}) {
  const questions = getQuizQuestions(block)
  const alreadyResponded = Array.isArray(savedBlockResults) && savedBlockResults.length > 0
  const [perQuestion, setPerQuestion] = useState<Record<string, { selectedOption: string | null }>>(() => ({}))
  const [quizSubmitted, setQuizSubmitted] = useState(alreadyResponded)

  const getSelected = (qId: string) => perQuestion[qId]?.selectedOption ?? null
  const setSelected = (qId: string, selectedOption: string | null) => {
    if (alreadyResponded) return
    setPerQuestion((prev) => ({
      ...prev,
      [qId]: { ...(prev[qId] ?? {}), selectedOption },
    }))
  }

  const results: QuizResultItem[] = quizSubmitted && !alreadyResponded
    ? questions.map((q) => ({
        questionId: q.id,
        correct: getSelected(q.id) === q.correctOptionId,
      }))
    : []
  const resultsSignature = results.map((r) => `${r.questionId}:${r.correct}`).join(',')

  useEffect(() => {
    if (onQuizResult && quizSubmitted && !alreadyResponded && results.length > 0) {
      onQuizResult(blockIndex, results)
    }
  }, [blockIndex, onQuizResult, resultsSignature, quizSubmitted, alreadyResponded])

  const hasAnySelection = questions.some((q) => getSelected(q.id) !== null)
  const handleCorrigirTudo = () => {
    if (hasAnySelection && !alreadyResponded) setQuizSubmitted(true)
  }

  return (
    <Card className="gap-2">
      <CardHeader className="pb-0 gap-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <HelpCircle className="h-5 w-5 text-primary" />
          Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-6">
        {questions.map((q, qIndex) => {
          const savedResult = savedBlockResults?.find((r) => r.questionId === q.id)
          return (
            <QuizQuestionCard
              key={q.id}
              question={q}
              questionNumber={qIndex + 1}
              selectedOption={getSelected(q.id)}
              onSelect={(optionId) => setSelected(q.id, optionId)}
              submitted={quizSubmitted}
              savedCorrect={savedResult?.correct}
            />
          )
        })}
        {alreadyResponded && (
          <p className="text-sm text-muted-foreground">Você já respondeu este questionário.</p>
        )}
        {!quizSubmitted && !alreadyResponded && (
          <div className="pt-2">
            <Button onClick={handleCorrigirTudo} disabled={!hasAnySelection}>
              Corrigir quiz
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function QuizQuestionCard({
  question,
  questionNumber,
  selectedOption,
  onSelect,
  submitted,
  savedCorrect,
}: {
  question: QuizQuestion
  questionNumber: number
  selectedOption: string | null
  onSelect: (optionId: string) => void
  submitted: boolean
  savedCorrect?: boolean
}) {
  const isCorrect = selectedOption === question.correctOptionId
  const showCorrect = savedCorrect !== undefined ? savedCorrect : isCorrect

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        submitted && (showCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30')
      )}
    >
      <p className="mb-3 text-sm font-medium text-muted-foreground">Pergunta {questionNumber}</p>
      <p className="mb-4 text-lg font-medium">{question.question}</p>
      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.id
          const showCorrect = submitted && option.id === question.correctOptionId
          const showIncorrect = submitted && isSelected && !isCorrect

          return (
            <button
              key={option.id}
              disabled={submitted}
              onClick={() => onSelect(option.id)}
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
      {submitted && (
        <div className="mt-3">
          {showCorrect ? (
            <Badge className="bg-green-100 text-green-700 h-8 px-3">
              <CheckCircle className="mr-1 h-3 w-3" />
              Correto!
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 h-8 px-3">
              <XCircle className="mr-1 h-3 w-3" />
              Incorreto
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
