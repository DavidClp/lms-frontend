'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useGames,
  useCreateGame,
  useDeleteGame,
} from '@/hooks/use-api'
import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/layout/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Plus, Pencil, Trash2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import type { Game, GameFormData, HangmanConfig, WordSearchConfig } from '@/types'

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Fácil',
  MEDIUM: 'Médio',
  HARD: 'Difícil',
}

const TYPE_LABELS: Record<string, string> = {
  WORD_SEARCH: 'Caça-Palavras',
  HANGMAN: 'Forca',
}

function getGameMeta(game: Game): string {
  if (game.type === 'HANGMAN') {
    const cfg = game.config as HangmanConfig
    return `${cfg.wordLength ?? cfg.secretWord?.length ?? '?'} letras · ${cfg.maxWrongGuesses} erros`
  }
  const cfg = game.config as WordSearchConfig
  return `${cfg.words?.length ?? 0} palavras · ${cfg.gridSize ?? '?'}×${cfg.gridSize ?? '?'}`
}

export function AdminGamesList() {
  const router = useRouter()
  const { data: games, isLoading } = useGames()
  const createGame = useCreateGame()
  const deleteGame = useDeleteGame()
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null)

  const sorted = [...(games ?? [])].sort((a, b) => a.order - b.order)

  const handleCreate = async (type: 'WORD_SEARCH' | 'HANGMAN') => {
    const base = {
      title: type === 'HANGMAN' ? 'Novo Jogo da Forca' : 'Novo Caça-Palavras',
      description: '',
      difficulty: 'EASY' as const,
      isActive: true,
      order: (sorted.length || 0) + 1,
    }

    const data: GameFormData =
      type === 'HANGMAN'
        ? {
            ...base,
            type: 'HANGMAN',
            config: {
              secretWord: 'COMPUTADOR',
              hint: 'Máquina que processa informações',
              category: 'Informática',
              difficulty: 'EASY',
            },
          }
        : {
            ...base,
            type: 'WORD_SEARCH',
            config: {
              words: ['MOUSE', 'TECLADO', 'TELA'],
              difficulty: 'EASY',
            },
          }

    try {
      const game = await createGame.mutateAsync(data)
      toast.success('Jogo criado!')
      router.push(`/admin/kids/games/${game.id}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao criar jogo')
    }
  }

  const handleDelete = async () => {
    if (!gameToDelete) return
    try {
      await deleteGame.mutateAsync(gameToDelete.id)
      toast.success('Jogo excluído!')
      setGameToDelete(null)
    } catch {
      toast.error('Erro ao excluir jogo')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jogos Kids"
        description="Caça-palavras, forca e outros jogos educativos"
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={createGame.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Jogo
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCreate('WORD_SEARCH')}>
                🔍 Caça-Palavras
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreate('HANGMAN')}>
                🎯 Jogo da Forca
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="Nenhum jogo cadastrado"
          description="Crie caça-palavras ou jogo da forca"
          action={
            <Button onClick={() => handleCreate('WORD_SEARCH')}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Jogo
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((game) => (
            <Card key={game.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{game.title}</CardTitle>
                    <CardDescription>
                      {TYPE_LABELS[game.type] ?? game.type} ·{' '}
                      {DIFFICULTY_LABELS[game.difficulty]} · {getGameMeta(game)}
                    </CardDescription>
                  </div>
                  <Badge variant={game.isActive ? 'default' : 'secondary'}>
                    {game.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/admin/kids/games/${game.id}`}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setGameToDelete(game)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!gameToDelete} onOpenChange={() => setGameToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir jogo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{gameToDelete?.title}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
