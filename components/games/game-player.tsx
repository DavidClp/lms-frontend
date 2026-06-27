'use client'

import type { Game, HangmanConfig, WordSearchConfig } from '@/types'
import { WordSearchGame } from '@/components/games/word-search-game'
import { HangmanGame } from '@/components/games/hangman-game'

interface GamePlayerProps {
  game: Game
  title?: string
  savedCompleted?: boolean
  onWordSearchComplete?: (payload: { timeMs: number; foundWords: string[] }) => void
  onWordSearchProgress?: (payload: { foundWords: string[]; completed: boolean; timeMs: number }) => void
  onHangmanComplete?: (payload: { timeMs: number; wrongGuesses: number; won: boolean }) => void
}

export function GamePlayer({
  game,
  title,
  savedCompleted,
  onWordSearchComplete,
  onWordSearchProgress,
  onHangmanComplete,
}: GamePlayerProps) {
  if (game.type === 'HANGMAN') {
    return (
      <HangmanGame
        config={game.config as HangmanConfig}
        title={title ?? game.title}
        savedCompleted={savedCompleted}
        onComplete={onHangmanComplete}
      />
    )
  }

  const config = game.config as WordSearchConfig
  return (
    <WordSearchGame
      config={config}
      title={title ?? game.title}
      initialFoundWords={savedCompleted ? config.words : undefined}
      savedCompleted={savedCompleted}
      onComplete={onWordSearchComplete}
      onProgress={onWordSearchProgress}
    />
  )
}
