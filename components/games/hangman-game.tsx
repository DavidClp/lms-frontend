'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { HangmanConfig } from '@/types'
import { normalizeWord } from '@/lib/word-search'
import { cn } from '@/lib/utils'

export interface HangmanCompletePayload {
  timeMs: number
  wrongGuesses: number
  won: boolean
}

interface HangmanGameProps {
  config: HangmanConfig
  mode?: 'play' | 'preview'
  title?: string
  savedCompleted?: boolean
  onComplete?: (payload: HangmanCompletePayload) => void
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function HangmanDrawing({ wrongGuesses, maxWrong }: { wrongGuesses: number; maxWrong: number }) {
  const totalParts = 6
  const partsVisible = maxWrong > 0
    ? Math.min(totalParts, Math.ceil((wrongGuesses / maxWrong) * totalParts))
    : 0
  const show = (part: number) => partsVisible >= part

  return (
    <svg viewBox="0 0 200 220" className="mx-auto h-48 w-44" aria-hidden>
      {show(1) && <line x1="20" y1="210" x2="140" y2="210" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />}
      {show(2) && <line x1="50" y1="210" x2="50" y2="20" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />}
      {show(3) && <line x1="50" y1="20" x2="130" y2="20" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />}
      {show(4) && <line x1="130" y1="20" x2="130" y2="50" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />}
      {show(5) && <circle cx="130" cy="68" r="18" stroke="#3B82F6" strokeWidth="3" fill="#DBEAFE" />}
      {show(6) && (
        <>
          <line x1="130" y1="86" x2="130" y2="140" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          <line x1="130" y1="100" x2="105" y2="120" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          <line x1="130" y1="100" x2="155" y2="120" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          <line x1="130" y1="140" x2="110" y2="175" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
          <line x1="130" y1="140" x2="150" y2="175" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {partsVisible === 0 && (
        <text x="100" y="120" textAnchor="middle" fill="#94A3B8" fontSize="14" fontWeight="bold">
          Adivinhe a palavra!
        </text>
      )}
    </svg>
  )
}

export function HangmanGame({
  config,
  mode = 'play',
  title,
  savedCompleted = false,
  onComplete,
}: HangmanGameProps) {
  const secret = config.secretWord ?? normalizeWord(config.displayWord ?? '')
  const maxWrong = config.maxWrongGuesses
  const startTimeRef = useRef(Date.now())

  const [guessed, setGuessed] = useState<Set<string>>(() => (savedCompleted ? new Set(ALPHABET) : new Set()))
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [finished, setFinished] = useState(savedCompleted)
  const [won, setWon] = useState(savedCompleted)

  const revealedWord = useMemo(() => {
    return secret
      .split('')
      .map((ch) => (guessed.has(ch) || finished ? ch : '_'))
      .join(' ')
  }, [secret, guessed, finished])

  const handleGuess = useCallback(
    (letter: string) => {
      if (mode === 'preview' || finished || guessed.has(letter)) return

      const next = new Set(guessed)
      next.add(letter)
      setGuessed(next)

      if (!secret.includes(letter)) {
        const nextWrong = wrongGuesses + 1
        setWrongGuesses(nextWrong)
        if (nextWrong >= maxWrong) {
          setFinished(true)
          setWon(false)
        }
      } else if (secret.split('').every((ch) => next.has(ch))) {
        setFinished(true)
        setWon(true)
        onComplete?.({
          timeMs: Date.now() - startTimeRef.current,
          wrongGuesses,
          won: true,
        })
      }
    },
    [mode, finished, guessed, secret, wrongGuesses, maxWrong, onComplete],
  )

  return (
    <div className="space-y-5 select-none">
      {title && <h3 className="text-lg font-black text-[#1E293B]">{title}</h3>}

      {config.category && (
        <span className="inline-block rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-bold text-[#2563EB]">
          {config.category}
        </span>
      )}

      <div className="rounded-2xl border-2 border-[#E2E8F0] bg-[#F8FCFF] p-4">
        <HangmanDrawing wrongGuesses={wrongGuesses} maxWrong={maxWrong} />
        <p className="mt-2 text-center text-sm font-bold text-[#64748B]">
          Erros: {wrongGuesses}/{maxWrong}
        </p>
      </div>

      <div className="rounded-2xl border-2 border-[#BFDBFE] bg-white px-4 py-5 text-center">
        <p className="font-mono text-2xl font-black tracking-[0.35em] text-[#1E293B] sm:text-3xl">
          {revealedWord}
        </p>
      </div>

      <div className="rounded-xl bg-[#F0F9FF] px-4 py-3">
        <p className="text-sm font-bold text-[#334155]">
          💡 Dica: {config.hint}
        </p>
      </div>

      {mode !== 'preview' && !finished && (
        <div className="flex flex-wrap justify-center gap-2">
          {ALPHABET.map((letter) => {
            const used = guessed.has(letter)
            const correct = used && secret.includes(letter)
            const wrong = used && !secret.includes(letter)
            return (
              <button
                key={letter}
                type="button"
                disabled={used}
                onClick={() => handleGuess(letter)}
                className={cn(
                  'h-10 w-9 rounded-lg text-sm font-black transition-colors sm:h-11 sm:w-10',
                  !used && 'bg-[#3B82F6] text-white hover:bg-[#2563EB]',
                  correct && 'bg-[#22C55E] text-white',
                  wrong && 'bg-[#EF4444] text-white opacity-80',
                )}
              >
                {letter}
              </button>
            )
          })}
        </div>
      )}

      {finished && won && (
        <div className="rounded-2xl border-2 border-[#BBF7D0] bg-[#F0FDF4] p-4 text-center">
          <p className="text-lg font-black text-[#166534]">
            Você venceu! A palavra era {config.displayWord ?? secret} 🎉
          </p>
        </div>
      )}

      {finished && !won && (
        <div className="rounded-2xl border-2 border-[#FECACA] bg-[#FEF2F2] p-4 text-center">
          <p className="text-lg font-black text-[#B91C1C]">
            Que pena! A palavra era {config.displayWord ?? secret}
          </p>
          {mode === 'play' && (
            <button
              type="button"
              className="mt-3 rounded-xl bg-[#3B82F6] px-4 py-2 text-sm font-bold text-white"
              onClick={() => {
                setGuessed(new Set())
                setWrongGuesses(0)
                setFinished(false)
                setWon(false)
                startTimeRef.current = Date.now()
              }}
            >
              Tentar de novo
            </button>
          )}
        </div>
      )}

      {mode === 'preview' && (
        <p className="text-center text-xs font-semibold text-[#64748B]">
          Modo preview — palavra: {config.displayWord ?? secret}
        </p>
      )}
    </div>
  )
}
