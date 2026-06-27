'use client'

import { use } from 'react'
import { useGame } from '@/hooks/use-api'
import { WordSearchGameForm } from '@/components/admin/word-search-game-form'
import { HangmanGameForm } from '@/components/admin/hangman-game-form'
import { PageHeader } from '@/components/layout/page-header'
import { Spinner } from '@/components/ui/spinner'

export default function AdminKidsGameEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: game, isLoading } = useGame(id)

  if (isLoading || !game) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const isHangman = game.type === 'HANGMAN'

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Editar ${isHangman ? 'Forca' : 'Caça-Palavras'}`}
        description={
          isHangman
            ? 'Configure palavra, dica e erros permitidos'
            : 'Configure palavras, dificuldade e preview da grade'
        }
      />
      {isHangman ? <HangmanGameForm gameId={id} /> : <WordSearchGameForm gameId={id} />}
    </div>
  )
}
