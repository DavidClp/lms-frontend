'use client'

import { useState, useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ContentBlock, QuizBlock, QuizQuestion, ImagesBlock, OpenQuestionBlock, TableBlock, PdfBlock, ActivityUploadBlock, ActivityUploadMeta } from '@/types'
import { normalizeImagesBlock } from '@/types'
import { Video, CheckSquare, HelpCircle, CheckCircle, XCircle, ImageIcon, PenLine, RotateCcw, Table2, FileType, Upload, Loader2 } from 'lucide-react'
import { imagesApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { getYouTubeStartSeconds } from '@/lib/youtube-start'
import { Textarea } from '@/components/ui/textarea'
import { PdfViewer } from '@/components/lessons/pdf-viewer'
import { GameBlockRenderer } from '@/components/lessons/game-block-renderer'
import type { GameResultItem } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'a', 'span', 'ul', 'ol', 'li']
const ALLOWED_ATTR = ['href', 'target', 'rel', 'style']

export type QuizResultItem = { questionId: string; correct: boolean }

interface BlockRendererProps {
  blocks: ContentBlock[]
  variant?: 'default' | 'kids'
  /** Chamado quando o aluno verifica respostas do quiz (para salvar histórico). Opcional. */
  onQuizResult?: (blockIndex: number, results: QuizResultItem[]) => void
  /** Respostas já salvas das atividades de pergunta em texto (índice do bloco -> texto). Opcional. */
  savedOpenAnswers?: Record<number, string>
  /** Chamado quando o aluno clica em Salvar em uma atividade de pergunta em texto. Opcional. */
  onSaveOpenQuestion?: (blockIndex: number, answer: string) => void
  /** Metadados de arquivos já enviados por índice de bloco. Opcional. */
  savedActivityUploads?: Record<number, ActivityUploadMeta>
  /** Chamado quando o aluno seleciona um arquivo para enviar. Opcional. */
  onActivityUpload?: (blockIndex: number, file: File) => Promise<void>
  /** Resultados já salvos do quiz por bloco (histórico imutável). Quando existe, o aluno não pode enviar de novo. Opcional. */
  savedQuizResults?: Record<number, QuizResultItem[]>
  /** Estado persistido de checklist por índice de bloco */
  checklistState?: Record<number, boolean[]>
  onChecklistChange?: (blockIndex: number, checked: boolean[]) => void
  savedGameResults?: Record<number, GameResultItem>
  onGameComplete?: (blockIndex: number, result: GameResultItem) => void
}

export function BlockRenderer({
  blocks,
  variant = 'default',
  onQuizResult,
  savedOpenAnswers,
  onSaveOpenQuestion,
  savedActivityUploads,
  onActivityUpload,
  savedQuizResults,
  checklistState,
  onChecklistChange,
  savedGameResults,
  onGameComplete,
}: BlockRendererProps) {
  return (
    <div className="space-y-6">
      {blocks?.map((block, index) => (
        <div key={index}>
          {block.type === 'TEXT' && <TextBlockComponent value={block.value} />}
          {block.type === 'VIDEO' && (
            <VideoBlockComponent
              url={block.url}
              title={block.title}
              isGoogleDrive={block.isGoogleDrive}
              startSeconds={block.startSeconds}
              endSeconds={block.endSeconds}
            />
          )}
          {block.type === 'IFRAME' && <IframeBlockComponent url={block.url} title={block.title} googleDocId={block.googleDocId} />}
          {block.type === 'ACTIVITY_CHECKLIST' && (
            <ChecklistBlockComponent
              title={block.title}
              items={block.items}
              variant={variant}
              initialChecked={checklistState?.[index]}
              onChange={(checked) => onChecklistChange?.(index, checked)}
            />
          )}
          {block.type === 'QUIZ' && (
            <QuizBlockComponent
              block={block}
              blockIndex={index}
              variant={variant}
              onQuizResult={onQuizResult}
              savedBlockResults={savedQuizResults?.[index]}
            />
          )}
          {block.type === 'IMAGES' && (() => {
            const normalized = normalizeImagesBlock(block)
            return normalized ? <ImagesBlockComponent block={normalized} /> : null
          })()}
          {block.type === 'OPEN_QUESTION' && (
            <OpenQuestionBlockComponent
              block={block}
              blockIndex={index}
              initialAnswer={savedOpenAnswers?.[index] ?? ''}
              onSave={onSaveOpenQuestion}
            />
          )}
          {block.type === 'ACTIVITY_UPLOAD' && (
            <ActivityUploadBlockComponent
              block={block}
              blockIndex={index}
              savedUpload={savedActivityUploads?.[index]}
              onUpload={onActivityUpload}
            />
          )}
          {block.type === 'TABLE' && <TableBlockComponent block={block} />}
          {block.type === 'PDF' && <PdfBlockComponent block={block} />}
          {block.type === 'GAME' && (
            <GameBlockRenderer
              block={block}
              blockIndex={index}
              variant={variant}
              savedResult={savedGameResults?.[index]}
              onGameComplete={onGameComplete}
            />
          )}
        </div>
      ))}
    </div>
  )
}

/** Apenas caminhos relativos sob /lesson-pdfs/ (ficheiros em public/lesson-pdfs/). */
function safeLessonPdfSrc(src: string): string | null {
  const s = src.trim()
  if (!s.startsWith('/') || s.startsWith('//')) return null
  if (!s.toLowerCase().endsWith('.pdf')) return null
  if (!s.startsWith('/lesson-pdfs/')) return null
  return s
}

function PdfBlockComponent({ block }: { block: PdfBlock }) {
  const url = safeLessonPdfSrc(block.src)
  const heading = block.title?.trim() || 'Documento PDF'

  if (!url) {
    return (
      <Card className="gap-0 border-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20">
        <CardContent className="pt-6 pb-6 text-sm text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">PDF não configurado</p>
          <p>
            Coloque o ficheiro em{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">frontend/public/lesson-pdfs/</code> e defina o
            caminho público como{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/lesson-pdfs/nome.pdf</code>.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileType className="h-5 w-5 text-primary shrink-0" />
          {heading}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-3 space-y-3">
        <PdfViewer url={url} mode="continuous" initialScale={0.80} />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              Abrir em nova aba
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TableBlockComponent({ block }: { block: TableBlock }) {
  const rowMax = block.rows.reduce((m, r) => Math.max(m, r.length), 0)
  const cols = Math.max(block.headers.length, rowMax, 1)
  const headers =
    block.headers.length > 0 ? Array.from({ length: cols }, (_, i) => block.headers[i] ?? '') : []
  const rows = block.rows.map((r) => Array.from({ length: cols }, (_, i) => r[i] ?? ''))
  if (rows.length === 0) return null

  return (
    <Card className="gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Table2 className="h-5 w-5 text-primary shrink-0" />
          {block.caption || 'Tabela'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-3">
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-[min(100%,480px)] border-collapse text-sm">
            {headers.length > 0 && (
              <thead>
                <tr className="bg-muted/60">
                  {headers.map((h, i) => (
                    <th key={i} className="border px-3 py-2 text-left font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="odd:bg-muted/25">
                  {row.map((cell, ci) => (
                    <td key={ci} className="border px-3 py-2 align-top whitespace-pre-wrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function TextBlockComponent({ value }: { value: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(value)
  const sanitized = isHtml
    ? DOMPurify.sanitize(value, { ALLOWED_TAGS, ALLOWED_ATTR })
    : ''
  const isPlainText = !isHtml || sanitized.replace(/<[^>]+>/g, '').trim() === value.trim()

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

function VideoBlockComponent({
  url,
  title,
  isGoogleDrive,
  startSeconds: startSecondsProp,
  endSeconds: endSecondsProp,
}: {
  url: string
  title?: string
  isGoogleDrive?: boolean
  startSeconds?: number
  endSeconds?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<unknown>(null)
  const videoId = getYouTubeVideoId(url)
  const isYouTube = !isGoogleDrive && videoId !== null
  const startAt = isYouTube ? getYouTubeStartSeconds(url, startSecondsProp) : 0
  const endRaw =
    typeof endSecondsProp === 'number' && !Number.isNaN(endSecondsProp) && endSecondsProp >= 0
      ? Math.floor(endSecondsProp)
      : 0
  /** YouTube exige fim > início; ambos em segundos desde o começo do vídeo. */
  const endAt = endRaw > startAt ? endRaw : 0

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
          ...(startAt > 0 ? { start: startAt } : {}),
          ...(endAt > 0 ? { end: endAt } : {}),
        },
        events: {
          onReady: (event: {
            target: {
              setPlaybackQuality?: (q: string) => void
              getAvailableQualityLevels?: () => string[]
            }
          }) => {
            const qualityPriority = ['highres', 'hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium', 'small']
            const available = event.target.getAvailableQualityLevels?.() ?? []
            const bestAvailable = qualityPriority.find((q) => available.includes(q)) ?? 'highres'

            // YouTube trata qualidade como sugestão; aqui tentamos o melhor nível disponível.
            event.target.setPlaybackQuality?.(bestAvailable)
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
  }, [videoId, isYouTube, startAt, endAt])

  const getEmbedUrl = (videoUrl: string, start: number, end: number) => {
    const id = getYouTubeVideoId(videoUrl)
    if (id) {
      const params = new URLSearchParams({
        modestbranding: '1',
        rel: '0',
        iv_load_policy: '3',
        vq: 'hd1080',
      })
      if (start > 0) params.set('start', String(start))
      if (end > 0) params.set('end', String(end))
      return `https://www.youtube.com/embed/${id}?${params.toString()}`
    }
    return videoUrl
  }

  const embedUrl = isGoogleDrive ? url.trim() : getEmbedUrl(url, startAt, endAt)

  return (
    <Card className='gap-0'>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-5 w-5 text-primary" />
          {title || 'Vídeo'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-3">
        <div className="aspect-video overflow-hidden rounded-lg bg-muted">
          {isYouTube ? (
            <div ref={containerRef} className="h-full w-full" />
          ) : (
            <iframe
              src={embedUrl}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || 'Vídeo'}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const GOOGLE_DOC_EMBED_PADDING_BOTTOM = 129.4118

function IframeBlockComponent({ url, title, googleDocId }: { url: string; title?: string; googleDocId?: string }) {
  const docId = googleDocId?.trim()
  const embedUrl = docId
    ? `https://docs.google.com/document/d/${docId}/preview?usp=embed_googleplus`
    : url?.trim()
  if (!embedUrl) return null
  const isGoogleDoc = !!docId
  return (
    <Card className="gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {title || 'Conteúdo incorporado'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-3">
        <div
          className="w-full overflow-hidden rounded-lg bg-muted"
          style={
            isGoogleDoc
              ? { left: 0, width: '100%', height: 0, position: 'relative' as const, paddingBottom: `${GOOGLE_DOC_EMBED_PADDING_BOTTOM}%` }
              : { aspectRatio: '16/9' }
          }
        >
          <iframe
            src={embedUrl}
            className={isGoogleDoc ? 'border-0' : 'h-full w-full border-0'}
            style={isGoogleDoc ? { top: 0, left: 0, width: '100%', height: '100%', position: 'absolute' as const } : undefined}
            title={title || 'Conteúdo incorporado'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ChecklistBlockComponent({
  title,
  items,
  variant = 'default',
  initialChecked,
  onChange,
}: {
  title?: string
  items: string[]
  variant?: 'default' | 'kids'
  initialChecked?: boolean[]
  onChange?: (checked: boolean[]) => void
}) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(() => {
    const set = new Set<number>()
    initialChecked?.forEach((v, i) => {
      if (v) set.add(i)
    })
    return set
  })

  useEffect(() => {
    if (initialChecked) {
      const set = new Set<number>()
      initialChecked.forEach((v, i) => {
        if (v) set.add(i)
      })
      setCheckedItems(set)
    }
  }, [initialChecked])

  const toggleItem = (index: number) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedItems(newChecked)
    const arr = items.map((_, i) => newChecked.has(i))
    onChange?.(arr)
  }

  const allChecked = checkedItems.size === items.length

  return (
    <Card className={cn(allChecked && (variant === 'kids' ? 'border-secondary bg-secondary/10' : 'border-green-200 bg-green-50/50'))}>
      <CardHeader className="pb-3">
        <CardTitle className={cn('flex items-center justify-between', variant === 'kids' ? 'text-lg' : 'text-base')}>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            {title || (variant === 'kids' ? 'Desafio Prático' : 'Atividade Prática')}
          </div>
          {allChecked && (
            <Badge className={variant === 'kids' ? 'bg-secondary text-white' : 'bg-green-100 text-green-700'}>
              <CheckCircle className="mr-1 h-3 w-3" />
              {variant === 'kids' ? 'Mandou bem!' : 'Concluída'}
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
                variant === 'kids' && 'min-h-12 text-base',
                checkedItems.has(index)
                  ? variant === 'kids'
                    ? 'border-secondary bg-secondary/10'
                    : 'border-green-200 bg-green-50'
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
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)

  if (!block.images || block.images.length === 0) return null

  const selectedImage = selectedImageId ? block.images.find((img) => img.id === selectedImageId) : null
  const withBorder = block.cardWithBorder !== false

  return (
    <>
      <Card className={cn(!withBorder && 'border-0 shadow-none pt-0 pb-0 mt-[-20px]')}>
        <CardContent className="pt-0 px-3">
        {/*   <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span>Imagens</span>
          </div> */}
          <div className={cn(
            'flex gap-3 w-full',
            block.imageLayout === 'row' ? 'flex-row flex-wrap' : 'flex-col'
          )}>
            {block.images.map((img) => {
              const hasCustomSize = img.width != null || img.height != null
              const imageContainerStyle: React.CSSProperties = hasCustomSize
                ? {
                    width: img.width != null ? img.width : undefined,
                    height: img.height != null ? img.height : undefined,
                    maxWidth: '100%',
                  }
                : {}
              return (
                <div key={img.id} className=" flex flex-col">
                  <button
                    type="button"
                    onClick={() => setSelectedImageId(img.id)}
                    style={imageContainerStyle}
                    className="w-full shrink-0 min-h-0 p-0 m-0 flex items-center justify-center overflow-hidden rounded-lg border text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-muted/30 self-start"
                  >
                    <img
                      src={imagesApi.getUrl(img.id)}
                      alt={img.caption ?? ''}
                      className="max-h-full max-w-full w-auto h-auto object-contain pointer-events-none"
                    />
                  </button>
                  {img.caption && (
                    <p className="text-md">{img.caption}</p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedImageId !== null} onOpenChange={(open) => !open && setSelectedImageId(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col gap-4 p-4">
          <DialogHeader className="sr-only">
            <DialogTitle>Imagem em tamanho maior</DialogTitle>
          </DialogHeader>
          {selectedImageId && (
            <>
              <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden min-h-[60vh]">
                <img
                  src={imagesApi.getUrl(selectedImageId)}
                  alt={selectedImage?.caption ?? 'Imagem ampliada'}
                  className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
                />
              </div>
              {selectedImage?.caption && (
                <p className="text-center text-sm text-muted-foreground italic">{selectedImage.caption}</p>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedImageId(null)}>
                  Sair
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
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

const ACTIVITY_UPLOAD_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.txt,.zip'

function ActivityUploadBlockComponent({
  block,
  blockIndex,
  savedUpload,
  onUpload,
}: {
  block: ActivityUploadBlock
  blockIndex: number
  savedUpload?: ActivityUploadMeta
  onUpload?: (blockIndex: number, file: File) => Promise<void>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localMeta, setLocalMeta] = useState<ActivityUploadMeta | undefined>(savedUpload)

  useEffect(() => {
    setLocalMeta(savedUpload)
  }, [savedUpload])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !onUpload) return
    setError(null)
    setUploading(true)
    try {
      await onUpload(blockIndex, file)
      setLocalMeta({
        key: 'pending',
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar arquivo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-5 w-5 text-primary" />
          Subir atividade
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <p className="text-lg font-medium whitespace-pre-wrap">
          {block.description || 'Envie o arquivo da atividade.'}
        </p>
        {localMeta?.fileName && (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
            <span className="truncate">
              Arquivo enviado: <strong>{localMeta.fileName}</strong>
            </span>
          </div>
        )}
        {onUpload && (
          <div className="space-y-2">
            <input
              ref={inputRef}
              type="file"
              accept={ACTIVITY_UPLOAD_ACCEPT}
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <Button
              type="button"
              variant={localMeta ? 'outline' : 'default'}
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : localMeta ? (
                <>
                  <Upload className="h-4 w-4" />
                  Trocar arquivo
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Escolher arquivo
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              PDF, Word, Excel, PowerPoint, imagem, TXT ou ZIP · máx. 20 MB
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
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
  variant = 'default',
  onQuizResult,
  savedBlockResults,
}: {
  block: QuizBlock
  blockIndex: number
  variant?: 'default' | 'kids'
  onQuizResult?: (blockIndex: number, results: QuizResultItem[]) => void
  savedBlockResults?: QuizResultItem[]
}) {
  const questions = getQuizQuestions(block)
  const hasSavedResults = Array.isArray(savedBlockResults) && savedBlockResults.length > 0
  const [isRetrying, setIsRetrying] = useState(false)
  const alreadyResponded = hasSavedResults && !isRetrying
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
      if (isRetrying) setIsRetrying(false)
    }
  }, [blockIndex, onQuizResult, resultsSignature, quizSubmitted, alreadyResponded, isRetrying])

  const hasAnySelection = questions.some((q) => getSelected(q.id) !== null)
  const handleCorrigirTudo = () => {
    if (hasAnySelection && !alreadyResponded) setQuizSubmitted(true)
  }
  const handleTentarNovamente = () => {
    setIsRetrying(true)
    setPerQuestion({})
    setQuizSubmitted(false)
  }

  return (
    <Card className="gap-2">
      <CardHeader className="pb-0 gap-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <HelpCircle className="h-5 w-5 text-primary" />
          {variant === 'kids' ? 'Desafio!' : 'Quiz'}
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
              variant={variant}
            />
          )
        })}
        {alreadyResponded && (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">Você já respondeu este questionário.</p>
            <Button type="button" variant="outline" size="sm" onClick={handleTentarNovamente}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Tentar novamente
            </Button>
          </div>
        )}
        {!quizSubmitted && !alreadyResponded && (
          <div className="pt-2">
            <Button
              onClick={handleCorrigirTudo}
              disabled={!hasAnySelection}
              className={variant === 'kids' ? 'min-h-12 w-full text-lg' : undefined}
            >
              {variant === 'kids' ? 'Verificar resposta!' : 'Corrigir quiz'}
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
  variant = 'default',
}: {
  question: QuizQuestion
  questionNumber: number
  selectedOption: string | null
  onSelect: (optionId: string) => void
  submitted: boolean
  savedCorrect?: boolean
  variant?: 'default' | 'kids'
}) {
  const isCorrect = selectedOption === question.correctOptionId
  const showCorrect = savedCorrect !== undefined ? savedCorrect : isCorrect
  const isKids = variant === 'kids'

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        submitted &&
          (showCorrect
            ? isKids
              ? 'border-secondary bg-secondary/10'
              : 'border-green-200 bg-green-50/30'
            : isKids
              ? 'border-primary/30 bg-primary/5'
              : 'border-red-200 bg-red-50/30')
      )}
    >
      <p className="mb-3 text-sm font-medium text-muted-foreground">Pergunta {questionNumber}</p>
      <p className={cn('mb-4 font-medium', isKids ? 'text-xl' : 'text-lg')}>{question.question}</p>
      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.id
          const showOptionCorrect = submitted && option.id === question.correctOptionId
          const showIncorrect = submitted && isSelected && !isCorrect

          return (
            <button
              key={option.id}
              disabled={submitted}
              onClick={() => onSelect(option.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                isKids && 'min-h-12 text-base',
                !submitted && isSelected && 'border-primary bg-primary/5',
                !submitted && !isSelected && 'hover:bg-muted/50',
                showOptionCorrect && (isKids ? 'border-secondary bg-secondary/10' : 'border-green-500 bg-green-50'),
                showIncorrect && !isKids && 'border-red-500 bg-red-50'
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
              {showOptionCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
              {showIncorrect && !isKids && <XCircle className="h-5 w-5 text-red-600" />}
            </button>
          )
        })}
      </div>
      {submitted && (
        <div className="mt-3">
          {showCorrect ? (
            <Badge className={isKids ? 'bg-secondary text-white h-10 px-4 text-base' : 'bg-green-100 text-green-700 h-8 px-3'}>
              <CheckCircle className="mr-1 h-3 w-3" />
              {isKids ? 'Isso aí! Mandou bem!' : 'Correto!'}
            </Badge>
          ) : (
            <Badge className={isKids ? 'bg-primary/20 text-primary h-10 px-4 text-base' : 'bg-red-100 text-red-700 h-8 px-3'}>
              {isKids ? '🤖 Quase! Tenta outra vez!' : (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  Incorreto
                </>
              )}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
