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
import { Plus, Trash2, GripVertical, FileText, Video, CheckSquare, HelpCircle, ImageIcon, X, Loader2, PenLine } from 'lucide-react'
import type { ContentBlock, BlockType, QuizBlock, QuizQuestion, ImageWithCaption } from '@/types'
import { normalizeImagesBlock } from '@/types'
import { imagesApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Textarea } from '../ui/textarea'

interface BlockEditorProps {
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
}

function createBlockByType(type: BlockType): ContentBlock {
  if (type === 'TEXT') return { type: 'TEXT', value: '' }
  if (type === 'VIDEO') return { type: 'VIDEO', url: '', title: '' }
  if (type === 'ACTIVITY_CHECKLIST') return { type: 'ACTIVITY_CHECKLIST', title: '', items: [''] }
  if (type === 'IMAGES') return { type: 'IMAGES', images: [] }
  if (type === 'OPEN_QUESTION') return { type: 'OPEN_QUESTION', question: '' }
  return {
    type: 'QUIZ',
    questions: [{
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `q-${Date.now()}`,
      question: '',
      options: [{ id: 'a', text: '' }, { id: 'b', text: '' }],
      correctOptionId: 'a',
    }],
  } as QuizBlock
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [addingType, setAddingType] = useState<BlockType | ''>('')
  const [insertBelowIndex, setInsertBelowIndex] = useState<number | null>(null)

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
            >
              {block.type === 'TEXT' && (
                <TextBlockEditor
                  value={block.value}
                  onChange={(value) => updateBlock(index, { type: 'TEXT', value })}
                />
              )}
              {block.type === 'VIDEO' && (
                <VideoBlockEditor
                  url={block.url}
                  title={block.title}
                  onChange={(url, title) => updateBlock(index, { type: 'VIDEO', url, title })}
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
                return (
                  <ImageBlockEditor
                    images={normalized.images}
                    onChange={(images) =>
                      updateBlock(index, { type: 'IMAGES', images })
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
  { value: 'ACTIVITY_CHECKLIST', label: 'Checklist', icon: <CheckSquare className="h-4 w-4" /> },
  { value: 'QUIZ', label: 'Quiz', icon: <HelpCircle className="h-4 w-4" /> },
  { value: 'IMAGES', label: 'Imagens', icon: <ImageIcon className="h-4 w-4" /> },
  { value: 'OPEN_QUESTION', label: 'Pergunta (texto)', icon: <PenLine className="h-4 w-4" /> },
]

function SortableBlockItem({
  id,
  index,
  insertBelowIndex,
  children,
  onRemove,
  onAddBelow,
  onConfirmInsertBelow,
}: {
  id: string
  index: number
  insertBelowIndex: number | null
  children: React.ReactNode
  onRemove: () => void
  onAddBelow: () => void
  onConfirmInsertBelow: (type: BlockType) => void
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
              {BLOCK_TYPE_OPTIONS.map((opt) => (
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

function TextBlockEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Card className='gap-0'>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4" /> Texto
        </CardTitle>
      </CardHeader>
      <CardContent>
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
  onChange,
}: {
  url: string
  title?: string
  onChange: (url: string, title?: string) => void
}) {
  return (
    <Card className='gap-0'>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Video className="h-4 w-4" /> Vídeo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Título (opcional)</Label>
          <Input
            value={title ?? ''}
            onChange={(e) => onChange(url, e.target.value)}
            placeholder="Título do vídeo"
          />
        </div>
        <div className="space-y-1">
          <Label>URL do YouTube</Label>
          <Input
            value={url}
            onChange={(e) => onChange(e.target.value, title)}
            placeholder="https://www.youtube.com/watch?v=..."
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

const DEFAULT_WIDTH_PCT = 50
const DEFAULT_HEIGHT_PCT = 40
const MIN_PCT = 10
const MAX_PCT = 100
const RESIZE_DEBOUNCE_MS = 150
/** Só persiste tamanho se a diferença for maior que isso (evita loop de encolher). */
const SIZE_CHANGE_THRESHOLD_PCT = 2

function ImageBlockEditor({
  images,
  onChange,
}: {
  images: ImageWithCaption[]
  onChange: (images: ImageWithCaption[]) => void
}) {
  const [uploading, setUploading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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
    (id: string, width: number, height: number) => {
      const w = Math.min(MAX_PCT, Math.max(MIN_PCT, width))
      const h = Math.min(MAX_PCT, Math.max(MIN_PCT, height))
      onChange(
        images.map((img) => (img.id === id ? { ...img, width: w, height: h } : img))
      )
    },
    [images, onChange]
  )

  return (
    <Card className='gap-0'>
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <ImageIcon className="h-4 w-4" /> Imagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {images.length > 0 && (
          <div ref={containerRef} className="space-y-4">
            {images.map((img) => (
              <ResizableImageItem
                key={img.id}
                img={img}
                containerRef={containerRef}
                onRemove={() => removeImage(img.id)}
                onCaptionChange={(caption) => updateCaption(img.id, caption)}
                onSizeChange={(width, height) => updateImageSize(img.id, width, height)}
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
  containerRef,
  onRemove,
  onCaptionChange,
  onSizeChange,
}: {
  img: ImageWithCaption
  containerRef: React.RefObject<HTMLDivElement | null>
  onRemove: () => void
  onCaptionChange: (caption: string) => void
  onSizeChange: (width: number, height: number) => void
}) {
  const resizableRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialCallRef = useRef(true)

  useEffect(() => {
    const el = resizableRef.current
    const container = containerRef.current
    if (!el || !container) return

    const handleResize = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        if (initialCallRef.current) {
          initialCallRef.current = false
          return
        }
        const cw = container.offsetWidth
        const ch = container.offsetHeight
        if (cw <= 0 || ch <= 0) return
        const wPct = Math.min(MAX_PCT, Math.max(MIN_PCT, (el.offsetWidth / cw) * 100))
        const hPct = Math.min(MAX_PCT, Math.max(MIN_PCT, (el.offsetHeight / ch) * 100))
        const currentW = img.width ?? DEFAULT_WIDTH_PCT
        const currentH = img.height ?? DEFAULT_HEIGHT_PCT
        const diffW = Math.abs(wPct - currentW)
        const diffH = Math.abs(hPct - currentH)
        if (diffW >= SIZE_CHANGE_THRESHOLD_PCT || diffH >= SIZE_CHANGE_THRESHOLD_PCT) {
          onSizeChange(wPct, hPct)
        }
      }, RESIZE_DEBOUNCE_MS)
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [containerRef, onSizeChange])

  const widthPct = img.width ?? DEFAULT_WIDTH_PCT
  const heightPct = img.height ?? DEFAULT_HEIGHT_PCT

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <div
        ref={resizableRef}
        style={{
          width: `${widthPct}%`,
          height: `${heightPct}%`,
          minWidth: 100,
          minHeight: 80,
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
        options: [{ id: 'a', text: '' }, { id: 'b', text: '' }],
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
