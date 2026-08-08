export type UserRole = 'ADMIN' | 'STUDENT'
export type ProfileMode = 'ADULT' | 'KIDS'
export type ModuleAudience = 'ADULT' | 'KIDS' | 'ALL'

export interface AvatarConfig {
  skin: string
  hair: string
  accessory: string
  background: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  profileMode?: ProfileMode
  totalXp?: number
  level?: number
  avatarConfig?: AvatarConfig | null
  currentStreak?: number
  lastActivityDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface KidsMeta {
  worldIcon?: string
  worldColor?: string
  mascotIntro?: string
}

export interface Module {
  id: string
  title: string
  description: string
  order: number
  audience?: ModuleAudience
  kidsMeta?: KidsMeta | null
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
  | 'ACTIVITY_UPLOAD'
  | 'IFRAME'
  | 'TABLE'
  | 'PDF'
  | 'GAME'

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

/** Atividade em que o aluno envia 1 arquivo (entrega) */
export interface ActivityUploadBlock {
  type: 'ACTIVITY_UPLOAD'
  description: string
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

export interface GameBlock {
  type: 'GAME'
  gameId: string
  title?: string
}

export type GameType = 'WORD_SEARCH' | 'HANGMAN'
export type GameDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface WordPlacement {
  word: string
  displayWord: string
  row: number
  col: number
  dr: number
  dc: number
}

export interface WordSearchConfig {
  words: string[]
  difficulty: GameDifficulty
  allowDiagonal?: boolean
  allowBackwards?: boolean
  timeLimitSeconds?: number | null
  gridSize: number
  grid: string[][]
  placements: WordPlacement[]
}

export interface HangmanConfig {
  secretWord?: string
  displayWord: string
  hint: string
  category?: string | null
  difficulty: GameDifficulty
  maxWrongGuesses: number
  wordLength: number
}

export interface Game {
  id: string
  title: string
  description?: string | null
  type: GameType
  difficulty: GameDifficulty
  config: WordSearchConfig | HangmanConfig
  isActive: boolean
  order: number
  createdAt?: string
  updatedAt?: string
  userProgress?: GameUserProgress | null
}

export interface GameUserProgress {
  completed: boolean
  completedAt?: string | null
  stats?: Record<string, unknown> | null
}

export type GameFormData =
  | {
      type: 'WORD_SEARCH'
      title: string
      description?: string | null
      difficulty: GameDifficulty
      isActive?: boolean
      order?: number
      config: {
        words: string[]
        difficulty: GameDifficulty
        allowDiagonal?: boolean
        allowBackwards?: boolean
        timeLimitSeconds?: number | null
        gridSize?: number | null
      }
    }
  | {
      type: 'HANGMAN'
      title: string
      description?: string | null
      difficulty: GameDifficulty
      isActive?: boolean
      order?: number
      config: {
        secretWord: string
        hint: string
        category?: string | null
        difficulty: GameDifficulty
        maxWrongGuesses?: number | null
      }
    }

export interface GameCompleteResponse {
  progress: GameUserProgress & { id: string; userId: string; gameId: string }
  gamification?: GamificationSnapshot | null
  xpEarned: number
}

export type ContentBlock =
  | TextBlock
  | VideoBlock
  | IframeBlock
  | ActivityChecklistBlock
  | QuizBlock
  | ImagesBlock
  | OpenQuestionBlock
  | ActivityUploadBlock
  | TableBlock
  | PdfBlock
  | GameBlock

/** Resultados do quiz por bloco (índice): lista de acerto/erro por pergunta */
export type QuizResultsByBlock = Record<string, { questionId: string; correct: boolean }[]>

/** Respostas de atividade (pergunta em texto) por índice do bloco */
export type OpenQuestionAnswersByBlock = Record<string, string>

/** Entregas de arquivo por índice do bloco */
export interface ActivityUploadMeta {
  key: string
  fileName: string
  contentType: string
  size: number
  uploadedAt: string
}

export type ActivityUploadsByBlock = Record<string, ActivityUploadMeta>

/** Estado de checklist por índice do bloco */
export type ChecklistStateByBlock = Record<string, boolean[]>

export interface GameResultItem {
  completed: boolean
  timeMs?: number
  foundWords: string[]
}

export type GameResultsByBlock = Record<string, GameResultItem>

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
  activityUploads?: ActivityUploadsByBlock
  checklistState?: ChecklistStateByBlock
  gameResults?: GameResultsByBlock
  gamification?: GamificationSnapshot | null
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

export interface Badge {
  id: string
  slug: string
  name: string
  description: string
  iconEmoji: string
  xpReward: number
  earnedAt?: string
  earned?: boolean
}

export interface DailyMission {
  id: string
  userId: string
  date: string
  type: 'LOGIN' | 'COMPLETE_LESSON' | 'QUIZ_CORRECT'
  target: number
  progress: number
  completed: boolean
  xpReward: number
}

export interface GamificationSnapshot {
  totalXp: number
  level: number
  currentStreak: number
}

export interface GamificationMe {
  id: string
  profileMode: ProfileMode
  totalXp: number
  level: number
  levelName: string
  xpToNextLevel: number
  xpProgressPercent: number
  avatarConfig: AvatarConfig | null
  currentStreak: number
  lastActivityDate: string | null
  badges: Badge[]
  allBadges: Badge[]
  dailyMissions: DailyMission[]
}

// Form types
export interface ModuleFormData {
  title: string
  description: string
  order: number
  audience?: ModuleAudience
  kidsMeta?: KidsMeta | null
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
  profileMode?: ProfileMode
}
