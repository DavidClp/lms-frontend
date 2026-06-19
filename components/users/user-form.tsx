'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { User, ProfileMode } from '@/types'

interface UserFormProps {
  defaultValues?: Partial<User>
  onSubmit: (data: Partial<User> & { password?: string; profileMode?: ProfileMode }) => void | Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function UserForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salvar' }: UserFormProps) {
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [email, setEmail] = useState(defaultValues?.email ?? '')
  const [password, setPassword] = useState('')
  const [profileMode, setProfileMode] = useState<ProfileMode>(defaultValues?.profileMode ?? 'ADULT')

  const isEditing = !!defaultValues?.id

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data: Partial<User> & { password?: string; profileMode?: ProfileMode } = {
      name,
      email,
      profileMode,
    }
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
        <Label htmlFor="profileMode">Perfil do aluno</Label>
        <Select value={profileMode} onValueChange={(v) => setProfileMode(v as ProfileMode)}>
          <SelectTrigger id="profileMode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADULT">Adulto (padrão)</SelectItem>
            <SelectItem value="KIDS">Kids (7-10 anos)</SelectItem>
          </SelectContent>
        </Select>
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
