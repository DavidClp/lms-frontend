'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Module } from '@/types'

interface ModuleFormProps {
  defaultValues?: Partial<Module>
  onSubmit: (data: Partial<Module>) => void | Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function ModuleForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salvar' }: ModuleFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [order, setOrder] = useState(defaultValues?.order ?? 1)

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit({ title, description, order })
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
