'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { KidsLayout } from '@/components/kids/kids-layout'
import { useProfileMode } from '@/contexts/profile-mode-context'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { isKids } = useProfileMode()

  if (isKids) {
    return <KidsLayout>{children}</KidsLayout>
  }

  return <DashboardLayout role="STUDENT">{children}</DashboardLayout>
}
