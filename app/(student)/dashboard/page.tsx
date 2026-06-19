'use client'

import { useProfileMode } from '@/contexts/profile-mode-context'
import StudentDashboard from './dashboard-adult'
import { KidsDashboard } from '@/components/kids/kids-dashboard'

export default function DashboardPage() {
  const { isKids } = useProfileMode()
  if (isKids) return <KidsDashboard />
  return <StudentDashboard />
}
