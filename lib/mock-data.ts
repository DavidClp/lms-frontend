import type { User, Module, Lesson, Progress, ContentBlock } from '@/types'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Professor Admin',
    email: 'admin@lms.com',
    role: 'ADMIN',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'aluno@lms.com',
    role: 'STUDENT',
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@lms.com',
    role: 'STUDENT',
    createdAt: '2024-02-01T00:00:00Z',
  },
]

export const mockModules: Module[] = [
  {
    id: '1',
    title: 'Introdução à Informática',
    description: 'Aprenda os conceitos básicos de computadores e como utilizá-los no dia a dia.',
    order: 1,
    lessonsCount: 3,
  },
  {
    id: '2',
    title: 'Navegação na Internet',
    description: 'Domine a arte de navegar na web com segurança e eficiência.',
    order: 2,
    lessonsCount: 2,
  },
  {
    id: '3',
    title: 'Editor de Texto',
    description: 'Aprenda a criar e formatar documentos profissionais.',
    order: 3,
    lessonsCount: 2,
  },
]

const introContent: ContentBlock[] = [
  {
    type: 'TEXT',
    value: 'Bem-vindo ao curso de Introdução à Informática! Nesta aula, você aprenderá o que é um computador e suas principais partes.',
  },
  {
    type: 'VIDEO',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    title: 'O que é um computador?',
  },
  {
    type: 'TEXT',
    value: 'Um computador é uma máquina eletrônica que processa dados e executa instruções. Ele é composto por hardware (partes físicas) e software (programas).',
  },
  {
    type: 'ACTIVITY_CHECKLIST',
    title: 'Atividade Prática',
    items: [
      'Identifique o monitor do seu computador',
      'Localize o teclado e o mouse',
      'Encontre o botão de ligar',
      'Ligue o computador',
    ],
  },
  {
    type: 'QUIZ',
    question: 'O que é hardware?',
    options: [
      { id: 'a', text: 'Programas de computador' },
      { id: 'b', text: 'Partes físicas do computador' },
      { id: 'c', text: 'Tipo de vírus' },
      { id: 'd', text: 'Um jogo de computador' },
    ],
    correctOptionId: 'b',
  },
]

export const mockLessons: Lesson[] = [
  {
    id: '1',
    moduleId: '1',
    title: 'O que é um computador?',
    order: 1,
    content: introContent,
  },
  {
    id: '2',
    moduleId: '1',
    title: 'Ligando e desligando o computador',
    order: 2,
    content: [
      {
        type: 'TEXT',
        value: 'Aprender a ligar e desligar o computador corretamente é fundamental para preservar o equipamento.',
      },
      {
        type: 'ACTIVITY_CHECKLIST',
        title: 'Passos para ligar',
        items: [
          'Verifique se o computador está conectado na tomada',
          'Pressione o botão de ligar',
          'Aguarde o sistema iniciar',
        ],
      },
    ],
  },
  {
    id: '3',
    moduleId: '1',
    title: 'Usando o mouse e teclado',
    order: 3,
    content: [
      {
        type: 'TEXT',
        value: 'O mouse e o teclado são os principais dispositivos de entrada do computador.',
      },
      {
        type: 'VIDEO',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        title: 'Tutorial de mouse e teclado',
      },
    ],
  },
  {
    id: '4',
    moduleId: '2',
    title: 'O que é a Internet?',
    order: 1,
    content: [
      {
        type: 'TEXT',
        value: 'A Internet é uma rede global de computadores conectados que permite a troca de informações.',
      },
    ],
  },
  {
    id: '5',
    moduleId: '2',
    title: 'Navegadores de Internet',
    order: 2,
    content: [
      {
        type: 'TEXT',
        value: 'Navegadores são programas que permitem acessar sites na Internet.',
      },
      {
        type: 'ACTIVITY_CHECKLIST',
        title: 'Atividade',
        items: [
          'Abra o navegador',
          'Digite www.google.com',
          'Pressione Enter',
        ],
      },
    ],
  },
  {
    id: '6',
    moduleId: '3',
    title: 'Criando um documento',
    order: 1,
    content: [
      {
        type: 'TEXT',
        value: 'Vamos aprender a criar um documento de texto.',
      },
    ],
  },
  {
    id: '7',
    moduleId: '3',
    title: 'Formatando texto',
    order: 2,
    content: [
      {
        type: 'TEXT',
        value: 'Aprenda a deixar seu texto em negrito, itálico e muito mais.',
      },
    ],
  },
]

export const mockProgress: Progress[] = [
  {
    id: '1',
    lessonId: '1',
    userId: '2',
    completed: true,
    completedAt: '2024-02-10T10:00:00Z',
  },
  {
    id: '2',
    lessonId: '2',
    userId: '2',
    completed: true,
    completedAt: '2024-02-11T10:00:00Z',
  },
  {
    id: '3',
    lessonId: '4',
    userId: '2',
    completed: true,
    completedAt: '2024-02-12T10:00:00Z',
  },
]

// Helper to get module with lessons
export function getModuleWithLessons(moduleId: string) {
  const module = mockModules.find((m) => m.id === moduleId)
  const lessons = mockLessons.filter((l) => l.moduleId === moduleId)
  return { module, lessons }
}

// Helper to get lesson with module info
export function getLessonWithModule(lessonId: string) {
  const lesson = mockLessons.find((l) => l.id === lessonId)
  if (!lesson) return null
  const module = mockModules.find((m) => m.id === lesson.moduleId)
  return { ...lesson, module }
}

// Helper to get user progress
export function getUserProgress(userId: string) {
  return mockProgress.filter((p) => p.userId === userId)
}
