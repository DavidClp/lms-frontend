'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/auth-context'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Settings,
  GraduationCap,
  User,
  TrendingUp,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  Sparkles,
  Gamepad2,
} from 'lucide-react'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/modules', label: 'Módulos (Adultos)', icon: BookOpen },
  { href: '/admin/lessons', label: 'Aulas (Adultos)', icon: FileText },
  { href: '/admin/kids/modules', label: 'Mundos Kids', icon: Sparkles },
  { href: '/admin/kids/lessons', label: 'Missões Kids', icon: GraduationCap },
  { href: '/admin/kids/games', label: 'Jogos Kids', icon: Gamepad2 },
  { href: '/admin/students', label: 'Alunos', icon: Users },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
]

const studentNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/modules', label: 'Módulos', icon: BookOpen },
  { href: '/progress', label: 'Meu Progresso', icon: TrendingUp },
  { href: '/profile', label: 'Perfil', icon: User },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'ADMIN' | 'STUDENT'
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = role === 'ADMIN' ? adminNavItems : studentNavItems

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!sidebarCollapsed && (
            <Link href={role === 'ADMIN' ? '/admin' : '/dashboard'} className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-lg font-bold">Curso de Informática</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <GraduationCap className="mx-auto h-8 w-8 text-primary" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  sidebarCollapsed && 'justify-center px-2'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-sidebar-border p-2">
          <div
            className={cn(
              'flex gap-1',
              sidebarCollapsed ? 'flex-col items-center' : 'flex-row items-center'
            )}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'text-sidebar-foreground hover:bg-sidebar-accent',
                    sidebarCollapsed
                      ? 'h-auto w-full justify-center px-2 py-2'
                      : 'min-w-0 flex-1 justify-start gap-3'
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {!sidebarCollapsed && (
                    <div className="min-w-0 flex flex-col items-start text-left">
                      <span className="truncate text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-sidebar-foreground/70">
                        {role === 'ADMIN' ? 'Professor' : 'Aluno'}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href={role === 'ADMIN' ? '/admin' : '/profile'}>
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive',
                    sidebarCollapsed && 'h-9 w-9'
                  )}
                  onClick={logout}
                  aria-label="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={4}>
                Sair
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64')}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground">
            {role === 'ADMIN' ? 'Painel Administrativo' : 'Área do Aluno'}
          </span>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
