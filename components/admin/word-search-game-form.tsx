'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useGame,
  useUpdateGame,
} from '@/hooks/use-api'
import { WordSearchGame } from '@/components/games/word-search-game'
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
import { Plus, Trash2, RefreshCw, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { Game, GameDifficulty, GameFormData } from '@/types'

const GRID_SIZE_BY_DIFFICULTY: Record<GameDifficulty, number> = {
  EASY: 8,
  MEDIUM: 10,
  HARD: 12,
}

const DIFFICULTY_OPTIONS: { value: GameDifficulty; label: string }[] = [
  { value: 'EASY', label: 'Fácil (padrão 8×8)' },
  { value: 'MEDIUM', label: 'Médio (padrão 10×10)' },
  { value: 'HARD', label: 'Difícil (padrão 12×12)' },
]

interface WordSearchGameFormProps {
  gameId: string
}

export function WordSearchGameForm({ gameId }: WordSearchGameFormProps) {
  const router = useRouter()
  const { data: game, isLoading } = useGame(gameId)
  const updateGame = useUpdateGame()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<GameDifficulty>('EASY')
  const [isActive, setIsActive] = useState(true)
  const [order, setOrder] = useState(0)
  const [words, setWords] = useState<string[]>([''])
  const [allowDiagonal, setAllowDiagonal] = useState<boolean | undefined>(undefined)
  const [allowBackwards, setAllowBackwards] = useState<boolean | undefined>(undefined)
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<string>('')
  const [useCustomGridSize, setUseCustomGridSize] = useState(false)
  const [customGridSize, setCustomGridSize] = useState(10)
  const [previewGame, setPreviewGame] = useState<Game | null>(null)

  useEffect(() => {
    if (!game) return
    setTitle(game.title)
    setDescription(game.description ?? '')
    setDifficulty(game.difficulty)
    setIsActive(game.isActive)
    setOrder(game.order)
    setWords(game.config.words.length ? game.config.words : [''])
    setAllowDiagonal(game.config.allowDiagonal)
    setAllowBackwards(game.config.allowBackwards)
    setTimeLimitSeconds(
      game.config.timeLimitSeconds != null ? String(game.config.timeLimitSeconds) : '',
    )

    const presetSize = GRID_SIZE_BY_DIFFICULTY[game.difficulty]
    const savedSize = game.config.gridSize ?? presetSize
    const isCustom = savedSize !== presetSize
    setUseCustomGridSize(isCustom)
    setCustomGridSize(savedSize)
    setPreviewGame(game)
  }, [game])

  const effectiveGridSize = useCustomGridSize
    ? customGridSize
    : GRID_SIZE_BY_DIFFICULTY[difficulty]

  const buildPayload = (): Partial<GameFormData> & { regenerateGrid?: boolean; type: 'WORD_SEARCH' } => ({
    type: 'WORD_SEARCH',
    title,
    description: description || null,
    difficulty,
    isActive,
    order,
    regenerateGrid: true,
    config: {
      words: words.map((w) => w.trim()).filter(Boolean),
      difficulty,
      allowDiagonal,
      allowBackwards,
      timeLimitSeconds: timeLimitSeconds ? parseInt(timeLimitSeconds, 10) : null,
      gridSize: useCustomGridSize ? customGridSize : null,
    },
  })

  const handleSave = async () => {
    const payload = buildPayload()
    if ((payload.config?.words?.length ?? 0) < 2) {
      toast.error('Informe pelo menos 2 palavras')
      return
    }
    if (useCustomGridSize && (customGridSize < 6 || customGridSize > 16)) {
      toast.error('A grade personalizada deve ter entre 6 e 16')
      return
    }
    try {
      const updated = await updateGame.mutateAsync({ id: gameId, data: payload })
      setPreviewGame(updated)
      toast.success('Jogo salvo e grade regenerada!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  const handleRegenerate = async () => {
    try {
      const updated = await updateGame.mutateAsync({ id: gameId, data: buildPayload() })
      setPreviewGame(updated)
      toast.success('Grade regenerada!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao regenerar')
    }
  }

  const handleDifficultyChange = (value: GameDifficulty) => {
    setDifficulty(value)
    if (!useCustomGridSize) {
      setCustomGridSize(GRID_SIZE_BY_DIFFICULTY[value])
    }
  }

  const addWord = () => setWords((w) => [...w, ''])
  const removeWord = (index: number) => setWords((w) => w.filter((_, i) => i !== index))
  const updateWord = (index: number, value: string) =>
    setWords((w) => w.map((word, i) => (i === index ? value : word)))

  if (isLoading || !game) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
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
                <Select value={difficulty} onValueChange={(v) => handleDifficultyChange(v as GameDifficulty)}>
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
            <CardTitle>Palavras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {words.map((word, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={word}
                  onChange={(e) => updateWord(index, e.target.value)}
                  placeholder={`Palavra ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWord(index)}
                  disabled={words.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addWord}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar palavra
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opções avançadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label>Tamanho personalizado da grade</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Padrão da dificuldade: {GRID_SIZE_BY_DIFFICULTY[difficulty]}×
                    {GRID_SIZE_BY_DIFFICULTY[difficulty]}
                  </p>
                </div>
                <Switch checked={useCustomGridSize} onCheckedChange={setUseCustomGridSize} />
              </div>
              {useCustomGridSize && (
                <div className="space-y-2">
                  <Label>Largura e altura (6–16)</Label>
                  <Input
                    type="number"
                    min={6}
                    max={16}
                    value={customGridSize}
                    onChange={(e) => setCustomGridSize(parseInt(e.target.value, 10) || 8)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Grade atual: {customGridSize}×{customGridSize}
                  </p>
                </div>
              )}
              {!useCustomGridSize && (
                <p className="text-sm font-semibold text-[#3B82F6]">
                  Grade ao salvar: {effectiveGridSize}×{effectiveGridSize}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Permitir diagonal</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Máx. diagonais: até 5 palavras → 1 · até 10 → 2 · 11+ → 3
                </p>
              </div>
              <Switch
                checked={allowDiagonal ?? false}
                onCheckedChange={(v) => setAllowDiagonal(v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Permitir palavras invertidas</Label>
              <Switch
                checked={allowBackwards ?? false}
                onCheckedChange={(v) => setAllowBackwards(v)}
              />
            </div>
            <div className="space-y-2">
              <Label>Limite de tempo (segundos, opcional)</Label>
              <Input
                type="number"
                min={0}
                value={timeLimitSeconds}
                onChange={(e) => setTimeLimitSeconds(e.target.value)}
                placeholder="Sem limite"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} disabled={updateGame.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Salvar e regenerar grade
          </Button>
          <Button variant="outline" onClick={handleRegenerate} disabled={updateGame.isPending}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerar grade
          </Button>
          <Button variant="ghost" onClick={() => router.push('/admin/kids/games')}>
            Voltar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Preview · {previewGame?.config.words.length ?? 0} palavras · grade{' '}
            {previewGame?.config.gridSize ?? effectiveGridSize}×
            {previewGame?.config.gridSize ?? effectiveGridSize}
            {!useCustomGridSize && previewGame?.config.gridSize !== effectiveGridSize && (
              <span className="ml-2 text-sm font-normal text-amber-600">
                (salve para aplicar {effectiveGridSize}×{effectiveGridSize})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewGame?.config?.grid ? (
            <WordSearchGame config={previewGame.config} mode="preview" title={title} />
          ) : (
            <p className="text-sm text-muted-foreground">Salve o jogo para gerar a grade.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
