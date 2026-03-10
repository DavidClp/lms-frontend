'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, GripVertical, FileText, Video, CheckSquare, HelpCircle } from 'lucide-react'
import type { ContentBlock, BlockType } from '@/types'
import { cn } from '@/lib/utils'

interface BlockEditorProps {
  blocks: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [addingType, setAddingType] = useState<BlockType | ''>('')

  const addBlock = () => {
    if (!addingType) return
    let newBlock: ContentBlock
    if (addingType === 'TEXT') {
      newBlock = { type: 'TEXT', value: '' }
    } else if (addingType === 'VIDEO') {
      newBlock = { type: 'VIDEO', url: '', title: '' }
    } else if (addingType === 'ACTIVITY_CHECKLIST') {
      newBlock = { type: 'ACTIVITY_CHECKLIST', title: '', items: [''] }
    } else {
      newBlock = {
        type: 'QUIZ',
        question: '',
        options: [
          { id: 'a', text: '' },
          { id: 'b', text: '' },
        ],
        correctOptionId: 'a',
      }
    }
    onChange([...blocks, newBlock])
    setAddingType('')
  }

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  const updateBlock = (index: number, updated: ContentBlock) => {
    const next = [...blocks]
    next[index] = updated
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {blocks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhum bloco adicionado. Use o botão abaixo para adicionar conteúdo.
        </p>
      )}

      {blocks?.map((block, index) => (
        <div key={index} className="flex gap-2">
          <div className="mt-3 cursor-grab text-muted-foreground">
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex-1">
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
                question={block.question}
                options={block.options}
                correctOptionId={block.correctOptionId}
                onChange={(question, options, correctOptionId) =>
                  updateBlock(index, { type: 'QUIZ', question, options, correctOptionId })
                }
              />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="mt-2 shrink-0 text-destructive hover:text-destructive"
            onClick={() => removeBlock(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

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

function TextBlockEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FileText className="h-4 w-4" /> Texto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite o conteúdo de texto..."
          rows={4}
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
    <Card>
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
    <Card>
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

function QuizBlockEditor({
  question,
  options,
  correctOptionId,
  onChange,
}: {
  question: string
  options: { id: string; text: string }[]
  correctOptionId: string
  onChange: (
    question: string,
    options: { id: string; text: string }[],
    correctOptionId: string
  ) => void
}) {
  const updateOption = (index: number, text: string) => {
    const next = [...options]
    next[index] = { ...next[index], text }
    onChange(question, next, correctOptionId)
  }

  const addOption = () => {
    const id = String.fromCharCode(97 + options.length) // a, b, c, ...
    onChange(question, [...options, { id, text: '' }], correctOptionId)
  }

  const removeOption = (index: number) => {
    const next = options.filter((_, i) => i !== index)
    const newCorrect = next.find((o) => o.id === correctOptionId) ? correctOptionId : next[0]?.id ?? ''
    onChange(question, next, newCorrect)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <HelpCircle className="h-4 w-4" /> Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label>Pergunta</Label>
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
          <Button variant="outline" size="sm" onClick={addOption} disabled={options.length >= 6}>
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
      </CardContent>
    </Card>
  )
}
