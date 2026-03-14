import type {
  User,
  Module,
  Lesson,
  Progress,
  LoginCredentials,
  AuthResponse,
  ModuleFormData,
  LessonFormData,
  UserFormData,
  LessonQuizResultsResponse,
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
    throw new Error(`API Error: ${response.statusText}`)
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
  getLessons: (id: string) => fetchApi<Lesson[]>(`/modules/${id}/lessons`),
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
}
