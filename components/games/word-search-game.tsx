'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WordSearchConfig } from '@/types'
import {
  normalizeWord,
  matchWord,
  getCellsForPlacement,
  cellsKey,
  isCellInSet,
  type CellCoord,
} from '@/lib/word-search'
import { cn } from '@/lib/utils'

export interface WordSearchCompletePayload {
  timeMs: number
  foundWords: string[]
}

interface WordSearchGameProps {
  config: WordSearchConfig
  mode?: 'play' | 'preview'
  title?: string
  initialFoundWords?: string[]
  savedCompleted?: boolean
  onComplete?: (payload: WordSearchCompletePayload) => void
  onProgress?: (payload: { foundWords: string[]; completed: boolean; timeMs: number }) => void
}

export function WordSearchGame({
  config,
  mode = 'play',
  title,
  initialFoundWords = [],
  savedCompleted = false,
  onComplete,
  onProgress,
}: WordSearchGameProps) {
  const [foundWords, setFoundWords] = useState<string[]>(() =>
    [...new Set(initialFoundWords.map(normalizeWord))],
  )
  const [foundCells, setFoundCells] = useState<Set<string>>(() => {
    const set = new Set<string>()
    for (const word of initialFoundWords.map(normalizeWord)) {
      const placement = config.placements.find((p) => p.word === word)
      if (placement) {
        getCellsForPlacement(placement).forEach((c) => set.add(cellsKey(c.row, c.col)))
      }
    }
    return set
  })
  const [selectionStart, setSelectionStart] = useState<CellCoord | null>(null)
  const [selectionEnd, setSelectionEnd] = useState<CellCoord | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [completed, setCompleted] = useState(savedCompleted)
  const [showVictory, setShowVictory] = useState(savedCompleted)
  const startTimeRef = useRef(Date.now())
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const grid = config.grid
  const size = grid.length

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const selectionCells = useMemo(() => {
    if (!selectionStart || !selectionEnd) return new Set<string>()
    const set = new Set<string>()
    const dr = selectionEnd.row - selectionStart.row
    const dc = selectionEnd.col - selectionStart.col
    const steps = Math.max(Math.abs(dr), Math.abs(dc))
    if (steps === 0) {
      set.add(cellsKey(selectionStart.row, selectionStart.col))
      return set
    }
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr)
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc)
    if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) return set
    for (let i = 0; i <= steps; i++) {
      set.add(cellsKey(selectionStart.row + stepR * i, selectionStart.col + stepC * i))
    }
    return set
  }, [selectionStart, selectionEnd])

  const tryMatchSelection = useCallback(
    (start: CellCoord, end: CellCoord) => {
      const letters: string[] = []
      const dr = end.row - start.row
      const dc = end.col - start.col
      const steps = Math.max(Math.abs(dr), Math.abs(dc))
      if (steps === 0) {
        const letter = grid[start.row]?.[start.col]
        if (letter) letters.push(letter)
      } else {
        const stepR = dr === 0 ? 0 : dr / Math.abs(dr)
        const stepC = dc === 0 ? 0 : dc / Math.abs(dc)
        if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) return
        for (let i = 0; i <= steps; i++) {
          const letter = grid[start.row + stepR * i]?.[start.col + stepC * i]
          if (letter) letters.push(letter)
        }
      }

      const selection = letters.join('')
      const placement = matchWord(selection, config.placements)
      if (!placement || foundWords.includes(placement.word)) return

      const nextFound = [...foundWords, placement.word]
      const nextCells = new Set(foundCells)
      getCellsForPlacement(placement).forEach((c) => nextCells.add(cellsKey(c.row, c.col)))

      setFoundWords(nextFound)
      setFoundCells(nextCells)

      const timeMs = Date.now() - startTimeRef.current
      const isDone = nextFound.length >= config.words.length

      if (isDone) {
        setCompleted(true)
        setShowVictory(true)
        onComplete?.({ timeMs, foundWords: nextFound })
      }

      onProgress?.({ foundWords: nextFound, completed: isDone, timeMs })
    },
    [config.placements, config.words.length, foundCells, foundWords, grid, onComplete, onProgress],
  )

  const handlePointerDown = (row: number, col: number) => {
    if (completed || mode === 'preview') return
    setIsSelecting(true)
    setSelectionStart({ row, col })
    setSelectionEnd({ row, col })
  }

  const handlePointerEnter = (row: number, col: number) => {
    if (!isSelecting || completed) return
    setSelectionEnd({ row, col })
  }

  const handlePointerUp = () => {
    if (!isSelecting || !selectionStart || !selectionEnd) {
      setIsSelecting(false)
      return
    }
    tryMatchSelection(selectionStart, selectionEnd)
    setIsSelecting(false)
    setSelectionStart(null)
    setSelectionEnd(null)
  }

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp)
    return () => window.removeEventListener('pointerup', handlePointerUp)
  })

  const timeLimit = config.timeLimitSeconds
  const timeRemaining = timeLimit ? Math.max(0, timeLimit - elapsedSeconds) : null

  return (
    <div className="space-y-4 select-none">
      {(title || config.words.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title && <h3 className="text-lg font-black text-[#1E293B]">{title}</h3>}
          <div className="flex items-center gap-3 text-sm font-bold text-[#64748B]">
            <span>
              {foundWords.length}/{config.words.length} palavras
            </span>
            {timeRemaining !== null && (
              <span className={cn(timeRemaining <= 10 && 'text-[#EF4444]')}>
                ⏱ {timeRemaining}s
              </span>
            )}
            {timeLimit === null && <span>⏱ {elapsedSeconds}s</span>}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1 rounded-2xl border-2 border-[#BFDBFE] bg-white p-3"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const key = cellsKey(r, c)
              const isFound = isCellInSet(r, c, foundCells)
              const isActive = isCellInSet(r, c, selectionCells)
              return (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black transition-colors sm:h-10 sm:w-10 sm:text-base',
                    isFound && 'bg-[#22C55E] text-white',
                    !isFound && isActive && 'bg-[#FBBF24] text-[#1E293B]',
                    !isFound && !isActive && 'bg-[#F0F9FF] text-[#1E293B] hover:bg-[#DBEAFE]',
                  )}
                  onPointerDown={() => handlePointerDown(r, c)}
                  onPointerEnter={() => handlePointerEnter(r, c)}
                >
                  {letter}
                </button>
              )
            }),
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {config.words.map((word) => {
          const normalized = normalizeWord(word)
          const found = foundWords.includes(normalized)
          return (
            <span
              key={word}
              className={cn(
                'rounded-full px-3 py-1 text-sm font-bold border-2',
                found
                  ? 'border-[#22C55E] bg-[#DCFCE7] text-[#166534] line-through'
                  : 'border-[#E2E8F0] bg-white text-[#334155]',
              )}
            >
              {word}
            </span>
          )
        })}
      </div>

      {showVictory && (
        <div className="rounded-2xl border-2 border-[#BBF7D0] bg-[#F0FDF4] p-4 text-center">
          <p className="text-lg font-black text-[#166534]">Parabéns! Você encontrou todas! 🎉</p>
          <p className="mt-1 text-sm font-semibold text-[#64748B]">
            Tempo: {Math.floor((Date.now() - startTimeRef.current) / 1000)}s
          </p>
        </div>
      )}
    </div>
  )
}
