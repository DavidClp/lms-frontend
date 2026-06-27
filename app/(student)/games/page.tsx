'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useGames } from '@/hooks/use-api'
import { useProfileMode } from '@/contexts/profile-mode-context'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Gamepad2 } from 'lucide-react'

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Fácil',
  MEDIUM: 'Médio',
  HARD: 'Difícil',
}

export default function GamesPage() {
  const router = useRouter()
  const { isKids } = useProfileMode()
  const { data: games, isLoading } = useGames()

  useEffect(() => {
    if (!isKids) router.replace('/dashboard')
  }, [isKids, router])

  if (!isKids) return null

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-10 w-10 text-[#3B82F6]" />
      </div>
    )
  }

  const sorted = [...(games ?? [])].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#1E293B]">Jogos</h1>
        <p className="mt-1 text-sm font-semibold text-[#64748B]">
          Divirta-se aprendendo com caça-palavras e forca!
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#BFDBFE] bg-white p-8 text-center">
          <Gamepad2 className="mx-auto h-12 w-12 text-[#93C5FD]" />
          <p className="mt-3 font-bold text-[#64748B]">Nenhum jogo disponível ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((game) => {
            const completed = game.userProgress?.completed
            return (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="rounded-2xl border-2 border-[#E2E8F0] bg-white p-5 shadow-sm transition-transform hover:scale-[1.01] hover:border-[#BFDBFE]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DBEAFE] text-2xl">
                    {game.type === 'HANGMAN' ? '🎯' : '🔍'}
                  </div>
                  <Badge
                    className={
                      completed
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : 'bg-[#FEF3C7] text-[#92400E]'
                    }
                  >
                    {completed ? 'Concluído' : 'Novo'}
                  </Badge>
                </div>
                <h2 className="mt-3 text-lg font-black text-[#1E293B]">{game.title}</h2>
                <p className="mt-1 text-sm font-semibold text-[#64748B]">
                  {game.type === 'HANGMAN' ? 'Forca' : 'Caça-Palavras'} ·{' '}
                  {DIFFICULTY_LABELS[game.difficulty] ?? game.difficulty}
                  {game.type === 'WORD_SEARCH' &&
                    ` · ${(game.config as { words?: string[] }).words?.length ?? 0} palavras`}
                  {game.type === 'HANGMAN' &&
                    ` · ${(game.config as { wordLength?: number }).wordLength ?? '?'} letras`}
                </p>
                {game.description && (
                  <p className="mt-2 text-sm text-[#64748B] line-clamp-2">{game.description}</p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
