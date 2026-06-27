'use client'

import { useGames } from '@/hooks/use-api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import type { GameBlock } from '@/types'

interface GameBlockEditorProps {
  block: GameBlock
  onChange: (block: GameBlock) => void
}

export function GameBlockEditor({ block, onChange }: GameBlockEditorProps) {
  const { data: games, isLoading } = useGames()
  const activeGames = (games ?? []).filter((g) => g.isActive !== false)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Jogo vinculado</Label>
        {isLoading ? (
          <Spinner className="h-5 w-5" />
        ) : (
          <Select
            value={block.gameId || undefined}
            onValueChange={(gameId) => onChange({ ...block, gameId })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um jogo..." />
            </SelectTrigger>
            <SelectContent>
              {activeGames.map((game) => (
                <SelectItem key={game.id} value={game.id}>
                  {game.type === 'HANGMAN' ? '🎯' : '🔍'} {game.title} ({game.difficulty})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="space-y-2">
        <Label>Título na missão (opcional)</Label>
        <Input
          value={block.title ?? ''}
          onChange={(e) => onChange({ ...block, title: e.target.value || undefined })}
          placeholder="Ex.: Caça-palavras do teclado"
        />
      </div>
    </div>
  )
}
