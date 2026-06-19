export const KIDS_MESSAGES = {
  welcome: (name: string) => `Oi, ${name}! Pronta/o para a aventura de hoje?`,
  missionStart: 'Vamos nessa! Cada passo te deixa mais forte!',
  missionStep: 'Muito bem! Próximo passo...',
  quizWrong: 'Ops! Quase lá. Olha de novo e tenta outra vez!',
  quizCorrect: 'Isso aí! Você mandou bem!',
  missionComplete: 'MISSÃO COMPLETA! Você é demais!',
  streak: (days: number) => `${days} dias seguidos! Você é demais!`,
  returnWelcome: 'Senti sua falta! Sua missão te espera.',
  lockedWorld: 'Complete o mundo anterior para desbloquear!',
} as const

export const DAILY_MISSION_LABELS: Record<string, string> = {
  LOGIN: 'Entrar na aventura',
  COMPLETE_LESSON: 'Completar 1 missão',
  QUIZ_CORRECT: 'Acertar 3 perguntas',
}

export const AVATAR_OPTIONS = {
  skin: ['peach', 'tan', 'brown', 'dark'],
  hair: ['brown', 'black', 'blonde', 'red'],
  accessory: ['none', 'star', 'glasses', 'crown'],
  background: ['sky', 'mint', 'lavender', 'sunset'],
} as const

export const AVATAR_COLORS: Record<string, string> = {
  peach: '#FFDAB9',
  tan: '#D2A679',
  brown: '#8B5A2B',
  dark: '#5C4033',
  black: '#1a1a1a',
  blonde: '#F4D03F',
  red: '#E74C3C',
  sky: '#BAE6FD',
  mint: '#BBF7D0',
  lavender: '#E9D5FF',
  sunset: '#FED7AA',
}

export function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return 0
  return text.split(' ').filter(Boolean).length
}

export const KIDS_TEXT_LIMITS = {
  blockWords: 80,
  titleWords: 6,
  quizQuestionWords: 15,
  quizOptionWords: 4,
} as const
