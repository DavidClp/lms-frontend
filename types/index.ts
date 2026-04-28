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
  kind?: 'LESSON' | 'EXAM'
  content: ContentBlock[]
  isActive?: boolean
  module?: Module
  createdAt?: string
  updatedAt?: string
}

export type BlockType =
  | 'TEXT'
  | 'VIDEO'
  | 'ACTIVITY_CHECKLIST'
  | 'QUIZ'
  | 'IMAGES'
  | 'OPEN_QUESTION'
  | 'IFRAME'
  | 'TABLE'
  | 'PDF'

export interface TextBlock {
  type: 'TEXT'
  value: string
}

export interface VideoBlock {
  type: 'VIDEO'
  url: string
  title?: string
  /** Se true, a URL é de incorporação do Google Drive (ex.: .../file/d/ID/preview). */
  isGoogleDrive?: boolean
  /** Início do vídeo em segundos (YouTube). Tem prioridade sobre `t`/`start` na URL. */
  startSeconds?: number
  /** Fim da reprodução em segundos desde o início do vídeo (YouTube). Deve ser maior que o início. */
  endSeconds?: number
}

export interface IframeBlock {
  type: 'IFRAME'
  url: string
  title?: string
  /** Quando preenchido, usa incorporação do Google Docs (estrutura com ID). */
  googleDocId?: string
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

/** Tabela de conteúdo (células em texto simples) */
export interface TableBlock {
  type: 'TABLE'
  /** Título opcional acima da tabela */
  caption?: string
  /** Linha de cabeçalho. Se vazia, a tabela só tem corpo. */
  headers: string[]
  /** Linhas de dados; cada linha deve ter o mesmo número de colunas que `headers` (ou uma largura mínima). */
  rows: string[][]
}

/** PDF servido a partir de `frontend/public` (ex.: `/lesson-pdfs/material.pdf`) */
export interface PdfBlock {
  type: 'PDF'
  /** Caminho público começando em `/`, ex.: `/lesson-pdfs/apostila.pdf` */
  src: string
  title?: string
}

export type ContentBlock =
  | TextBlock
  | VideoBlock
  | IframeBlock
  | ActivityChecklistBlock
  | QuizBlock
  | ImagesBlock
  | OpenQuestionBlock
  | TableBlock
  | PdfBlock

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

export interface StudentRegisterData {
  name: string
  email: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface PlatformConfig {
  disableStudentPassword: boolean
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
  kind?: 'LESSON' | 'EXAM'
  content: ContentBlock[]
  isActive?: boolean
}

export interface UserFormData {
  name: string
  email: string
  password?: string
  role: UserRole
}
