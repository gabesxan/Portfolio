export const navigation = [
  ['/', 'Início'],
  ['/projetos', 'Projetos'],
  ['/sobre', 'Sobre'],
  ['/contato', 'Contato'],
  ['/mural', 'Mural'],
] as const;

export const placeholderNotice =
  'Conteúdo provisório — aguardando informações confirmadas por Gabriel.';

export interface ProjectPlaceholder {
  id: string;
  badge: string;
  title: string;
  problem: string;
  solution: string;
  role: string;
  technologies: string[];
  featured?: boolean;
  artworkVariant: 'mountains' | 'pyramids' | 'waves';
  repoUrl: string | null;
  liveUrl: string | null;
}

export const projectsPlaceholder: ProjectPlaceholder[] = [
  {
    id: 'projeto-01',
    badge: 'EXEMPLO VISUAL · PENDENTE',
    title: 'PROJETO 01',
    problem:
      'Espaço reservado para descrever o contexto real e o problema resolvido no projeto (dados aguardando confirmação de Gabriel).',
    solution:
      'Espaço reservado para detalhar a arquitetura, a interface e a entrega técnica construída.',
    role: 'Participação de Gabriel: a confirmar (Full Stack).',
    technologies: [
      'Tecnologia A (pendente)',
      'Tecnologia B (pendente)',
      'Tecnologia C (pendente)',
    ],
    featured: true,
    artworkVariant: 'mountains',
    repoUrl: null,
    liveUrl: null,
  },
  {
    id: 'projeto-02',
    badge: 'EXEMPLO VISUAL · PENDENTE',
    title: 'PROJETO 02',
    problem:
      'Descrição provisória do desafio técnico e das necessidades do cliente ou produto real.',
    solution:
      'Resumo provisório da solução implementada, integrações e resultados verificáveis.',
    role: 'Participação de Gabriel: a confirmar.',
    technologies: [
      'Stack 01 (pendente)',
      'Stack 02 (pendente)',
      'Stack 03 (pendente)',
    ],
    artworkVariant: 'pyramids',
    repoUrl: null,
    liveUrl: null,
  },
  {
    id: 'projeto-03',
    badge: 'EXEMPLO VISUAL · PENDENTE',
    title: 'PROJETO 03',
    problem:
      'Descrição provisória do cenário do projeto. Nenhuma informação pessoal ou de clientes foi inventada.',
    solution:
      'Estrutura pronta para receber links reais de demonstração, repositório e estudo de caso.',
    role: 'Participação de Gabriel: a confirmar.',
    technologies: [
      'Stack 01 (pendente)',
      'Stack 02 (pendente)',
      'Stack 03 (pendente)',
    ],
    artworkVariant: 'waves',
    repoUrl: null,
    liveUrl: null,
  },
];

export type StackCategoryId = 'frontend' | 'backend' | 'integracoes';

export interface StackItemPlaceholder {
  id: string;
  name: string;
  summary: string;
  iconType: 'laptop' | 'code' | 'layers' | 'gear';
}

export interface StackCategory {
  id: StackCategoryId;
  label: string;
  panelTitle: string;
  catAlign: 'diag-left' | 'center' | 'diag-right';
  catSprite: string;
  catAlt: string;
  description: string;
  items: StackItemPlaceholder[];
}

export const stackCategories: StackCategory[] = [
  {
    id: 'frontend',
    label: 'FRONTEND',
    panelTitle: 'STACKS DE FRONTEND',
    catAlign: 'diag-left',
    catSprite: 'hover-frontend',
    catAlt: 'Gatinho espiando na diagonal esquerda sobre a categoria Frontend',
    description:
      'Interfaces acessíveis, responsivas e com identidade visual própria (lista real de tecnologias aguardando confirmação de Gabriel).',
    items: [
      {
        id: 'fe-01',
        name: 'TECNOLOGIA 01 (PENDENTE)',
        summary:
          'Espaço reservado para tecnologia frontend confirmada por Gabriel.',
        iconType: 'laptop',
      },
      {
        id: 'fe-02',
        name: 'TECNOLOGIA 02 (PENDENTE)',
        summary:
          'Espaço reservado para linguagem ou tipagem confirmada por Gabriel.',
        iconType: 'code',
      },
      {
        id: 'fe-03',
        name: 'TECNOLOGIA 03 (PENDENTE)',
        summary:
          'Espaço reservado para biblioteca de estado/rotas confirmada por Gabriel.',
        iconType: 'layers',
      },
      {
        id: 'fe-04',
        name: 'TECNOLOGIA 04 (PENDENTE)',
        summary:
          'Espaço reservado para ferramenta de testes/build confirmada por Gabriel.',
        iconType: 'gear',
      },
    ],
  },
  {
    id: 'backend',
    label: 'BACKEND',
    panelTitle: 'STACKS DE BACKEND',
    catAlign: 'center',
    catSprite: 'hover-backend',
    catAlt: 'Gatinho espiando no centro sobre a categoria Backend',
    description:
      'APIs estruturadas, regras de negócio, persistência em banco de dados e segurança (lista real aguardando confirmação de Gabriel).',
    items: [
      {
        id: 'be-01',
        name: 'TECNOLOGIA 01 (PENDENTE)',
        summary:
          'Espaço reservado para runtime/linguagem backend confirmada por Gabriel.',
        iconType: 'code',
      },
      {
        id: 'be-02',
        name: 'TECNOLOGIA 02 (PENDENTE)',
        summary:
          'Espaço reservado para framework HTTP/API confirmado por Gabriel.',
        iconType: 'layers',
      },
      {
        id: 'be-03',
        name: 'TECNOLOGIA 03 (PENDENTE)',
        summary:
          'Espaço reservado para banco de dados relacional/SQL confirmado por Gabriel.',
        iconType: 'laptop',
      },
      {
        id: 'be-04',
        name: 'TECNOLOGIA 04 (PENDENTE)',
        summary:
          'Espaço reservado para validação, autenticação e testes de API.',
        iconType: 'gear',
      },
    ],
  },
  {
    id: 'integracoes',
    label: 'INTEGRAÇÕES',
    panelTitle: 'STACKS DE INTEGRAÇÕES',
    catAlign: 'diag-right',
    catSprite: 'hover-integracoes',
    catAlt:
      'Gatinho espiando na diagonal direita sobre a categoria Integrações',
    description:
      'Conexão entre serviços, mensageria, automação de deploy e observabilidade (lista real aguardando confirmação de Gabriel).',
    items: [
      {
        id: 'in-01',
        name: 'TECNOLOGIA 01 (PENDENTE)',
        summary:
          'Espaço reservado para integração com APIs REST/Webhooks confirmada.',
        iconType: 'layers',
      },
      {
        id: 'in-02',
        name: 'TECNOLOGIA 02 (PENDENTE)',
        summary:
          'Espaço reservado para containers e ambiente reprodutível confirmado.',
        iconType: 'gear',
      },
      {
        id: 'in-03',
        name: 'TECNOLOGIA 03 (PENDENTE)',
        summary:
          'Espaço reservado para CI/CD e automação de qualidade confirmada.',
        iconType: 'code',
      },
      {
        id: 'in-04',
        name: 'TECNOLOGIA 04 (PENDENTE)',
        summary:
          'Espaço reservado para serviços externos e provedores em nuvem.',
        iconType: 'laptop',
      },
    ],
  },
];

export const contactChannelsPlaceholder = {
  email: null as string | null,
  linkedin: null as string | null,
  github: 'https://github.com/gabesxan',
  formServiceConfigured: false,
  statusNote:
    'Canais diretos (e-mail oficial e LinkedIn) e serviço de envio de formulário estão aguardando configuração final de Gabriel.',
};
