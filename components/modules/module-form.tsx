'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Module, ModuleAudience } from '@/types'

interface ModuleFormProps {
  defaultValues?: Partial<Module>
  onSubmit: (data: Partial<Module>) => void | Promise<void>
  isLoading?: boolean
  submitLabel?: string
  /** Fixa o público-alvo (ex.: seção Kids ou Adultos) */
  lockAudience?: ModuleAudience
}

export function ModuleForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salvar', lockAudience }: ModuleFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [order, setOrder] = useState(defaultValues?.order ?? 1)
  const [audience, setAudience] = useState<ModuleAudience>(
    lockAudience ?? defaultValues?.audience ?? 'ADULT',
  )
  const [worldIcon, setWorldIcon] = useState(defaultValues?.kidsMeta?.worldIcon ?? '🏝️')
  const [worldColor, setWorldColor] = useState(defaultValues?.kidsMeta?.worldColor ?? '#4F46E5')
  const [mascotIntro, setMascotIntro] = useState(defaultValues?.kidsMeta?.mascotIntro ?? '')

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit({
      title,
      description,
      order,
      audience: lockAudience ?? audience,
      kidsMeta:
        audience === 'KIDS' || audience === 'ALL'
          ? { worldIcon, worldColor, mascotIntro: mascotIntro || undefined }
          : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome do módulo"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição do módulo"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="audience">Público-alvo</Label>
        {lockAudience ? (
          <Input id="audience" value={lockAudience === 'KIDS' ? 'Kids (7-10 anos)' : 'Adultos'} disabled />
        ) : (
          <Select value={audience} onValueChange={(v) => setAudience(v as ModuleAudience)}>
            <SelectTrigger id="audience">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADULT">Adultos</SelectItem>
              <SelectItem value="KIDS">Kids (7-10 anos)</SelectItem>
              <SelectItem value="ALL">Todos</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      {(audience === 'KIDS' || audience === 'ALL') && (
        <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
          <p className="text-sm font-medium">Configurações do Mundo (Kids)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="worldIcon">Ícone do mundo</Label>
              <Input id="worldIcon" value={worldIcon} onChange={(e) => setWorldIcon(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="worldColor">Cor do mundo</Label>
              <Input id="worldColor" type="color" value={worldColor} onChange={(e) => setWorldColor(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mascotIntro">Mensagem do mascote</Label>
            <Input
              id="mascotIntro"
              value={mascotIntro}
              onChange={(e) => setMascotIntro(e.target.value)}
              placeholder="Vamos descobrir juntos!"
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="order">Ordem</Label>
        <Input
          id="order"
          type="number"
          min={1}
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  )
}
