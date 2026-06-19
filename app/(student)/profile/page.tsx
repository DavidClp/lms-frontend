'use client'

import { useProfileMode } from '@/contexts/profile-mode-context'
import { KidsProfile } from '@/components/kids/kids-profile'
import AdultProfilePage from './profile-adult'

export default function StudentProfilePage() {
  const { isKids } = useProfileMode()
  if (isKids) return <KidsProfile />
  return <AdultProfilePage />
}
