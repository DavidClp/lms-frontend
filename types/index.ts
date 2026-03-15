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

export type BlockType = 'TEXT' | 'VIDEO' | 'ACTIVITY_CHECKLIST' | 'QUIZ' | 'IMAGES' | 'OPEN_QUESTION' | 'IFRAME'

export interface TextBlock {
  type: 'TEXT'
  value: string
}

export interface VideoBlock {
  type: 'VIDEO'
  url: string
  title?: string
}

export interface IframeBlock {
  type: 'IFRAME'
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

export interface ImageWithCaption {
  id: string
  caption?: string
  /** Largura de exibição em pixels na visualização do aluno. */
  width?: number
  /** Altura de exibição em pixels na visualização do aluno. */
  height?: number
}

export type ImageLayout = 'column' | 'row'

export interface ImagesBlock {
  type: 'IMAGES'
  images: ImageWithCaption[]
  /** Se true ou indefinido, o card tem borda e sombra; se false, sem borda nem sombra. */
  cardWithBorder?: boolean
  /** Direção do flex: coluna (vertical) ou linha (horizontal). Padrão: column. */
  imageLayout?: ImageLayout
}

/** Normaliza bloco de imagens vindo da API (pode ser formato antigo imageIds + caption). */
export function normalizeImagesBlock(block: ContentBlock): ImagesBlock | null {
  if (block.type !== 'IMAGES') return null
  const b = block as ImagesBlock & { imageIds?: string[]; caption?: string }
  if (Array.isArray(b.images)) return { type: 'IMAGES', images: b.images, cardWithBorder: b.cardWithBorder, imageLayout: b.imageLayout ?? 'column' }
  if (Array.isArray(b.imageIds))
    return {
      type: 'IMAGES',
      images: b.imageIds.map((id, i) => ({ id, caption: i === 0 ? b.caption : undefined })),
      cardWithBorder: true,
      imageLayout: 'column',
    }
  return { type: 'IMAGES', images: [], cardWithBorder: true, imageLayout: 'column' }
}

/** Atividade com pergunta e campo de texto para o aluno responder digitando */
export interface OpenQuestionBlock {
  type: 'OPEN_QUESTION'
  question: string
}

export type ContentBlock = TextBlock | VideoBlock | IframeBlock | ActivityChecklistBlock | QuizBlock | ImagesBlock | OpenQuestionBlock

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
