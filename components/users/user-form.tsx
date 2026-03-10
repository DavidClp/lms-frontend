'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { User } from '@/types'

interface UserFormProps {
  defaultValues?: Partial<User>
  onSubmit: (data: Partial<User> & { password?: string }) => void | Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function UserForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salvar' }: UserFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [email, setEmail] = useState(defaultValues?.email ?? '')
  const [password, setPassword] = useState('')

  const isEditing = !!defaultValues?.id

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data: Partial<User> & { password?: string } = { name, email }
    if (password) data.password = password
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemplo.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">
          {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isEditing ? 'Nova senha' : 'Mínimo 6 caracteres'}
          required={!isEditing}
          minLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  )
}
