'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/lessons/rich-text-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, GripVertical, FileText, Video, CheckSquare, HelpCircle, ImageIcon, X, Loader2, PenLine, Layout, Table2, FileType, Gamepad2, Upload } from 'lucide-react'
import type { ContentBlock, BlockType, QuizBlock, QuizQuestion, ImageWithCaption, ImagesBlock, TableBlock, GameBlock } from '@/types'
import { normalizeImagesBlock } from '@/types'
import { imagesApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { countWords, KIDS_TEXT_LIMITS } from '@/lib/kids-messages'
import { formatSecondsAsMmSs, parseTimeInputToSeconds } from '@/lib/youtube-start'
import { Textarea } from '../ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { GameBlockEditor } from '@/components/lessons/game-block-editor'

interface BlockEditorProps {
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
  isKidsModule?: boolean
}

function createBlockByType(type: BlockType): ContentBlock {
  if (type === 'TEXT') return { type: 'TEXT', value: '' }
  if (type === 'VIDEO') return { type: 'VIDEO', url: '', title: '', isGoogleDrive: false }
  if (type === 'IFRAME') return { type: 'IFRAME', url: '', title: '' }
  if (type === 'ACTIVITY_CHECKLIST') return { type: 'ACTIVITY_CHECKLIST', title: '', items: [''] }
  if (type === 'IMAGES') return { type: 'IMAGES', images: [], cardWithBorder: true, imageLayout: 'column' }
  if (type === 'OPEN_QUESTION') return { type: 'OPEN_QUESTION', question: '' }
  if (type === 'ACTIVITY_UPLOAD') return { type: 'ACTIVITY_UPLOAD', description: '' }
  if (type === 'TABLE')
    return {
      type: 'TABLE',
      caption: '',
      headers: ['Extensão', 'Tipo de arquivo', 'Aberto com'],
      rows: [
        ['.docx', 'Documento de texto (Word)', 'Microsoft Word, LibreOffice'],
        ['.pdf', 'Documento portátil (não editável)', 'Adobe Reader, navegador'],
        ['.txt', 'Texto simples', 'Bloco de Notas'],
        ['.jpg / .jpeg', 'Foto ou imagem', 'Visualizador de Fotos'],
        ['.png', 'Imagem (com fundo transparente)', 'Visualizador de Fotos'],
        ['.mp3', 'Música / áudio', 'Windows Media Player'],
      ],
    }
  if (type === 'PDF') return { type: 'PDF', src: '/lesson-pdfs/', title: '' }
  if (type === 'GAME') return { type: 'GAME', gameId: '', title: '' }
  return {
    type: 'QUIZ',
    questions: [{
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `q-${Date.now()}`,
      question: '',
      options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }],
      correctOptionId: 'a',
    }],
  } as QuizBlock
}

export function BlockEditor({ blocks, onChange, isKidsModule = false }: BlockEditorProps) {
  const [addingType, setAddingType] = useState<BlockType | ''>('')
  const [insertBelowIndex, setInsertBelowIndex] = useState<number | null>(null)

  const blockTypeOptions = isKidsModule
    ? [...BLOCK_TYPE_OPTIONS, { value: 'GAME' as BlockType, label: 'Jogo', icon: <Gamepad2 className="h-4 w-4" /> }]
    : BLOCK_TYPE_OPTIONS

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = Number(active.id)
    const newIndex = Number(over.id)
    onChange(arrayMove(blocks, oldIndex, newIndex))
  }

  const addBlock = () => {
    if (!addingType) return
    onChange([...blocks, createBlockByType(addingType)])
    setAddingType('')
  }

  const confirmInsertBelow = (type: BlockType) => {
    if (insertBelowIndex === null) return
    const newBlock = createBlockByType(type)
    const next = [...blocks.slice(0, insertBelowIndex + 1), newBlock, ...blocks.slice(insertBelowIndex + 1)]
    onChange(next)
    setInsertBelowIndex(null)
  }

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const updateBlock = (index: number, updated: ContentBlock) => {
    const next = [...blocks]
    next[index] = updated
    onChange(next)
  }

  // Use index as string ID for DnD
  const itemIds = blocks.map((_, i) => String(i))

  return (
    <div className="space-y-4">
      {blocks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum bloco adicionado. Use o botão abaixo para adicionar conteúdo.
        </p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {blocks.map((block, index) => (
            <SortableBlockItem
              key={index}
              id={String(index)}
              index={index}
              insertBelowIndex={insertBelowIndex}
              onRemove={() => removeBlock(index)}
              onAddBelow={() => setInsertBelowIndex((i) => (i === index ? null : index))}
              onConfirmInsertBelow={confirmInsertBelow}
              blockTypeOptions={blockTypeOptions}
            >
              {block.type === 'TEXT' && (
                <TextBlockEditor
                  value={block.value}
                  onChange={(value) => updateBlock(index, { type: 'TEXT', value })}
                  isKidsModule={isKidsModule}
                />
              )}
              {block.type === 'VIDEO' && (
                <VideoBlockEditor
                  url={block.url}
                  title={block.title}
                  isGoogleDrive={block.isGoogleDrive}
                  startSeconds={block.startSeconds}
                  endSeconds={block.endSeconds}
                  onChange={(url, title, isGoogleDrive, startSec, endSec) => {
                    const next = { type: 'VIDEO' as const, url, title, isGoogleDrive: !!isGoogleDrive }
                    if (typeof startSec === 'number' && !Number.isNaN(startSec) && startSec >= 0) {
                      // @ts-ignore
                      next.startSeconds = Math.floor(startSec)
                    }
                    if (typeof endSec === 'number' && !Number.isNaN(endSec) && endSec >= 0) {
                      // @ts-ignore
                      next.endSeconds = Math.floor(endSec)
                    }
                    updateBlock(index, next)
                  }}
                />
              )}
              {block.type === 'IFRAME' && (
                <IframeBlockEditor
                  url={block.url}
                  title={block.title}
                  googleDocId={block.googleDocId}
                  onChange={(url, title, googleDocId) => updateBlock(index, { type: 'IFRAME', url, title, googleDocId })}
                />
              )}
              {block.type === 'ACTIVITY_CHECKLIST' && (
                <ChecklistBlockEditor
                  title={block.title}
                  items={block.items}
                  onChange={(title, items) =>
                    updateBlock(index, { type: 'ACTIVITY_CHECKLIST', title, items })
                  }
                />
              )}
              {block.type === 'QUIZ' && (
                <QuizBlockEditor
                  block={block}
                  onChange={(questions) =>
                    updateBlock(index, { type: 'QUIZ', questions })
                  }
                />
              )}
              {block.type === 'IMAGES' && (() => {
                const normalized = normalizeImagesBlock(block)
                if (!normalized) return null
                const current = block as ImagesBlock
                return (
                  <ImageBlockEditor
                    images={normalized.images}
                    cardWithBorder={normalized.cardWithBorder ?? true}
                    imageLayout={normalized.imageLayout ?? 'column'}
                    onChange={(images) =>
                      updateBlock(index, { type: 'IMAGES', images, cardWithBorder: current.cardWithBorder ?? true, imageLayout: current.imageLayout ?? 'column' })
                    }
                    onCardWithBorderChange={(cardWithBorder) =>
                      updateBlock(index, { type: 'IMAGES', images: normalized.images, cardWithBorder, imageLayout: current.imageLayout ?? 'column' })
                    }
                    onImageLayoutChange={(imageLayout) =>
                      updateBlock(index, { type: 'IMAGES', images: normalized.images, cardWithBorder: current.cardWithBorder ?? true, imageLayout })
                    }
                  />
                )
              })()}
              {block.type === 'OPEN_QUESTION' && (
                <OpenQuestionBlockEditor
                  question={block.question}
                  onChange={(question) =>
                    updateBlock(index, { type: 'OPEN_QUESTION', question })
                  }
                />
              )}
              {block.type === 'ACTIVITY_UPLOAD' && (
                <ActivityUploadBlockEditor
                  description={block.description}
                  onChange={(description) =>
                    updateBlock(index, { type: 'ACTIVITY_UPLOAD', description })
                  }
                />
              )}
              {block.type === 'TABLE' && (
                <TableBlockEditor
                  block={block}
                  onChange={(updated) => updateBlock(index, updated)}
                />
              )}
              {block.type === 'PDF' && (
                <PdfBlockEditor
                  src={block.src}
                  title={block.title}
                  onChange={(src, title) => updateBlock(index, { type: 'PDF', src, title })}
                />
              )}
              {block.type === 'GAME' && (
                <GameBlockEditor
                  block={block}
                  onChange={(updated) => updateBlock(index, updated)}
                />
              )}
            </SortableBlockItem>
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex gap-2 pt-2">
        <Select value={addingType} onValueChange={(v) => setAddingType(v as BlockType)}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Tipo de bloco..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TEXT">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Texto
              </div>
            </SelectItem>
            <SelectItem value="VIDEO">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" /> Vídeo
              </div>
            </SelectItem>
            <SelectItem value="IFRAME">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4" /> Iframe (embed)
              </div>
            </SelectItem>
            <SelectItem value="ACTIVITY_CHECKLIST">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" /> Checklist
              </div>
            </SelectItem>
            <SelectItem value="QUIZ">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" /> Quiz
              </div>
            </SelectItem>
            <SelectItem value="IMAGES">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Imagens
              </div>
            </SelectItem>
            <SelectItem value="OPEN_QUESTION">
              <div className="flex items-center gap-2">
                <PenLine className="h-4 w-4" /> Pergunta (resposta em texto)
              </div>
            </SelectItem>
            <SelectItem value="ACTIVITY_UPLOAD">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" /> Subir atividade
              </div>
            </SelectItem>
            <SelectItem value="TABLE">
              <div className="flex items-center gap-2">
                <Table2 className="h-4 w-4" /> Tabela
              </div>
            </SelectItem>
            <SelectItem value="PDF">
              <div className="flex items-center gap-2">
                <FileType className="h-4 w-4" /> PDF
              </div>
            </SelectItem>
            {isKidsModule && (
              <SelectItem value="GAME">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" /> Jogo
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <Button onClick={addBlock} disabled={!addingType} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

    </div>
  )
}

const BLOCK_TYPE_OPTIONS: { value: BlockType; label: string; icon: React.ReactNode }[] = [
  { value: 'TEXT', label: 'Texto', icon: <FileText className="h-4 w-4" /> },
  { value: 'VIDEO', label: 'Vídeo', icon: <Video className="h-4 w-4" /> },
  { value: 'IFRAME', label: 'Iframe (embed)', icon: <Layout className="h-4 w-4" /> },
  { value: 'ACTIVITY_CHECKLIST', label: 'Checklist', icon: <CheckSquare className="h-4 w-4" /> },
  { value: 'QUIZ', label: 'Quiz', icon: <HelpCircle className="h-4 w-4" /> },
  { value: 'IMAGES', label: 'Imagens', icon: <ImageIcon className="h-4 w-4" /> },
  { value: 'OPEN_QUESTION', label: 'Pergunta (texto)', icon: <PenLine className="h-4 w-4" /> },
  { value: 'ACTIVITY_UPLOAD', label: 'Subir atividade', icon: <Upload className="h-4 w-4" /> },
  { value: 'TABLE', label: 'Tabela', icon: <Table2 className="h-4 w-4" /> },
  { value: 'PDF', label: 'PDF', icon: <FileType className="h-4 w-4" /> },
]

function SortableBlockItem({
  id,
  index,
  insertBelowIndex,
  children,
  onRemove,
  onAddBelow,
  onConfirmInsertBelow,
  blockTypeOptions,
}: {
  id: string
  index: number
  insertBelowIndex: number | null
  children: React.ReactNode
  onRemove: () => void
  onAddBelow: () => void
  onConfirmInsertBelow: (type: BlockType) => void
  blockTypeOptions: { value: BlockType; label: string; icon: React.ReactNode }[]
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const showInsertSelect = insertBelowIndex === index

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex gap-2', isDragging && 'opacity-50')}
    >
      <div
        className="mt-3 cursor-grab active:cursor-grabbing text-muted-foreground touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1">{children}</div>
      <div className="flex flex-col gap-1 shrink-0 mt-2 w-[25px]">
        <div className="flex gap-1  flex-col">
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive h-8 w-8"
            onClick={onRemove}
            title="Excluir bloco"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={onAddBelow}
            title="Adicionar bloco abaixo"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {showInsertSelect && (
          <Select
            onValueChange={(v) => {
              onConfirmInsertBelow(v as BlockType)
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Tipo..." />
            </SelectTrigger>
            <SelectContent>
              {blockTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    {opt.icon} {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}

function PdfBlockEditor({
  src,
  title,
  onChange,
}: {
  src: string
  title?: string
  onChange: (src: string, title?: string) => void
}) {
  return (
    <Card className="gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FileType className="h-4 w-4" /> PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Título (opcional)</Label>
          <Input
            value={title ?? ''}
            onChange={(e) => onChange(src, e.target.value.trim() || undefined)}
            placeholder="Ex.: Leitura complementar"
          />
        </div>
        <div className="space-y-1">
          <Label>Caminho do ficheiro</Label>
          <Input
            value={src}
            onChange={(e) => onChange(e.target.value, title)}
            placeholder="/lesson-pdfs/material.pdf"
            className="font-mono text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Guarde o PDF em{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-[11px]">frontend/public/lesson-pdfs/</code> e
          indique o caminho público (começa com <code className="rounded bg-muted px-1 text-[11px]">/lesson-pdfs/</code>).
        </p>
      </CardContent>
    </Card>
  )
}

function TextBlockEditor({
  value,
  onChange,
  isKidsModule = false,
}: {
  value: string
  onChange: (value: string) => void
  isKidsModule?: boolean
}) {
  const wordCount = countWords(value)
  const overLimit = isKidsModule && wordCount > KIDS_TEXT_LIMITS.blockWords

  return (
    <Card className='gap-0'>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4" /> Texto
        </CardTitle>
      </CardHeader>
      <CardContent>
        {overLimit && (
          <p className="mb-2 text-sm font-medium text-amber-600">
            Modo Kids: texto longo ({wordCount} palavras). Ideal: até {KIDS_TEXT_LIMITS.blockWords} palavras.
          </p>
        )}
        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder="Digite o conteúdo de texto..."
          minHeight="160px"
        />
      </CardContent>
    </Card>
  )
}

function VideoBlockEditor({
  url,
  title,
  isGoogleDrive = false,
  startSeconds,
  endSeconds,
  onChange,
}: {
  url: string
  title?: string
  isGoogleDrive?: boolean
  startSeconds?: number
  endSeconds?: number
  onChange: (
    url: string,
    title?: string,
    isGoogleDrive?: boolean,
    startSeconds?: number,
    endSeconds?: number,
  ) => void
}) {
  const [startDraft, setStartDraft] = useState(() =>
    startSeconds != null && startSeconds >= 0 ? formatSecondsAsMmSs(startSeconds) : '',
  )
  const [endDraft, setEndDraft] = useState(() =>
    endSeconds != null && endSeconds >= 0 ? formatSecondsAsMmSs(endSeconds) : '',
  )

  useEffect(() => {
    setStartDraft(startSeconds != null && startSeconds >= 0 ? formatSecondsAsMmSs(startSeconds) : '')
  }, [startSeconds])

  useEffect(() => {
    setEndDraft(endSeconds != null && endSeconds >= 0 ? formatSecondsAsMmSs(endSeconds) : '')
  }, [endSeconds])

  const commitStartDraft = () => {
    const trimmed = startDraft.trim()
    if (!trimmed) {
      onChange(url, title, isGoogleDrive, undefined, endSeconds)
      return
    }
    const sec = parseTimeInputToSeconds(trimmed)
    if (sec !== undefined) onChange(url, title, isGoogleDrive, sec, endSeconds)
    else
      setStartDraft(startSeconds != null && startSeconds >= 0 ? formatSecondsAsMmSs(startSeconds) : '')
  }

  const commitEndDraft = () => {
    const trimmed = endDraft.trim()
    if (!trimmed) {
      onChange(url, title, isGoogleDrive, startSeconds, undefined)
      return
    }
    const sec = parseTimeInputToSeconds(trimmed)
    if (sec !== undefined) onChange(url, title, isGoogleDrive, startSeconds, sec)
    else setEndDraft(endSeconds != null && endSeconds >= 0 ? formatSecondsAsMmSs(endSeconds) : '')
  }

  return (
    <Card className='gap-0'>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Video className="h-4 w-4" /> Vídeo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="video-google-drive"
            checked={isGoogleDrive}
            onCheckedChange={(checked) => onChange(url, title, checked === true, startSeconds, endSeconds)}
          />
          <Label htmlFor="video-google-drive" className="cursor-pointer font-normal">
            Google Drive
          </Label>
        </div>
        <div className="space-y-1">
          <Label>Título (opcional)</Label>
          <Input
            value={title ?? ''}
            onChange={(e) => onChange(url, e.target.value, isGoogleDrive, startSeconds, endSeconds)}
            placeholder="Título do vídeo"
          />
        </div>
        <div className="space-y-1">
          <Label>{isGoogleDrive ? 'URL de incorporação do Google Drive' : 'URL do YouTube'}</Label>
          <Input
            value={url}
            onChange={(e) => onChange(e.target.value, title, isGoogleDrive, startSeconds, endSeconds)}
            placeholder={isGoogleDrive ? 'https://drive.google.com/file/d/.../preview' : 'https://www.youtube.com/watch?v=...'}
          />
        </div>
        {!isGoogleDrive && (
          <>
            <div className="space-y-1">
              <Label>Início (opcional)</Label>
              <Input
                value={startDraft}
                onChange={(e) => setStartDraft(e.target.value)}
                onBlur={commitStartDraft}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitStartDraft()
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                placeholder="ex: 1:23 ou 83"
              />
              <p className="text-xs text-muted-foreground">
                Tempo em que o vídeo começa (YouTube). Se vazio, também vale{' '}
                <span className="font-mono text-[11px]">&amp;t=</span> ou{' '}
                <span className="font-mono text-[11px]">&amp;start=</span> na URL.
              </p>
            </div>
            <div className="space-y-1">
              <Label>Fim (opcional)</Label>
              <Input
                value={endDraft}
                onChange={(e) => setEndDraft(e.target.value)}
                onBlur={commitEndDraft}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    commitEndDraft()
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                placeholder="ex: 5:00 ou 300"
              />
              <p className="text-xs text-muted-foreground">
                O player para nesse instante (tempo absoluto do vídeo, desde o começo). Precisa ser maior que o início.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function IframeBlockEditor({
  url,
  title,
  googleDocId = '',
  onChange,
}: {
  url: string
  title?: string
  googleDocId?: string
  onChange: (url: string, title?: string, googleDocId?: string) => void
}) {
  return (
    <Card className="gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Layout className="h-4 w-4" /> Iframe (embed)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Título (opcional)</Label>
          <Input
            value={title ?? ''}
            onChange={(e) => onChange(url, e.target.value, googleDocId)}
            placeholder="Ex: Jogo de matemática"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="iframe-google-docs"
            checked={googleDocId != null}
            onCheckedChange={(checked) => {
              if (checked) onChange(url, title, '')
              else onChange(url, title, undefined)
            }}
          />
          <Label htmlFor="iframe-google-docs" className="cursor-pointer font-normal">
            Google Docs (incorporar por ID)
          </Label>
        </div>
        <div className="space-y-1">
          <Label>{googleDocId != null ? 'ID do documento Google Docs' : 'URL para incorporar'}</Label>
          <Input
            value={googleDocId != null ? (googleDocId || '') : url}
            onChange={(e) => {
              const v = e.target.value
              if (googleDocId != null) onChange(url, title, v)
              else onChange(v, title, undefined)
            }}
            placeholder={googleDocId != null ? 'Ex: 1tsCEo6UW5G6HmQn8eOvLNwuHKpfbxcWyxNgSIBuXThU' : 'https://...'}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function OpenQuestionBlockEditor({
  question,
  onChange,
}: {
  question: string
  onChange: (question: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <PenLine className="h-4 w-4" /> Pergunta (resposta em texto)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Pergunta ou enunciado</Label>
          <Textarea
            value={question}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Digite a pergunta que o aluno deve responder..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityUploadBlockEditor({
  description,
  onChange,
}: {
  description: string
  onChange: (description: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Upload className="h-4 w-4" /> Subir atividade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Descrição / enunciado</Label>
          <Textarea
            value={description}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Explique o que o aluno deve enviar (ex.: planilha da atividade do mês)..."
            rows={4}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          O aluno verá um campo para enviar 1 arquivo. A aula só poderá ser concluída após o envio.
        </p>
      </CardContent>
    </Card>
  )
}

function getTableColumnCount(block: TableBlock): number {
  const rowMax = block.rows.reduce((m, r) => Math.max(m, r.length), 0)
  return Math.max(block.headers.length, rowMax, 1)
}

function padTableRows(block: TableBlock): { headers: string[]; rows: string[][]; cols: number; hasHeader: boolean } {
  const hasHeader = block.headers.length > 0
  const cols = getTableColumnCount(block)
  const headers = hasHeader
    ? Array.from({ length: cols }, (_, i) => block.headers[i] ?? '')
    : []
  let rows = block.rows.map((r) => Array.from({ length: cols }, (_, i) => r[i] ?? ''))
  if (rows.length === 0) rows = [Array.from({ length: cols }, () => '')]
  return { headers, rows, cols, hasHeader }
}

function TableBlockEditor({
  block,
  onChange,
}: {
  block: TableBlock
  onChange: (b: TableBlock) => void
}) {
  const { headers, rows, cols, hasHeader } = padTableRows(block)

  const commit = (next: TableBlock) => {
    const c = getTableColumnCount(next)
    const h =
      next.headers.length > 0
        ? Array.from({ length: c }, (_, i) => next.headers[i] ?? '')
        : []
    const rs = next.rows.map((r) => Array.from({ length: c }, (_, i) => r[i] ?? ''))
    onChange({ ...next, headers: h, rows: rs.length ? rs : [Array.from({ length: c }, () => '')] })
  }

  const setCaption = (caption: string) => commit({ ...block, caption: caption || undefined })

  const setHeaderCell = (col: number, value: string) => {
    const nextHeaders = headers.map((cell, i) => (i === col ? value : cell))
    commit({ ...block, headers: nextHeaders })
  }

  const setBodyCell = (row: number, col: number, value: string) => {
    const nextRows = rows.map((r, ri) =>
      ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r
    )
    commit({ ...block, rows: nextRows })
  }

  const addColumn = () => {
    const newCols = cols + 1
    const h = hasHeader ? [...headers, ''] : []
    const rs = rows.map((r) => [...r, ''])
    commit({ ...block, headers: h, rows: rs })
  }

  const removeColumn = () => {
    if (cols <= 1) return
    const newCols = cols - 1
    const h = hasHeader ? headers.slice(0, newCols) : []
    const rs = rows.map((r) => r.slice(0, newCols))
    commit({ ...block, headers: h, rows: rs })
  }

  const addRow = () => {
    commit({ ...block, rows: [...rows, Array.from({ length: cols }, () => '')] })
  }

  const removeRow = (rowIndex: number) => {
    if (rows.length <= 1) return
    commit({ ...block, rows: rows.filter((_, i) => i !== rowIndex) })
  }

  const toggleHeader = () => {
    if (hasHeader) {
      commit({ ...block, headers: [] })
    } else {
      commit({ ...block, headers: Array.from({ length: cols }, () => '') })
    }
  }

  return (
    <Card className="gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Table2 className="h-4 w-4" /> Tabela
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Título (opcional)</Label>
          <Input
            value={block.caption ?? ''}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Ex.: Tipos de arquivo e programas"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={toggleHeader}>
            {hasHeader ? 'Remover linha de cabeçalho' : 'Adicionar linha de cabeçalho'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addColumn}>
            <Plus className="h-4 w-4 mr-1" /> Coluna
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={removeColumn} disabled={cols <= 1}>
            Remover coluna
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4 mr-1" /> Linha
          </Button>
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            {hasHeader && (
              <thead>
                <tr className="bg-muted/60">
                  {headers.map((cell, col) => (
                    <th key={col} className="border p-1 align-top font-medium">
                      <Input
                        className="h-8 min-w-[100px] border-0 bg-transparent shadow-none focus-visible:ring-1"
                        value={cell}
                        onChange={(e) => setHeaderCell(col, e.target.value)}
                        placeholder={`Coluna ${col + 1}`}
                      />
                    </th>
                  ))}
                  <th className="w-10 border bg-muted/60 p-1" aria-hidden />
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-muted/20">
                  {row.map((cell, col) => (
                    <td key={col} className="border p-1 align-top">
                      <Input
                        className="h-8 min-w-[100px] border-0 bg-transparent shadow-none focus-visible:ring-1"
                        value={cell}
                        onChange={(e) => setBodyCell(rowIndex, col, e.target.value)}
                        placeholder="—"
                      />
                    </td>
                  ))}
                  <td className="border-0 w-10 p-1 align-middle">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn('h-8 w-8', rows.length <= 1 && 'invisible pointer-events-none')}
                      onClick={() => removeRow(rowIndex)}
                      title="Remover linha"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function ChecklistBlockEditor({
  title,
  items,
  onChange,
}: {
  title?: string
  items: string[]
  onChange: (title: string | undefined, items: string[]) => void
}) {
  const updateItem = (index: number, value: string) => {
    const next = [...items]
    next[index] = value
    onChange(title, next)
  }

  const addItem = () => onChange(title, [...items, ''])

  const removeItem = (index: number) =>
    onChange(title, items.filter((_, i) => i !== index))

  return (
    <Card className='gap-0'>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CheckSquare className="h-4 w-4" /> Checklist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Título (opcional)</Label>
          <Input
            value={title ?? ''}
            onChange={(e) => onChange(e.target.value || undefined, items)}
            placeholder="Título da atividade"
          />
        </div>
        <div className="space-y-2">
          <Label>Itens</Label>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={`Item ${i + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                className={cn('shrink-0', items.length <= 1 && 'invisible')}
                onClick={() => removeItem(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar item
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const DEFAULT_WIDTH_PX = 400
const DEFAULT_HEIGHT_PX = 300
const MIN_PX = 80
const MAX_PX = 2000
const RESIZE_DEBOUNCE_MS = 150
/** Só persiste tamanho se a diferença for maior que isso em px (evita loop). */
const SIZE_CHANGE_THRESHOLD_PX = 8

function ImageBlockEditor({
  images,
  cardWithBorder,
  imageLayout,
  onChange,
  onCardWithBorderChange,
  onImageLayoutChange,
}: {
  images: ImageWithCaption[]
  cardWithBorder: boolean
  imageLayout: 'column' | 'row'
  onChange: (images: ImageWithCaption[]) => void
  onCardWithBorderChange: (cardWithBorder: boolean) => void
  onImageLayoutChange: (imageLayout: 'column' | 'row') => void
}) {
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploaded = await imagesApi.upload(Array.from(files))
      const newImages: ImageWithCaption[] = uploaded.map((img) => ({ id: img.id, caption: '' }))
      onChange([...images, ...newImages])
    } catch {
      // silently ignore upload errors in editor
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id))
  }

  const updateCaption = (id: string, caption: string) => {
    onChange(
      images.map((img) => (img.id === id ? { ...img, caption: caption || undefined } : img))
    )
  }

  const updateImageSize = useCallback(
    (id: string, widthPx: number, heightPx: number) => {
      const w = Math.min(MAX_PX, Math.max(MIN_PX, Math.round(widthPx)))
      const h = Math.min(MAX_PX, Math.max(MIN_PX, Math.round(heightPx)))
      onChange(
        images.map((img) => (img.id === id ? { ...img, width: w, height: h } : img))
      )
    },
    [images, onChange]
  )

  return (
    <Card className="gap-0">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="h-4 w-4" /> Imagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="card-with-border"
              checked={cardWithBorder}
              onCheckedChange={(checked) => onCardWithBorderChange(checked === true)}
            />
            <label
              htmlFor="card-with-border"
              className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Card com contorno
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="image-layout-row"
              checked={imageLayout === 'row'}
              onCheckedChange={(checked) => onImageLayoutChange(checked === true ? 'row' : 'column')}
            />
            <label
              htmlFor="image-layout-row"
              className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Exibir em linha (row)
            </label>
          </div>
        </div>
        {images.length > 0 && (
          <div className="space-y-4">
            {images.map((img) => (
              <ResizableImageItem
                key={img.id}
                img={img}
                onRemove={() => removeImage(img.id)}
                onCaptionChange={(caption) => updateCaption(img.id, caption)}
                onSizeChange={(widthPx, heightPx) => updateImageSize(img.id, widthPx, heightPx)}
              />
            ))}
          </div>
        )}
        <Label
          htmlFor={`img-upload-${images.map((i) => i.id).join('-')}`}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-sm text-muted-foreground transition-colors hover:bg-muted/50',
            uploading && 'pointer-events-none opacity-50'
          )}
        >
          {uploading ? (
            <><Loader2 className="mb-2 h-5 w-5 animate-spin" /> Enviando...</>
          ) : (
            <><ImageIcon className="mb-2 h-5 w-5" /> Clique para adicionar imagens</>
          )}
          <input
            id={`img-upload-${images.map((i) => i.id).join('-')}`}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </Label>
      </CardContent>
    </Card>
  )
}

function ResizableImageItem({
  img,
  onRemove,
  onCaptionChange,
  onSizeChange,
}: {
  img: ImageWithCaption
  onRemove: () => void
  onCaptionChange: (caption: string) => void
  onSizeChange: (widthPx: number, heightPx: number) => void
}) {
  const resizableRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialCallRef = useRef(true)

  useEffect(() => {
    const el = resizableRef.current
    if (!el) return

    const handleResize = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        if (initialCallRef.current) {
          initialCallRef.current = false
          return
        }
        const wPx = Math.round(el.offsetWidth)
        const hPx = Math.round(el.offsetHeight)
        if (wPx <= 0 || hPx <= 0) return
        const currentW = img.width ?? DEFAULT_WIDTH_PX
        const currentH = img.height ?? DEFAULT_HEIGHT_PX
        const diffW = Math.abs(wPx - currentW)
        const diffH = Math.abs(hPx - currentH)
        if (diffW >= SIZE_CHANGE_THRESHOLD_PX || diffH >= SIZE_CHANGE_THRESHOLD_PX) {
          onSizeChange(wPx, hPx)
        }
      }, RESIZE_DEBOUNCE_MS)
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [onSizeChange, img.width, img.height])

  const widthPx = img.width ?? DEFAULT_WIDTH_PX
  const heightPx = img.height ?? DEFAULT_HEIGHT_PX

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <div
        ref={resizableRef}
        style={{
          width: widthPx,
          height: heightPx,
          minWidth: MIN_PX,
          minHeight: MIN_PX,
          maxWidth: MAX_PX,
          maxHeight: MAX_PX,
          resize: 'both',
          overflow: 'auto',
        }}
        className="relative group rounded-lg border border-primary/30 bg-muted"
      >
        <img
          src={imagesApi.getUrl(img.id)}
          alt={img.caption ?? ''}
          className="h-full w-full object-cover pointer-events-none"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Legenda (opcional)</Label>
        <Input
          value={img.caption ?? ''}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Legenda desta imagem"
        />
      </div>
    </div>
  )
}

function getQuizQuestions(block: QuizBlock): QuizQuestion[] {
  if (Array.isArray(block.questions) && block.questions.length > 0) return block.questions
  const legacy = block as QuizBlock & { question?: string; options?: QuizQuestion['options']; correctOptionId?: string }
  return [{
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `q-${Date.now()}`,
    question: legacy.question ?? '',
    options: legacy.options ?? [],
    correctOptionId: legacy.correctOptionId ?? '',
  }]
}

function QuizBlockEditor({
  block,
  onChange,
}: {
  block: QuizBlock
  onChange: (questions: QuizQuestion[]) => void
}) {
  const questions = getQuizQuestions(block)

  const updateQuestion = (questionIndex: number, updated: QuizQuestion) => {
    const next = [...questions]
    next[questionIndex] = updated
    onChange(next)
  }

  const addQuestion = () => {
    onChange([
      ...questions,
      {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `q-${Date.now()}`,
        question: '',
        options: [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }],
        correctOptionId: 'a',
      },
    ])
  }

  const removeQuestion = (questionIndex: number) => {
    if (questions.length <= 1) return
    onChange(questions.filter((_, i) => i !== questionIndex))
  }

  return (
    <Card className='gap-0'>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <HelpCircle className="h-4 w-4" /> Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={q.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">Pergunta {qIndex + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => removeQuestion(qIndex)}
                disabled={questions.length <= 1}
                title={questions.length <= 1 ? 'O quiz precisa de pelo menos uma pergunta' : 'Remover pergunta'}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <SingleQuestionEditor
              question={q.question}
              options={q.options}
              correctOptionId={q.correctOptionId}
              onChange={(question, options, correctOptionId) =>
                updateQuestion(qIndex, { ...q, question, options, correctOptionId })
              }
            />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar pergunta
        </Button>
      </CardContent>
    </Card>
  )
}

function SingleQuestionEditor({
  question,
  options,
  correctOptionId,
  onChange,
}: {
  question: string
  options: { id: string; text: string }[]
  correctOptionId: string
  onChange: (question: string, options: { id: string; text: string }[], correctOptionId: string) => void
}) {
  const updateOption = (index: number, text: string) => {
    const next = [...options]
    next[index] = { ...next[index], text }
    onChange(question, next, correctOptionId)
  }

  const addOption = () => {
    const id = String.fromCharCode(97 + options.length)
    onChange(question, [...options, { id, text: '' }], correctOptionId)
  }

  const removeOption = (index: number) => {
    const next = options.filter((_, i) => i !== index)
    const newCorrect = next.find((o) => o.id === correctOptionId) ? correctOptionId : next[0]?.id ?? ''
    onChange(question, next, newCorrect)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Enunciado</Label>
        <Textarea
          value={question}
          onChange={(e) => onChange(e.target.value, options, correctOptionId)}
          placeholder="Digite a pergunta..."
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Opções</Label>
        {options.map((option, i) => (
          <div key={option.id} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-center text-sm font-medium text-muted-foreground uppercase">
              {option.id}
            </span>
            <Input
              value={option.text}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Opção ${option.id.toUpperCase()}`}
            />
            <Button
              variant="ghost"
              size="icon"
              className={cn('shrink-0', options.length <= 2 && 'invisible')}
              onClick={() => removeOption(i)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addOption} disabled={options.length >= 6}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar opção
        </Button>
      </div>
      <div className="space-y-1">
        <Label>Resposta correta</Label>
        <Select
          value={correctOptionId}
          onValueChange={(v) => onChange(question, options, v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.id.toUpperCase()} — {option.text || '(sem texto)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
