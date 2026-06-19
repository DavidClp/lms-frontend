'use client'

import type { AvatarConfig } from '@/types'
import { AVATAR_OPTIONS } from '@/lib/kids-messages'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AvatarDisplay } from './avatar-display'

interface AvatarEditorProps {
  value: AvatarConfig
  onChange: (config: AvatarConfig) => void
  onSave: () => void
  isSaving?: boolean
}

function OptionPicker({
  label,
  field,
  options,
  value,
  onChange,
}: {
  label: string
  field: keyof AvatarConfig
  options: readonly string[]
  value: AvatarConfig
  onChange: (config: AvatarConfig) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Button
            key={opt}
            type="button"
            size="sm"
            variant={value[field] === opt ? 'default' : 'outline'}
            onClick={() => onChange({ ...value, [field]: opt })}
          >
            {opt}
          </Button>
        ))}
      </div>
    </div>
  )
}

export function AvatarEditor({ value, onChange, onSave, isSaving }: AvatarEditorProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <AvatarDisplay config={value} />
      </div>
      <OptionPicker label="Pele" field="skin" options={AVATAR_OPTIONS.skin} value={value} onChange={onChange} />
      <OptionPicker label="Cabelo" field="hair" options={AVATAR_OPTIONS.hair} value={value} onChange={onChange} />
      <OptionPicker
        label="Acessório"
        field="accessory"
        options={AVATAR_OPTIONS.accessory}
        value={value}
        onChange={onChange}
      />
      <OptionPicker
        label="Fundo"
        field="background"
        options={AVATAR_OPTIONS.background}
        value={value}
        onChange={onChange}
      />
      <Button className="w-full min-h-12" onClick={onSave} disabled={isSaving}>
        {isSaving ? 'Salvando...' : 'Salvar meu herói'}
      </Button>
    </div>
  )
}
