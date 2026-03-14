'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { modulesApi, lessonsApi, usersApi, progressApi } from '@/lib/api'
import type { ModuleFormData, LessonFormData, UserFormData } from '@/types'

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

export function useModuleLessons(moduleId: string) {
  return useQuery({
    queryKey: ['modules', moduleId, 'lessons'],
    queryFn: () => modulesApi.getLessons(moduleId),
    enabled: !!moduleId,
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

// Progress hooks
export function useProgress(userId: string) {
  return useQuery({
    queryKey: ['progress', userId],
    queryFn: () => progressApi.getUserProgress(userId),
    enabled: !!userId,
  })
}

export const useUserProgress = useProgress

export const useMarkLessonComplete = useMarkProgress

export function useMarkProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, completed }: { lessonId: string; completed: boolean }) =>
      progressApi.markComplete(lessonId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] })
    },
  })
}
