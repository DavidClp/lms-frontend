import type {
  User,
  Module,
  Lesson,
  Progress,
  LoginCredentials,
  StudentRegisterData,
  AuthResponse,
  ModuleFormData,
  LessonFormData,
  UserFormData,
  LessonQuizResultsResponse,
  PlatformConfig,
  GamificationMe,
  AvatarConfig,
  Game,
  GameFormData,
  GameCompleteResponse,
} from '@/types'
import {
  mockUsers,
  mockModules,
  mockLessons,
  mockProgress,
  getModuleWithLessons,
  getLessonWithModule,
  getUserProgress,
} from './mock-data'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const USE_MOCK = !API_URL

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
/*   if (USE_MOCK) {
    return handleMockRequest<T>(endpoint, options)
  } */

  const token = localStorage.getItem('lms_token');

      console.log("token", token)
      console.log("options", options)
      console.log("endpoint", endpoint)
      console.log("endpoin2t", options?.headers)
      console.log("API_URL", API_URL)
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let errorMessage = `API Error: ${response.statusText}`

    try {
      const errorData = await response.json()
      if (typeof errorData?.error === 'string' && errorData.error.trim().length > 0) {
        errorMessage = errorData.error
      }
    } catch {
      // Keep fallback error message when API does not return JSON.
    }

    if (response.status === 401 && errorMessage === 'Token inválido ou expirado') {
      localStorage.removeItem('lms_user')
      localStorage.removeItem('lms_token')
      window.location.href = '/login'
    }

    throw new Error(errorMessage)
  }

  return response.json()
}

// Mock request handler
async function handleMockRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate network delay

  const method = options?.method || 'GET'
  const body = options?.body ? JSON.parse(options.body as string) : null

  // Auth
  if (endpoint === '/auth/login' && method === 'POST') {
    const { email, password } = body as LoginCredentials
    const user = mockUsers.find((u) => u.email === email)
    if (user && (password === 'admin123' || password === 'aluno123')) {
      return { user, token: 'mock-token-' + user.id } as T
    }
    throw new Error('Credenciais inválidas')
  }

  // Modules
  if (endpoint === '/modules' && method === 'GET') {
    return mockModules as T
  }
  if (endpoint.match(/^\/modules\/[\w-]+$/) && method === 'GET') {
    const id = endpoint.split('/')[2]
    const module = mockModules.find((m) => m.id === id)
    return module as T
  }
  if (endpoint.match(/^\/modules\/[\w-]+\/lessons$/) && method === 'GET') {
    const id = endpoint.split('/')[2]
    const { lessons } = getModuleWithLessons(id)
    return lessons as T
  }

  // Lessons
  if (endpoint === '/lessons' && method === 'GET') {
    return mockLessons.map((l) => ({
      ...l,
      module: mockModules.find((m) => m.id === l.moduleId),
    })) as T
  }
  if (endpoint.match(/^\/lessons\/[\w-]+$/) && method === 'GET') {
    const id = endpoint.split('/')[2]
    const lesson = getLessonWithModule(id)
    return lesson as T
  }

  // Users
  if (endpoint === '/users' && method === 'GET') {
    return mockUsers as T
  }
  if (endpoint.match(/^\/users\/[\w-]+$/) && method === 'GET') {
    const id = endpoint.split('/')[2]
    const user = mockUsers.find((u) => u.id === id)
    return user as T
  }

  // Progress
  if (endpoint.match(/^\/progress\/user\/[\w-]+$/) && method === 'GET') {
    const userId = endpoint.split('/')[3]
    const progress = getUserProgress(userId)
    return progress as T
  }

  return null as T
}

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials) =>
    fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  registerStudent: (data: StudentRegisterData) =>
    fetchApi<AuthResponse>('/auth/register-student', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

export const platformConfigApi = {
  get: () => fetchApi<PlatformConfig>('/platform-config'),
  update: (data: PlatformConfig) =>
    fetchApi<PlatformConfig>('/platform-config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Modules API
export const modulesApi = {
  getAll: () => fetchApi<Module[]>('/modules'),
  getById: (id: string) => fetchApi<Module>(`/modules/${id}`),
  create: (data: ModuleFormData) =>
    fetchApi<Module>('/modules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: ModuleFormData) =>
    fetchApi<Module>(`/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/modules/${id}`, {
      method: 'DELETE',
    }),
  getLessons: (id: string, options?: { kind?: 'LESSON' | 'EXAM' }) => {
    const kind = options?.kind
    const qs = kind ? `?kind=${encodeURIComponent(kind)}` : ''
    return fetchApi<Lesson[]>(`/modules/${id}/lessons${qs}`)
  },
}

// Lessons API
export const lessonsApi = {
  getAll: () => fetchApi<Lesson[]>('/lessons'),
  getById: (id: string) => fetchApi<Lesson>(`/lessons/${id}`),
  getQuizResults: (id: string) =>
    fetchApi<LessonQuizResultsResponse>(`/lessons/${id}/quiz-results`),
  create: (data: LessonFormData) =>
    fetchApi<Lesson>('/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: LessonFormData) =>
    fetchApi<Lesson>(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/lessons/${id}`, {
      method: 'DELETE',
    }),
  importDocx: async (
    file: File,
    options: { moduleId?: string; order?: number; title?: string; preview?: boolean }
  ): Promise<{ title: string; content: import('@/types').ContentBlock[] } & Partial<import('@/types').Lesson>> => {
    const token = localStorage.getItem('lms_token')
    const formData = new FormData()
    formData.append('file', file)
    if (options.moduleId) formData.append('moduleId', options.moduleId)
    if (options.order != null) formData.append('order', String(options.order))
    if (options.title) formData.append('title', options.title)
    if (options.preview) formData.append('preview', 'true')

    const response = await fetch(`${API_URL}/lessons/import-docx`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`
      try {
        const errorData = await response.json()
        if (typeof errorData?.message === 'string') errorMessage = errorData.message
        if (typeof errorData?.error === 'string') errorMessage = errorData.error
      } catch {
        /* ignore */
      }
      throw new Error(errorMessage)
    }
    return response.json()
  },
}

// Users API
export interface StudentModuleAccessResponse {
  moduleIds: string[]
}

export const usersApi = {
  getAll: () => fetchApi<User[]>('/users'),
  getById: (id: string) => fetchApi<User>(`/users/${id}`),
  getStudentModuleAccess: (userId: string) =>
    fetchApi<StudentModuleAccessResponse>(`/users/${userId}/module-access`),
  updateStudentModuleAccess: (userId: string, moduleIds: string[]) =>
    fetchApi<StudentModuleAccessResponse>(`/users/${userId}/module-access`, {
      method: 'PUT',
      body: JSON.stringify({ moduleIds }),
    }),
  create: (data: UserFormData) =>
    fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<UserFormData>) =>
    fetchApi<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/users/${id}`, {
      method: 'DELETE',
    }),
}

// Images API
export interface UploadedImage {
  id: string
  fileName: string
  size: number
  mimeType: string
}

export const imagesApi = {
  upload: async (files: File[]): Promise<UploadedImage[]> => {
    const token = localStorage.getItem('lms_token')
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))
    const response = await fetch(`${API_URL}/images`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`)
    return response.json()
  },
  getUrl: (id: string) => `${API_URL}/images/${id}`,
}

// Progress API
export const progressApi = {
  getUserProgress: (_userId: string) => fetchApi<Progress[]>(`/progress/user`),
  /** Somente ADMIN: progresso de outro usuário */
  getProgressForUser: (userId: string) => fetchApi<Progress[]>(`/progress/user/${userId}`),
  markComplete: (lessonId: string, completed: boolean) =>
    fetchApi<Progress>('/progress', {
      method: 'POST',
      body: JSON.stringify({ lessonId, completed }),
    }),
  saveQuizResults: (
    lessonId: string,
    blockIndex: number,
    results: { questionId: string; correct: boolean }[]
  ) =>
    fetchApi<Progress>('/progress/quiz', {
      method: 'POST',
      body: JSON.stringify({ lessonId, blockIndex, results }),
    }),
  saveOpenQuestionAnswer: (lessonId: string, blockIndex: number, answer: string) =>
    fetchApi<Progress>('/progress/open-question', {
      method: 'POST',
      body: JSON.stringify({ lessonId, blockIndex, answer }),
    }),
  saveActivityUpload: async (lessonId: string, blockIndex: number, file: File): Promise<Progress> => {
    const token = localStorage.getItem('lms_token')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('lessonId', lessonId)
    formData.append('blockIndex', String(blockIndex))
    const response = await fetch(`${API_URL}/progress/activity-upload`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!response.ok) {
      let message = response.statusText
      try {
        const data = (await response.json()) as { message?: string }
        if (data?.message) message = data.message
      } catch {
        /* ignore */
      }
      throw new Error(message || `API Error: ${response.statusText}`)
    }
    return response.json()
  },
  getActivityUploadUrl: (lessonId: string, blockIndex: number) =>
    fetchApi<{ url: string; fileName: string; contentType: string }>(
      `/progress/activity-upload/${lessonId}/${blockIndex}`,
    ),
  saveChecklistState: (lessonId: string, blockIndex: number, checked: boolean[]) =>
    fetchApi<Progress>('/progress/checklist', {
      method: 'POST',
      body: JSON.stringify({ lessonId, blockIndex, checked }),
    }),
  saveGameResult: (
    lessonId: string,
    blockIndex: number,
    data: { completed: boolean; timeMs?: number; foundWords?: string[] },
  ) =>
    fetchApi<Progress>('/progress/game', {
      method: 'POST',
      body: JSON.stringify({ lessonId, blockIndex, ...data }),
    }),
}

export const gamificationApi = {
  getMe: () => fetchApi<GamificationMe>('/gamification/me'),
  updateAvatar: (avatarConfig: AvatarConfig) =>
    fetchApi<GamificationMe>('/gamification/avatar', {
      method: 'PUT',
      body: JSON.stringify(avatarConfig),
    }),
}

export const gamesApi = {
  getAll: () => fetchApi<Game[]>('/games'),
  getById: (id: string) => fetchApi<Game>(`/games/${id}`),
  create: (data: GameFormData) =>
    fetchApi<Game>('/games', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<GameFormData> & { regenerateGrid?: boolean }) =>
    fetchApi<Game>(`/games/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  regenerate: (id: string) =>
    fetchApi<Game>(`/games/${id}/regenerate`, {
      method: 'POST',
    }),
  delete: (id: string) =>
    fetchApi<void>(`/games/${id}`, {
      method: 'DELETE',
    }),
  complete: (id: string, data?: { timeMs?: number; foundCount?: number; wrongGuesses?: number; won?: boolean }) =>
    fetchApi<GameCompleteResponse>(`/games/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data ?? {}),
    }),
}
