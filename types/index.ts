export type UserRole = 'ADMIN' | 'STUDENT'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt?: string
  updatedAt?: string
}

export interface Module {
  id: string
  title: string
  description: string
  order: number
  lessonsCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  order: number
  content: ContentBlock[]
  module?: Module
  createdAt?: string
  updatedAt?: string
}

export type BlockType = 'TEXT' | 'VIDEO' | 'ACTIVITY_CHECKLIST' | 'QUIZ'

export interface TextBlock {
  type: 'TEXT'
  value: string
}

export interface VideoBlock {
  type: 'VIDEO'
  url: string
  title?: string
}

export interface ActivityChecklistBlock {
  type: 'ACTIVITY_CHECKLIST'
  title?: string
  items: string[]
}

export interface QuizOption {
  id: string
  text: string
}

export interface QuizBlock {
  type: 'QUIZ'
  question: string
  options: QuizOption[]
  correctOptionId: string
}

export type ContentBlock = TextBlock | VideoBlock | ActivityChecklistBlock | QuizBlock

export interface Progress {
  id: string
  lessonId: string
  lessonTitle?: string
  moduleId?: string
  moduleTitle?: string
  userId: string
  completed: boolean
  completedAt?: string
}

export interface ModuleProgress {
  moduleId: string
  moduleTitle: string
  totalLessons: number
  completedLessons: number
  percentage: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Form types
export interface ModuleFormData {
  title: string
  description: string
  order: number
}

export interface LessonFormData {
  moduleId: string
  title: string
  order: number
  content: ContentBlock[]
}

export interface UserFormData {
  name: string
  email: string
  password?: string
  role: UserRole
}
