'use client'

import Link from 'next/link'
import { Play, Star, Zap, Flame, Trophy } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import {
  useModules,
  useLessons,
  useUserProgress,
  useGamification,
} from '@/hooks/use-api'
import { KidsRobot } from '@/components/kids/kids-brand'
import { AdventureMapStrip } from '@/components/kids/adventure-map-strip'
import { Spinner } from '@/components/ui/spinner'

function StatCard({
  icon,
  value,
  label,
  iconBg,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  iconBg: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#E2E8F0] bg-white px-4 py-5 text-center shadow-sm">
      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
      <p className="text-2xl font-black text-[#1E293B]">{value}</p>
      <p className="mt-0.5 text-xs font-bold text-[#64748B]">{label}</p>
    </div>
  )
}

export function KidsDashboard() {
  const { user } = useAuth()
  const { data: modules, isLoading: loadingModules } = useModules()
  const { data: lessons, isLoading: loadingLessons } = useLessons()
  const { data: progress, isLoading: loadingProgress } = useUserProgress(user?.id || '')
  const { data: gamification, isLoading: loadingGamification } = useGamification()

  const isLoading = loadingModules || loadingLessons || loadingProgress || loadingGamification

  const completedLessons = progress?.filter((p) => p.completed) || []
  const totalLessons = lessons?.filter((l) => l.isActive !== false).length ?? 0
  const completedCount = completedLessons.length
  const courseProgressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const nextLesson = lessons
    ?.filter((l) => l.isActive !== false)
    .sort((a, b) => a.order - b.order)
    .find((l) => !completedLessons.some((p) => p.lessonId === l.id))

  const nextModule = nextLesson ? modules?.find((m) => m.id === nextLesson.moduleId) : null
  const missionLabel = nextLesson
    ? `${nextLesson.title}${nextModule ? ` no mundo ${nextModule.title.replace(/^Mundo (do|da|de) /i, '')}` : ''}`
    : 'Todas as missões concluídas!'

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-10 w-10 text-[#3B82F6]" />
      </div>
    )
  }

  const firstName = user?.name?.split(' ')[0] || 'Explorador'
  const level = gamification?.level ?? 1
  const totalXp = gamification?.totalXp ?? 0
  const streak = gamification?.currentStreak ?? 0
  const badgeCount = gamification?.badges?.length ?? 0
  const xpToNext = gamification?.xpToNextLevel ?? 0

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] p-6 shadow-lg shadow-[#3B82F6]/25 md:p-8">
        <div className="relative z-10 max-w-[62%] pr-2">
          <p className="text-lg font-bold text-white/90 md:text-xl">
            Olá, {firstName}! 👋
          </p>
          <h1 className="mt-1 text-2xl font-black leading-tight text-white md:text-3xl">
            Pronto para sua próxima aventura?
          </h1>
          <p className="mt-3 text-sm font-semibold leading-snug text-white/85 md:text-base">
            Sua missão:{' '}
            <span className="text-white">{missionLabel}</span>
          </p>
          {nextLesson ? (
            <Link
              href={`/lessons/${nextLesson.id}`}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#FBBF24] px-6 py-3.5 text-base font-black text-[#1E293B] shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/30">
                <Play className="h-4 w-4 fill-[#1E293B]" />
              </span>
              Continuar Missão
            </Link>
          ) : (
            <Link
              href="/modules"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#FBBF24] px-6 py-3.5 text-base font-black text-[#1E293B] shadow-md"
            >
              Ver Mapa
            </Link>
          )}
        </div>
        <KidsRobot waving className="absolute bottom-2 right-2 h-36 w-32 md:h-44 md:w-36" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-20 w-20 rounded-full bg-white/5" />
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          icon={<Star className="h-5 w-5 text-[#F59E0B]" fill="#F59E0B" />}
          value={level}
          label="Nível atual"
          iconBg="bg-[#FEF3C7]"
        />
        <StatCard
          icon={<Zap className="h-5 w-5 text-[#3B82F6]" fill="#3B82F6" />}
          value={totalXp}
          label="XP acumulado"
          iconBg="bg-[#DBEAFE]"
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-[#F97316]" fill="#F97316" />}
          value={streak}
          label="Dias seguidos"
          iconBg="bg-[#FFEDD5]"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-[#EAB308]" fill="#EAB308" />}
          value={badgeCount}
          label="Medalhas"
          iconBg="bg-[#FEF9C3]"
        />
      </section>

      {/* Course progress */}
      <section className="rounded-2xl border-2 border-[#E2E8F0] bg-white p-5 shadow-sm md:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black text-[#1E293B]">Progresso do Curso</h2>
          <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-sm font-bold text-[#166534]">
            {completedCount} de {totalLessons} missões
          </span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-[#E2E8F0]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4ADE80] to-[#22C55E] transition-all duration-700"
            style={{ width: `${Math.max(courseProgressPct, 2)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm font-bold">
          <span className="text-[#64748B]">
            {xpToNext > 0
              ? `Faltam ${xpToNext} XP para o nível ${level + 1}!`
              : `Nível ${level} — continue explorando!`}
          </span>
          <span className="text-[#22C55E]">{courseProgressPct}%</span>
        </div>
      </section>

      {/* Mascot tip */}
      <section className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-[#93C5FD] bg-[#F0F9FF] p-4 md:p-5">
        <KidsRobot className="h-20 w-16 shrink-0" />
        <div className="relative rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 bg-white" />
          <p className="text-sm font-bold leading-snug text-[#334155] md:text-base">
            Estude um pouquinho todo dia para manter sua sequência de fogo acesa! 🔥
          </p>
        </div>
      </section>

      {/* Adventure map */}
      <section className="rounded-2xl border-2 border-[#E2E8F0] bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#1E293B]">Mapa da Aventura</h2>
          <Link href="/modules" className="text-sm font-bold text-[#3B82F6] hover:underline">
            Ver tudo →
          </Link>
        </div>
        <AdventureMapStrip
          modules={modules ?? []}
          lessons={lessons ?? []}
          progress={progress ?? []}
          compact
        />
      </section>
    </div>
  )
}
