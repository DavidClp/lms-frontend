'use client'

import { useGame } from '@/hooks/use-api'
import { GamePlayer } from '@/components/games/game-player'
import { Spinner } from '@/components/ui/spinner'
import type { GameBlock } from '@/types'

interface GameBlockRendererProps {
  block: GameBlock
  blockIndex: number
  variant?: 'default' | 'kids'
  savedResult?: { completed: boolean; timeMs?: number; foundWords: string[] }
  onGameComplete?: (
    blockIndex: number,
    result: { completed: boolean; timeMs?: number; foundWords: string[] },
  ) => void
}

export function GameBlockRenderer({
  block,
  blockIndex,
  variant = 'default',
  savedResult,
  onGameComplete,
}: GameBlockRendererProps) {
  const { data: game, isLoading, error } = useGame(block.gameId, { enabled: !!block.gameId })

  if (!block.gameId) {
    return <p className="text-sm text-muted-foreground">Nenhum jogo selecionado.</p>
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-8 w-8 text-[#3B82F6]" />
      </div>
    )
  }

  if (error || !game) {
    return <p className="text-sm text-destructive">Jogo não encontrado ou indisponível.</p>
  }

  return (
    <div className={variant === 'kids' ? 'rounded-2xl border-2 border-[#BFDBFE] bg-[#F8FCFF] p-4' : ''}>
      <GamePlayer
        game={game}
        title={block.title || game.title}
        savedCompleted={savedResult?.completed}
        onWordSearchComplete={(payload) =>
          onGameComplete?.(blockIndex, {
            completed: true,
            timeMs: payload.timeMs,
            foundWords: payload.foundWords,
          })
        }
        onWordSearchProgress={(payload) =>
          onGameComplete?.(blockIndex, {
            completed: payload.completed,
            timeMs: payload.timeMs,
            foundWords: payload.foundWords,
          })
        }
        onHangmanComplete={(payload) => {
          if (payload.won) {
            onGameComplete?.(blockIndex, {
              completed: true,
              timeMs: payload.timeMs,
              foundWords: [],
            })
          }
        }}
      />
    </div>
  )
}
