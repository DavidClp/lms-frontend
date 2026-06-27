'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGame, useCompleteGame } from '@/hooks/use-api'
import { useProfileMode } from '@/contexts/profile-mode-context'
import { GamePlayer } from '@/components/games/game-player'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function GamePlayPage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const { gameId } = use(params)
  const router = useRouter()
  const { isKids } = useProfileMode()
  const { data: game, isLoading } = useGame(gameId)
  const completeGame = useCompleteGame()
  const [xpEarned, setXpEarned] = useState<number | null>(null)

  useEffect(() => {
    if (!isKids) router.replace('/dashboard')
  }, [isKids, router])

  if (!isKids) return null

  if (isLoading || !game) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-10 w-10 text-[#3B82F6]" />
      </div>
    )
  }

  const alreadyCompleted = game.userProgress?.completed

  const handleWordSearchComplete = async (payload: { timeMs: number; foundWords: string[] }) => {
    try {
      const result = await completeGame.mutateAsync({
        id: gameId,
        data: { timeMs: payload.timeMs, foundCount: payload.foundWords.length },
      })
      if (result.xpEarned > 0) {
        setXpEarned(result.xpEarned)
        toast.success(`+${result.xpEarned} XP! Parabéns!`)
      } else if (alreadyCompleted) {
        toast.success('Você completou de novo! Mandou bem!')
      }
    } catch {
      toast.error('Erro ao salvar progresso')
    }
  }

  const handleHangmanComplete = async (payload: { timeMs: number; wrongGuesses: number; won: boolean }) => {
    if (!payload.won) return
    try {
      const result = await completeGame.mutateAsync({
        id: gameId,
        data: { timeMs: payload.timeMs, wrongGuesses: payload.wrongGuesses, won: true },
      })
      if (result.xpEarned > 0) {
        setXpEarned(result.xpEarned)
        toast.success(`+${result.xpEarned} XP! Parabéns!`)
      } else if (alreadyCompleted) {
        toast.success('Você venceu de novo! Mandou bem!')
      }
    } catch {
      toast.error('Erro ao salvar progresso')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/games">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-black text-[#1E293B]">{game.title}</h1>
          {game.description && (
            <p className="text-sm font-semibold text-[#64748B]">{game.description}</p>
          )}
        </div>
      </div>

      {xpEarned !== null && xpEarned > 0 && (
        <div className="rounded-2xl border-2 border-[#BBF7D0] bg-[#F0FDF4] p-4 text-center">
          <p className="text-lg font-black text-[#166534]">+{xpEarned} XP ganhos! 🎉</p>
        </div>
      )}

      <div className="rounded-2xl border-2 border-[#BFDBFE] bg-white p-4 shadow-sm">
        <GamePlayer
          game={game}
          savedCompleted={alreadyCompleted}
          onWordSearchComplete={handleWordSearchComplete}
          onHangmanComplete={handleHangmanComplete}
        />
      </div>
    </div>
  )
}
