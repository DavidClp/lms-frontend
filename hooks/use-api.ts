'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gamificationApi, modulesApi, lessonsApi, usersApi, progressApi, platformConfigApi, gamesApi } from '@/lib/api'
import type { ModuleFormData, LessonFormData, UserFormData, AvatarConfig, GameFormData } from '@/types'

// Modules hooks
export function useModules() {
  return useQuery({
    queryKey: ['modules'],
    queryFn: modulesApi.getAll,
  })
}

export function useModule(id: string) {
  return useQuery({
    queryKey: ['modules', id],
    queryFn: () => modulesApi.getById(id),
    enabled: !!id,
  })
}

export function useModuleLessons(moduleId: string, options?: { enabled?: boolean; kind?: 'LESSON' | 'EXAM' }) {
  const enabled = options?.enabled !== false && !!moduleId
  
  return useQuery({
    queryKey: ['modules', moduleId, 'lessons', options?.kind ?? 'ALL'],
    queryFn: () => modulesApi.getLessons(moduleId, { kind: options?.kind }),
    enabled,
  })
}

export function useCreateModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ModuleFormData) => modulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}

export function useUpdateModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModuleFormData }) =>
      modulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}

export function useDeleteModule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => modulesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}

// Lessons hooks
export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: lessonsApi.getAll,
  })
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ['lessons', id],
    queryFn: () => lessonsApi.getById(id),
    enabled: !!id,
  })
}

export function useLessonQuizResults(lessonId: string) {
  return useQuery({
    queryKey: ['lessons', lessonId, 'quiz-results'],
    queryFn: () => lessonsApi.getQuizResults(lessonId),
    enabled: !!lessonId,
  })
}

export function useCreateLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LessonFormData) => lessonsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}

export function useUpdateLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LessonFormData }) =>
      lessonsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

export function useDeleteLesson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => lessonsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
  })
}

// Users hooks
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UserFormData) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormData> }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Student module access hooks
export function useStudentModuleAccess(userId: string) {
  return useQuery({
    queryKey: ['users', userId, 'module-access'],
    queryFn: () => usersApi.getStudentModuleAccess(userId),
    enabled: !!userId,
  })
}

export function useUpdateStudentModuleAccess() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, moduleIds }: { userId: string; moduleIds: string[] }) =>
      usersApi.updateStudentModuleAccess(userId, moduleIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId, 'module-access'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Progress hooks
export function useProgress(userId: string) {
  return useQuery({
    queryKey: ['progress', userId],
    queryFn: () => progressApi.getUserProgress(userId),
    enabled: !!userId,
  })
}

export const useUserProgress = useProgress

export function useStudentProgressForAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ['progress', 'admin', userId],
    queryFn: () => progressApi.getProgressForUser(userId!),
    enabled: !!userId,
  })
}

export const useMarkLessonComplete = useMarkProgress

export function useMarkProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, completed }: { lessonId: string; completed: boolean }) =>
      progressApi.markComplete(lessonId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}

export function useSaveChecklistState() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      lessonId,
      blockIndex,
      checked,
    }: {
      lessonId: string
      blockIndex: number
      checked: boolean[]
    }) => progressApi.saveChecklistState(lessonId, blockIndex, checked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}

export function useGamification() {
  return useQuery({
    queryKey: ['gamification'],
    queryFn: gamificationApi.getMe,
  })
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (avatarConfig: AvatarConfig) => gamificationApi.updateAvatar(avatarConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}

export function usePlatformConfig() {
  return useQuery({
    queryKey: ['platform-config'],
    queryFn: platformConfigApi.get,
  })
}

export function useUpdatePlatformConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: platformConfigApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-config'] })
    },
  })
}

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: gamesApi.getAll,
  })
}

export function useGame(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['games', id],
    queryFn: () => gamesApi.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  })
}

export function useCreateGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: GameFormData) => gamesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

export function useUpdateGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GameFormData> & { regenerateGrid?: boolean } }) =>
      gamesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['games', id] })
    },
  })
}

export function useDeleteGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gamesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

export function useRegenerateGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gamesApi.regenerate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['games', id] })
    },
  })
}

export function useCompleteGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { timeMs?: number; foundCount?: number; wrongGuesses?: number; won?: boolean } }) =>
      gamesApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
    },
  })
}
