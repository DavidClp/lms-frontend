'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, Zap, Flame, Trophy } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useGamification, useUpdateAvatar, useUserProgress } from '@/hooks/use-api'
import { AvatarDisplay } from '@/components/kids/avatar-display'
import { AvatarEditor } from '@/components/kids/avatar-editor'
import { Spinner } from '@/components/ui/spinner'
import type { AvatarConfig } from '@/types'
import { toast } from 'sonner'

const DEFAULT_AVATAR: AvatarConfig = {
  skin: 'peach',
  hair: 'brown',
  accessory: 'none',
  background: 'sky',
}

function ProfileStat({
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
    <div className="rounded-2xl border-2 border-[#E2E8F0] bg-white p-4 text-center shadow-sm">
      <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
      <p className="text-2xl font-black text-[#1E293B]">{value}</p>
      <p className="text-xs font-bold text-[#64748B]">{label}</p>
    </div>
  )
}

export function KidsProfile() {
  const { user } = useAuth()
  const { data: gamification, isLoading } = useGamification()
  const { data: progress } = useUserProgress(user?.id ?? '')
  const updateAvatar = useUpdateAvatar()
  const [editing, setEditing] = useState(false)
  const [avatar, setAvatar] = useState<AvatarConfig>(
    (gamification?.avatarConfig as AvatarConfig) ?? user?.avatarConfig ?? DEFAULT_AVATAR,
  )

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-10 w-10 text-[#3B82F6]" />
      </div>
    )
  }

  const completedMissions = progress?.filter((p) => p.completed).length ?? 0
  const badgeCount = gamification?.badges?.length ?? 0
  const firstName = user.name.split(' ')[0]
  const level = gamification?.level ?? 1
  const totalXp = gamification?.totalXp ?? 0
  const streak = gamification?.currentStreak ?? 0
  const xpProgress = gamification?.xpProgressPercent ?? 0

  const handleSaveAvatar = async () => {
    try {
      await updateAvatar.mutateAsync(avatar)
      toast.success('Seu herói foi atualizado!')
      setEditing(false)
    } catch {
      toast.error('Erro ao salvar avatar')
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border-2 border-[#BFDBFE] bg-white p-6 text-center shadow-sm">
        <AvatarDisplay config={gamification?.avatarConfig ?? avatar} className="mx-auto" />
        <h1 className="mt-4 text-2xl font-black text-[#1E293B]">{firstName}</h1>
        <p className="mt-1 text-base font-bold text-[#3B82F6]">
          Nível {level} — {gamification?.levelName ?? 'Explorador'}
        </p>
        {streak > 0 && (
          <p className="mt-2 text-sm font-bold text-[#F97316]">🔥 {streak} dias seguidos</p>
        )}
        <div className="mx-auto mt-4 max-w-sm">
          <div className="h-3 overflow-hidden rounded-full bg-[#E2E8F0]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B]"
              style={{ width: `${Math.max(xpProgress, 4)}%` }}
            />
          </div>
          <p className="mt-1 text-xs font-bold text-[#64748B]">{totalXp} XP acumulado</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <ProfileStat
          icon={<Star className="h-4 w-4 text-[#F59E0B]" fill="#F59E0B" />}
          value={level}
          label="Nível"
          iconBg="bg-[#FEF3C7]"
        />
        <ProfileStat
          icon={<Zap className="h-4 w-4 text-[#3B82F6]" fill="#3B82F6" />}
          value={totalXp}
          label="XP"
          iconBg="bg-[#DBEAFE]"
        />
        <ProfileStat
          icon={<Flame className="h-4 w-4 text-[#F97316]" fill="#F97316" />}
          value={streak}
          label="Sequência"
          iconBg="bg-[#FFEDD5]"
        />
        <ProfileStat
          icon={<Trophy className="h-4 w-4 text-[#EAB308]" fill="#EAB308" />}
          value={badgeCount}
          label="Medalhas"
          iconBg="bg-[#FEF9C3]"
        />
      </section>

      <section className="rounded-2xl border-2 border-[#E2E8F0] bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-black text-[#1E293B]">Personalizar Herói</h2>
        {editing ? (
          <AvatarEditor
            value={avatar}
            onChange={setAvatar}
            onSave={handleSaveAvatar}
            isSaving={updateAvatar.isPending}
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-full rounded-2xl bg-[#3B82F6] py-3.5 text-base font-black text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Editar meu avatar
          </button>
        )}
      </section>

      <Link
        href="/achievements"
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#BFDBFE] bg-[#F0F9FF] py-3.5 text-base font-black text-[#2563EB] transition-colors hover:bg-[#DBEAFE]"
      >
        Ver meus tesouros 🏆
      </Link>

      <p className="text-center text-sm font-bold text-[#64748B]">
        {completedMissions} missões completas
      </p>
    </div>
  )
}
