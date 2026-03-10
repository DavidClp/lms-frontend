# LMS - Sistema de Aprendizagem

Sistema de gestão de aprendizagem (LMS) para cursos de informática básica, desenvolvido com Next.js 14+, TypeScript, TailwindCSS e shadcn/ui.

## Funcionalidades

### Área do Administrador (Professor)
- Dashboard com estatísticas gerais
- Gestão completa de módulos (CRUD)
- Gestão de aulas com editor de blocos
- Gerenciamento de alunos

### Área do Aluno
- Dashboard com progresso do curso
- Visualização de módulos e aulas
- Marcação de conclusão de aulas
- Página de progresso detalhado
- Perfil do usuário

### Editor de Blocos
O sistema suporta diferentes tipos de conteúdo:
- **TEXT**: Blocos de texto formatado
- **VIDEO**: Incorporação de vídeos do YouTube
- **ACTIVITY_CHECKLIST**: Listas de atividades interativas
- **QUIZ**: Questões de múltipla escolha

## Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- pnpm (recomendado) ou npm

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd lms

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute o servidor de desenvolvimento
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL base da API REST externa |

## Estrutura de Pastas

```
├── app/
│   ├── (student)/           # Rotas do aluno (dashboard, módulos, aulas, perfil)
│   │   ├── dashboard/
│   │   ├── lessons/[lessonId]/
│   │   ├── modules/
│   │   │   └── [moduleId]/
│   │   ├── profile/
│   │   └── progress/
│   ├── admin/               # Rotas do administrador
│   │   ├── lessons/
│   │   │   └── [id]/
│   │   ├── modules/
│   │   │   └── [id]/
│   │   │       └── lessons/
│   │   └── students/
│   ├── login/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/              # Componentes de layout (Sidebar, DashboardLayout, etc.)
│   ├── lessons/             # Componentes de aulas (BlockEditor, BlockRenderer, etc.)
│   ├── modules/             # Componentes de módulos
│   ├── ui/                  # Componentes shadcn/ui
│   └── users/               # Componentes de usuários
├── contexts/
│   └── auth-context.tsx     # Contexto de autenticação
├── hooks/
│   └── use-api.ts           # Hooks React Query para API
├── lib/
│   ├── api.ts               # Serviço de API
│   ├── mock-data.ts         # Dados mock para desenvolvimento
│   └── utils.ts
└── types/
    └── index.ts             # Tipos TypeScript
```

## Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login do usuário |

### Módulos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/modules` | Lista todos os módulos |
| GET | `/modules/:id` | Obtém um módulo específico |
| POST | `/modules` | Cria um novo módulo |
| PUT | `/modules/:id` | Atualiza um módulo |
| DELETE | `/modules/:id` | Remove um módulo |

### Aulas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/lessons` | Lista todas as aulas |
| GET | `/lessons/:id` | Obtém uma aula específica |
| GET | `/modules/:id/lessons` | Lista aulas de um módulo |
| POST | `/lessons` | Cria uma nova aula |
| PUT | `/lessons/:id` | Atualiza uma aula |
| DELETE | `/lessons/:id` | Remove uma aula |

### Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/users` | Lista todos os usuários |
| GET | `/users/:id` | Obtém um usuário específico |
| POST | `/users` | Cria um novo usuário |
| PUT | `/users/:id` | Atualiza um usuário |
| DELETE | `/users/:id` | Remove um usuário |

### Progresso
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/progress/user` | Obtém progresso do usuário logado |
| POST | `/progress` | Marca/desmarca conclusão de aula |

## Estrutura do Banco de Dados

### Tabela: Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'STUDENT', -- 'ADMIN' ou 'STUDENT'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: Modules
```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: Lessons
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 1,
  content JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: Progress
```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);
```

### Tabela: Quizzes (Opcional)
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- ["Opção A", "Opção B", "Opção C", "Opção D"]
  correct_answer INTEGER NOT NULL, -- Índice da resposta correta (0-3)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Estrutura do Conteúdo das Aulas

O campo `content` das aulas é um array JSON com a seguinte estrutura:

```typescript
type ContentBlock = 
  | { type: 'TEXT'; value: string }
  | { type: 'VIDEO'; url: string }
  | { type: 'ACTIVITY_CHECKLIST'; items: string[] }
  | { type: 'QUIZ'; question: string; options: string[]; correctAnswer: number };

// Exemplo:
const content: ContentBlock[] = [
  {
    type: 'TEXT',
    value: 'Nesta aula vamos aprender sobre computadores...'
  },
  {
    type: 'VIDEO',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    type: 'ACTIVITY_CHECKLIST',
    items: [
      'Ligue o computador',
      'Abra o bloco de notas',
      'Digite seu nome completo'
    ]
  },
  {
    type: 'QUIZ',
    question: 'O que é um computador?',
    options: [
      'Um eletrodoméstico',
      'Uma máquina que processa dados',
      'Um tipo de telefone',
      'Uma calculadora grande'
    ],
    correctAnswer: 1
  }
];
```

## Dados Mock

Para desenvolvimento sem API, o sistema utiliza dados mock automaticamente quando a variável `NEXT_PUBLIC_API_URL` não está configurada ou a API não está disponível.

### Usuários de Teste

| Email | Senha | Papel |
|-------|-------|-------|
| admin@lms.com | admin123 | ADMIN |
| aluno@lms.com | aluno123 | STUDENT |

## Tecnologias Utilizadas

- **Next.js 14+** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização utilitária
- **shadcn/ui** - Componentes de interface
- **React Query** - Gerenciamento de estado do servidor
- **React Hook Form** - Formulários performáticos
- **Lucide React** - Ícones
- **Sonner** - Notificações toast

## Scripts Disponíveis

```bash
pnpm dev        # Inicia o servidor de desenvolvimento
pnpm build      # Gera build de produção
pnpm start      # Inicia o servidor de produção
pnpm lint       # Executa o linter
```

## Licença

Este projeto é de uso educacional.
