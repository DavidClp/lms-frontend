'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { Home, Map, User, LogOut } from 'lucide-react'
import { useGamification } from '@/hooks/use-api'
import { KidsLogo } from '@/components/kids/kids-brand'
import { AvatarDisplay } from '@/components/kids/avatar-display'
import type { AvatarConfig } from '@/types'

const navItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/modules', label: 'Mapa', icon: Map },
  { href: '/profile', label: 'Perfil', icon: User },
]

export function KidsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { data: gamification } = useGamification()

  const firstName = user?.name?.split(' ')[0] ?? 'Explorador'
  const level = gamification?.level ?? 1
  const totalXp = gamification?.totalXp ?? 0
  const xpProgress = gamification?.xpProgressPercent ?? 0
  const streak = gamification?.currentStreak ?? 0
  const avatar = (gamification?.avatarConfig as AvatarConfig | null) ?? null

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  const sidebarProfile = (
    <div className="rounded-2xl border-2 border-[#BFDBFE] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <AvatarDisplay config={avatar} size="sm" className="h-14 w-14 border-2 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-black text-[#1E293B]">{firstName}</p>
          <p className="text-sm font-bold text-[#3B82F6]">Nível {level}</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-2.5 overflow-hidden rounded-full bg-[#E2E8F0]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] transition-all duration-500"
            style={{ width: `${Math.max(xpProgress, 4)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
          <span className="flex items-center gap-1">
            <span>🔥</span> {streak} {streak === 1 ? 'dia' : 'dias'}
          </span>
          <span>
            {totalXp % 100}/{100} XP
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#EAF6FF] kids-ui">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-[#BFDBFE]/60 bg-[#F8FCFF] p-5 lg:flex">
        <KidsLogo />
        <div className="mt-6">{sidebarProfile}</div>

        <nav className="mt-6 flex flex-1 flex-col gap-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-bold transition-all',
                isActive(href)
                  ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/30'
                  : 'text-[#475569] hover:bg-white hover:text-[#2563EB]',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2.5} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="rounded-2xl border-2 border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="flex items-start gap-2 text-sm font-bold leading-snug text-[#166534]">
            <span className="text-lg">⭐</span>
            Você está indo super bem! Continue aprendendo!
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-3 flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-[#64748B] hover:text-[#EF4444]"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b border-[#BFDBFE] bg-[#F8FCFF]/95 backdrop-blur px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <KidsLogo compact />
          <button type="button" onClick={logout} className="rounded-xl p-2 text-[#64748B]">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3">{sidebarProfile}</div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 lg:ml-[260px] lg:px-8 lg:py-8">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-50 border-t-2 border-[#BFDBFE] bg-white/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-3 gap-1 p-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center rounded-2xl py-2.5 text-xs font-bold transition-colors min-h-[58px]',
                isActive(href) ? 'bg-[#3B82F6] text-white' : 'text-[#64748B]',
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" strokeWidth={2.5} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
