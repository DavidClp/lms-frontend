'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Extensões customizadas para fonte (TipTap v2 não inclui font-size/font-family oficiais).
// Só addGlobalAttributes; aplicamos o mark diretamente na UI para evitar problemas de registro de comandos.
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.fontSize?.replace(/['"]+/g, '') ?? null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ]
  },
})

const FontFamily = Extension.create({
  name: 'fontFamily',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.fontFamily?.replace(/['"]+/g, '') ?? null,
            renderHTML: (attrs) =>
              attrs.fontFamily ? { style: `font-family: ${attrs.fontFamily}` } : {},
          },
        },
      },
    ]
  },
})

// Tamanhos de 8 a 30 (em px)
const FONT_SIZES = [
  { label: 'Padrão', value: '' },
  ...Array.from({ length: 23 }, (_, i) => {
    const px = i + 8
    return { label: `${px}`, value: `${px}px` }
  }),
]

const FONT_FAMILIES = [
  { label: 'Padrão', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times', value: 'Times New Roman, serif' },
  { label: 'Courier', value: 'Courier New, monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
]

const TEXT_COLORS = [
  { name: 'Padrão', value: '' },
  { name: 'Cinza', value: '#6b7280' },
  { name: 'Vermelho', value: '#dc2626' },
  { name: 'Laranja', value: '#ea580c' },
  { name: 'Amarelo', value: '#ca8a04' },
  { name: 'Verde', value: '#16a34a' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Roxo', value: '#9333ea' },
]

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Digite o conteúdo...',
  minHeight = '120px',
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [linkOpen, setLinkOpen] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    content: value || '',
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      TextStyle,
      Color,
      FontSize,
      FontFamily,
      TextAlign.configure({
        types: ['paragraph', 'heading'],
      }),
    ],
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[80px] px-3 py-2 focus:outline-none [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6',
      },
    },
  }, [])

  // Sync initial/value-from-parent into editor (e.g. when switching blocks or loading)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const normalized = value || '<p></p>'
    if (current !== normalized) {
      editor.commands.setContent(normalized, false)
    }
  }, [editor, value])

  const setLink = useCallback(() => {
    if (!editor) return
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setLinkUrl('')
    setLinkOpen(false)
  }, [editor, linkUrl])

  const openLinkPopover = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href
    setLinkUrl(prev || '')
    setLinkOpen(true)
  }, [editor])

  if (!editor) {
    return (
      <div
        className="rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
        style={{ minHeight }}
      >
        {placeholder}
      </div>
    )
  }

  return (
    <div className="rounded-md border border-input bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input p-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Sublinhado"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        {/* Fonte: tamanho (8–30) e família — aplicamos o mark textStyle diretamente */}
        <Select
          value={editor.getAttributes('textStyle').fontSize || '__default__'}
          onValueChange={(v) => {
            const attrs = { ...editor.getAttributes('textStyle') }
            if (v === '__default__') delete attrs.fontSize
            else attrs.fontSize = v
            editor.chain().focus().setMark('textStyle', attrs).run()
            if (!attrs.fontSize && !attrs.fontFamily && !attrs.color) {
              editor.chain().focus().unsetMark('textStyle').run()
            }
          }}
        >
          <SelectTrigger className="h-8 w-[90px] gap-1 border-0 bg-transparent shadow-none hover:bg-muted">
            <Type className="h-4 w-4 shrink-0" />
            <SelectValue placeholder="Tamanho" />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((s) => (
              <SelectItem key={s.value || 'default'} value={s.value || '__default__'}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={editor.getAttributes('textStyle').fontFamily || '__default__'}
          onValueChange={(v) => {
            const attrs = { ...editor.getAttributes('textStyle') }
            if (v === '__default__') delete attrs.fontFamily
            else attrs.fontFamily = v
            editor.chain().focus().setMark('textStyle', attrs).run()
            if (!attrs.fontSize && !attrs.fontFamily && !attrs.color) {
              editor.chain().focus().unsetMark('textStyle').run()
            }
          }}
        >
          <SelectTrigger className="h-8 w-[130px] gap-1 border-0 bg-transparent shadow-none hover:bg-muted">
            <SelectValue placeholder="Fonte" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((f) => (
              <SelectItem key={f.value || 'default'} value={f.value || '__default__'}>
                <span style={f.value ? { fontFamily: f.value } : undefined}>{f.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        {/* Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Cor do texto"
            >
              <span
                className="inline-block h-4 w-4 rounded border border-current"
                style={{
                  backgroundColor: editor.getAttributes('textStyle').color || 'currentColor',
                }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="grid grid-cols-4 gap-1">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.value || 'default'}
                  type="button"
                  title={c.name}
                  className={cn(
                    'h-6 w-6 rounded border-2 transition-colors',
                    !c.value && 'border-transparent bg-muted',
                    c.value && 'border-transparent hover:border-primary'
                  )}
                  style={c.value ? { backgroundColor: c.value } : undefined}
                  onClick={() => {
                    if (c.value) {
                      editor.chain().focus().setColor(c.value).run()
                    } else {
                      editor.chain().focus().unsetColor().run()
                    }
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        {/* Link */}
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', editor.isActive('link') && 'bg-muted')}
              title="Inserir link"
              onClick={openLinkPopover}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <Label htmlFor="link-url">URL</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                onKeyDown={(e) => e.key === 'Enter' && setLink()}
              />
              <Button type="button" size="sm" onClick={setLink}>
                OK
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Alinhar à esquerda"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Centralizar"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Alinhar à direita"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-border" aria-hidden />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista com marcadores"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} style={{ minHeight }} />
    </div>
  )
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8', active && 'bg-muted')}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  )
}
