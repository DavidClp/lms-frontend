import type { ContentBlock, QuizBlock, QuizQuestion } from '@/types'

/** Converte blocos de quiz no formato antigo (uma pergunta) para o novo (array questions). */
export function normalizeLessonContent(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block) => {
    if (block.type !== 'QUIZ') return block
    const quiz = block as QuizBlock & { question?: string; options?: QuizQuestion['options']; correctOptionId?: string }
    if (Array.isArray(quiz.questions) && quiz.questions.length > 0) return block
    // Formato antigo: uma única pergunta no bloco
    const question: QuizQuestion = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `q-${Date.now()}`,
      question: quiz.question ?? '',
      options: quiz.options ?? [],
      correctOptionId: quiz.correctOptionId ?? '',
    }
    return { type: 'QUIZ', questions: [question] } as QuizBlock
  })
}
