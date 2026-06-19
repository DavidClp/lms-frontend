'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User, LoginCredentials, StudentRegisterData } from '@/types'
import { authApi } from '@/lib/api'
import { isAccessTokenExpired } from '@/lib/auth-token'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  registerStudent: (data: StudentRegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('lms_user')
    const token = localStorage.getItem('lms_token')

    if (storedUser) {
      if (isAccessTokenExpired(token)) {
        localStorage.removeItem('lms_user')
        localStorage.removeItem('lms_token')
        setUser(null)
        router.replace('/login')
      } else {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          localStorage.removeItem('lms_user')
          localStorage.removeItem('lms_token')
        }
      }
    }
    setIsLoading(false)
  }, [router])

  const finalizeAuth = useCallback((authData: { user: User; token: string }) => {
    const { user, token } = authData
    localStorage.setItem('lms_user', JSON.stringify(user))
    localStorage.setItem('lms_token', token)
    setUser(user)

    if (user.role === 'ADMIN') {
      router.push('/admin')
      return
    }

    router.push('/dashboard')
  }, [router])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const authData = await authApi.login(credentials)
    finalizeAuth(authData)
  }, [finalizeAuth])

  const registerStudent = useCallback(async (data: StudentRegisterData) => {
    const authData = await authApi.registerStudent(data)
    finalizeAuth(authData)
  }, [finalizeAuth])

  const logout = useCallback(() => {
    localStorage.removeItem('lms_user')
    localStorage.removeItem('lms_token')
    setUser(null)
    router.replace('/login')
  }, [router])

  const updateUser = useCallback((updated: User) => {
    localStorage.setItem('lms_user', JSON.stringify(updated))
    setUser(updated)
  }, [])

  useEffect(() => {
    if (!user) return

    const check = () => {
      const t = localStorage.getItem('lms_token')
      if (isAccessTokenExpired(t)) logout()
    }

    const interval = setInterval(check, 60_000)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [user, logout])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        registerStudent,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
