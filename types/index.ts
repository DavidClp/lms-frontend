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

export type BlockType = 'TEXT' | 'VIDEO' | 'ACTIVITY_CHECKLIST' | 'QUIZ' | 'IMAGES' | 'OPEN_QUESTION'

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

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  correctOptionId: string
}

export interface QuizBlock {
  type: 'QUIZ'
  questions: QuizQuestion[]
}

export interface ImagesBlock {
  type: 'IMAGES'
  imageIds: string[]
  caption?: string
}

/** Atividade com pergunta e campo de texto para o aluno responder digitando */
export interface OpenQuestionBlock {
  type: 'OPEN_QUESTION'
  question: string
}

export type ContentBlock = TextBlock | VideoBlock | ActivityChecklistBlock | QuizBlock | ImagesBlock | OpenQuestionBlock

/** Resultados do quiz por bloco (índice): lista de acerto/erro por pergunta */
export type QuizResultsByBlock = Record<string, { questionId: string; correct: boolean }[]>

/** Respostas de atividade (pergunta em texto) por índice do bloco */
export type OpenQuestionAnswersByBlock = Record<string, string>

export interface Progress {
  id: string
  lessonId: string
  lessonTitle?: string
  moduleId?: string
  moduleTitle?: string
  userId: string
  completed: boolean
  completedAt?: string
  quizResults?: QuizResultsByBlock
  openQuestionAnswers?: OpenQuestionAnswersByBlock
}

export interface LessonQuizResultsStudent {
  userId: string
  userName: string
  quizResults: QuizResultsByBlock
}

export interface LessonQuizResultsResponse {
  lessonId: string
  lessonTitle: string
  quizBlockIndexes: number[]
  students: LessonQuizResultsStudent[]
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
