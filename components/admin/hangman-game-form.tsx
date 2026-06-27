'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGame, useUpdateGame } from '@/hooks/use-api'
import { HangmanGame } from '@/components/games/hangman-game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import type { Game, GameDifficulty, GameFormData, HangmanConfig } from '@/types'

const MAX_WRONG_BY_DIFFICULTY: Record<GameDifficulty, number> = {
  EASY: 8,
  MEDIUM: 6,
  HARD: 4,
}

const DIFFICULTY_OPTIONS: { value: GameDifficulty; label: string }[] = [
  { value: 'EASY', label: 'Fácil (8 erros)' },
  { value: 'MEDIUM', label: 'Médio (6 erros)' },
  { value: 'HARD', label: 'Difícil (4 erros)' },
]

interface HangmanGameFormProps {
  gameId: string
}

export function HangmanGameForm({ gameId }: HangmanGameFormProps) {
  const router = useRouter()
  const { data: game, isLoading } = useGame(gameId)
  const updateGame = useUpdateGame()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<GameDifficulty>('EASY')
  const [isActive, setIsActive] = useState(true)
  const [order, setOrder] = useState(0)
  const [secretWord, setSecretWord] = useState('')
  const [hint, setHint] = useState('')
  const [category, setCategory] = useState('')
  const [useCustomMaxWrong, setUseCustomMaxWrong] = useState(false)
  const [maxWrongGuesses, setMaxWrongGuesses] = useState(6)
  const [previewGame, setPreviewGame] = useState<Game | null>(null)

  useEffect(() => {
    if (!game || game.type !== 'HANGMAN') return
    const cfg = game.config as HangmanConfig
    setTitle(game.title)
    setDescription(game.description ?? '')
    setDifficulty(game.difficulty)
    setIsActive(game.isActive)
    setOrder(game.order)
    setSecretWord(cfg.displayWord ?? cfg.secretWord ?? '')
    setHint(cfg.hint)
    setCategory(cfg.category ?? '')
    const preset = MAX_WRONG_BY_DIFFICULTY[game.difficulty]
    setUseCustomMaxWrong(cfg.maxWrongGuesses !== preset)
    setMaxWrongGuesses(cfg.maxWrongGuesses)
    setPreviewGame(game)
  }, [game])

  const buildPayload = (): GameFormData => ({
    type: 'HANGMAN',
    title,
    description: description || null,
    difficulty,
    isActive,
    order,
    config: {
      secretWord,
      hint,
      category: category || null,
      difficulty,
      maxWrongGuesses: useCustomMaxWrong ? maxWrongGuesses : null,
    },
  })

  const handleSave = async () => {
    if (!secretWord.trim() || secretWord.trim().length < 3) {
      toast.error('Informe uma palavra com pelo menos 3 letras')
      return
    }
    if (hint.trim().length < 3) {
      toast.error('Informe uma dica com pelo menos 3 caracteres')
      return
    }
    try {
      const updated = await updateGame.mutateAsync({ id: gameId, data: buildPayload() })
      setPreviewGame(updated)
      toast.success('Jogo da forca salvo!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  if (isLoading || !game) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const previewConfig = previewGame?.config as HangmanConfig | undefined

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Jogo da Forca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as GameDifficulty)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  min={0}
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Jogo ativo</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Palavra e dica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Palavra secreta</Label>
              <Input
                value={secretWord}
                onChange={(e) => setSecretWord(e.target.value.toUpperCase())}
                placeholder="Ex.: COMPUTADOR"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">3–20 letras (sem números)</p>
            </div>
            <div className="space-y-2">
              <Label>Dica para o aluno</Label>
              <Textarea
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Ex.: Máquina que processa informações"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria (opcional)</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex.: Informática"
              />
            </div>
            <div className="rounded-xl border bg-muted/30 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Erros máximos personalizados</Label>
                <Switch checked={useCustomMaxWrong} onCheckedChange={setUseCustomMaxWrong} />
              </div>
              {useCustomMaxWrong ? (
                <Input
                  type="number"
                  min={3}
                  max={12}
                  value={maxWrongGuesses}
                  onChange={(e) => setMaxWrongGuesses(parseInt(e.target.value, 10) || 6)}
                />
              ) : (
                <p className="text-sm font-semibold text-[#3B82F6]">
                  Padrão: {MAX_WRONG_BY_DIFFICULTY[difficulty]} erros
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} disabled={updateGame.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button variant="ghost" onClick={() => router.push('/admin/kids/games')}>
            Voltar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {previewConfig?.secretWord || previewConfig?.displayWord ? (
            <HangmanGame config={previewConfig} mode="preview" title={title} />
          ) : (
            <p className="text-sm text-muted-foreground">Salve para ver o preview.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
