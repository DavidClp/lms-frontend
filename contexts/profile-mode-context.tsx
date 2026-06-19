'use client'

import { createContext, useContext } from 'react'
import { useAuth } from '@/contexts/auth-context'
import type { ProfileMode } from '@/types'

interface ProfileModeContextType {
  profileMode: ProfileMode
  isKids: boolean
}

const ProfileModeContext = createContext<ProfileModeContextType>({
  profileMode: 'ADULT',
  isKids: false,
})

export function ProfileModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const profileMode = user?.profileMode ?? 'ADULT'

  return (
    <ProfileModeContext.Provider value={{ profileMode, isKids: profileMode === 'KIDS' }}>
      <div data-profile={profileMode === 'KIDS' ? 'kids' : 'adult'} className="min-h-full">
        {children}
      </div>
    </ProfileModeContext.Provider>
  )
}

export function useProfileMode() {
  return useContext(ProfileModeContext)
}
