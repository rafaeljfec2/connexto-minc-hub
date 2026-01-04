# MINC Hub - Sistema de Gestão do Time Boas-Vindas

Sistema de gestão de pessoas e equipes para o Time Boas-Vindas da Minha Igreja na Cidade.

## Arquitetura

Este projeto utiliza um monorepo gerenciado pelo **pnpm** e **Turborepo**:

- **Frontend Web**: React + TypeScript + Vite
- **Frontend Mobile**: React Native (a ser implementado)
- **Backend**: Node.js + NestJS (a ser implementado)

## Estrutura do Projeto

```
connexto-minc-hub/
├── apps/
│   └── web/          # Frontend web (React + Vite)
├── packages/          # Pacotes compartilhados (futuro)
└── turbo.json        # Configuração do Turborepo
```

## Tecnologias

### Frontend Web
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **React Router** para roteamento
- **Tailwind CSS** para estilização (mobile-first)
- **Axios** para requisições HTTP
- **React Hook Form** + **Zod** para formulários e validação

## Desenvolvimento

### Pré-requisitos
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Instalação

```bash
# Instalar dependências
pnpm install

# Iniciar desenvolvimento (frontend web)
pnpm dev

# Build de produção
pnpm build

# Lint
pnpm lint
```

### Estrutura do Frontend Web

```
apps/web/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   │   ├── ui/        # Componentes de UI base
│   │   └── layout/    # Componentes de layout
│   ├── contexts/      # Contextos React (Auth, etc.)
│   ├── pages/         # Páginas da aplicação
│   ├── lib/           # Utilitários e configurações
│   ├── types/         # Tipos TypeScript
│   ├── App.tsx        # Componente principal
│   └── main.tsx       # Entry point
├── index.html
└── vite.config.ts
```

## Funcionalidades do MVP

- [x] Estrutura base do projeto
- [x] Autenticação e controle de acesso
- [x] Dashboard com indicadores
- [ ] Gestão de Pessoas
- [ ] Gestão de Equipes
- [ ] Configuração de Agenda de Cultos
- [ ] Sorteio automático de equipes
- [ ] Remanejamento manual
- [ ] Controle de frequência
- [ ] Comunicação segmentada

## Design System

O design é baseado no tema do site [minhaigrejanacidade.com](https://minhaigrejanacidade.com/), utilizando:
- Gradiente quente (laranja/vermelho) com textura grain
- Tipografia Inter
- Paleta de cores dark com acentos primários
- Mobile-first approach

## Segurança

- Autenticação via JWT
- Controle de acesso baseado em papéis (Admin, Coordenador, Líder, Membro)
- Validação de dados no frontend e backend

## Roadmap

1. **Fase 1**: MVP funcional
2. **Fase 2**: QR Code, relatórios e automações
3. **Fase 3**: Expansão para outros ministérios
