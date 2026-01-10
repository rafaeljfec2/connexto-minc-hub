# MINC Teams - Documentação

> **Sistema de Gestão do Time Boas-Vindas**  
> Minha Igreja na Cidade

## 📚 Visão Geral

Este é o índice central da documentação do MINC Teams, um sistema completo de gestão de pessoas, equipes e escalas para o ministério Boas-Vindas.

**Stack Tecnológica:**

- **Frontend Web**: React + TypeScript + Vite + Tailwind CSS
- **Frontend Mobile**: React Native + Expo
- **Backend**: NestJS + TypeScript + PostgreSQL
- **Monorepo**: pnpm + Turborepo

---

## 🗺️ Mapa da Documentação

### 🏗️ Arquitetura

| Documento                                                    | Descrição                             |
| ------------------------------------------------------------ | ------------------------------------- |
| [DATABASE_SCHEMA](./architecture/DATABASE_SCHEMA.md)         | Esquema completo do banco de dados    |
| [SYSTEM_ARCHITECTURE](./architecture/SYSTEM_ARCHITECTURE.md) | Arquitetura geral do sistema          |
| [REFACTORING_HISTORY](./architecture/REFACTORING_HISTORY.md) | Histórico de refatorações importantes |

### 🔧 Backend

| Documento                                                   | Descrição                             |
| ----------------------------------------------------------- | ------------------------------------- |
| [**BACKEND_STANDARDS**](./backend/BACKEND_STANDARDS.md)     | ⭐ Padrões de desenvolvimento backend |
| [API_ENDPOINTS](./backend/API_ENDPOINTS.md)                 | Documentação completa da API REST     |
| [API_RESPONSE_CONTRACT](./backend/API_RESPONSE_CONTRACT.md) | Contrato de respostas da API          |
| [CHAT_API](./backend/CHAT_API.md)                           | API de chat e WebSocket               |
| [MIGRATIONS](./backend/MIGRATIONS.md)                       | Guia de migrações do banco            |
| [SETUP](./backend/SETUP.md)                                 | Configuração do ambiente backend      |

### 🎨 Frontend

| Documento                                        | Descrição                      |
| ------------------------------------------------ | ------------------------------ |
| [**DESIGN_SYSTEM**](./frontend/DESIGN_SYSTEM.md) | ⭐ Sistema de design completo  |
| [WEB_PATTERNS](./frontend/WEB_PATTERNS.md)       | Padrões de desenvolvimento web |

### 📱 Mobile

| Documento                                                            | Descrição                              |
| -------------------------------------------------------------------- | -------------------------------------- |
| [MOBILE_STRATEGY](./mobile/MOBILE_STRATEGY.md)                       | Estratégia e arquitetura mobile        |
| [ANDROID_SETUP](./mobile/ANDROID_SETUP.md)                           | Configuração Android (local e WSL2)    |
| [IOS_SETUP](./mobile/IOS_SETUP.md)                                   | Configuração iOS e TestFlight          |
| [WEB_PATTERN_IMPLEMENTATION](./mobile/WEB_PATTERN_IMPLEMENTATION.md) | Implementação de padrões web no mobile |
| [QR_CODE_IMPLEMENTATION](./mobile/QR_CODE_IMPLEMENTATION.md)         | Implementação de QR Code               |

### 🚀 DevOps

| Documento                                          | Descrição                 |
| -------------------------------------------------- | ------------------------- |
| [VERCEL_DEPLOYMENT](./devops/VERCEL_DEPLOYMENT.md) | Deploy completo na Vercel |
| [ENV_VARIABLES](./devops/ENV_VARIABLES.md)         | Variáveis de ambiente     |
| [DATA_MIGRATION](./devops/DATA_MIGRATION.md)       | Migração de dados         |

### ✅ Qualidade

| Documento                                                     | Descrição                            |
| ------------------------------------------------------------- | ------------------------------------ |
| [ESLINT_PRETTIER_CONFIG](./quality/ESLINT_PRETTIER_CONFIG.md) | Configuração de linting e formatação |
| [TESTING_STANDARDS](./quality/TESTING_STANDARDS.md)           | Padrões de testes                    |

### 📋 Processo

| Documento                                                 | Descrição                      |
| --------------------------------------------------------- | ------------------------------ |
| [BACKLOG](./process/BACKLOG.md)                           | Backlog consolidado do projeto |
| [DEVELOPMENT_PROGRESS](./process/DEVELOPMENT_PROGRESS.md) | Progresso do desenvolvimento   |
| [INSIGHTS](./process/INSIGHTS.md)                         | Insights e aprendizados        |

### 🏢 Infraestrutura

| Documento                               | Descrição           |
| --------------------------------------- | ------------------- |
| [DOCKER_SETUP](./infra/DOCKER_SETUP.md) | Configuração Docker |

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 14
- Docker (opcional)

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd connexto-minc-hub

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Rodar migrações
cd apps/api
pnpm migration:run

# Iniciar desenvolvimento
cd ../..
pnpm dev
```

### Acessos

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs (Swagger)**: http://localhost:3001/api/docs

---

## 📖 Guias Rápidos

### Para Desenvolvedores Frontend

1. Leia o [Design System](./frontend/DESIGN_SYSTEM.md)
2. Entenda os [Padrões Web](./frontend/WEB_PATTERNS.md)
3. Configure o [ambiente de desenvolvimento](../apps/web/README.md)

### Para Desenvolvedores Backend

1. Leia os [Backend Standards](./backend/BACKEND_STANDARDS.md)
2. Entenda o [Database Schema](./architecture/DATABASE_SCHEMA.md)
3. Consulte os [API Endpoints](./backend/API_ENDPOINTS.md)
4. Configure o [ambiente de desenvolvimento](./backend/SETUP.md)

### Para Desenvolvedores Mobile

1. Leia a [Mobile Strategy](./mobile/MOBILE_STRATEGY.md)
2. Configure [Android](./mobile/ANDROID_SETUP.md) ou [iOS](./mobile/IOS_SETUP.md)
3. Entenda a [implementação de padrões](./mobile/WEB_PATTERN_IMPLEMENTATION.md)

### Para DevOps

1. Configure [Deploy Vercel](./devops/VERCEL_DEPLOYMENT.md)
2. Gerencie [Variáveis de Ambiente](./devops/ENV_VARIABLES.md)
3. Execute [Migrações de Dados](./devops/DATA_MIGRATION.md)

---

## 🎯 Funcionalidades Principais

### MVP Implementado ✅

- ✅ Autenticação e controle de acesso (JWT)
- ✅ Dashboard com indicadores
- ✅ Gestão de Pessoas (CRUD completo)
- ✅ Gestão de Equipes (CRUD completo)
- ✅ Gestão de Ministérios
- ✅ Configuração de Cultos
- ✅ Escalas mensais
- ✅ Sistema de Chat
- ✅ Comunicação segmentada

### Em Desenvolvimento 🚧

- 🚧 Check-in via QR Code
- 🚧 Relatórios e estatísticas
- 🚧 Notificações push
- 🚧 Aplicativo mobile completo

### Roadmap 🗺️

- 📅 Automação de escalas
- 📅 Integração com calendário
- 📅 Expansão para outros ministérios
- 📅 Sistema de permissões granular

---

## 🤝 Contribuindo

### Fluxo de Trabalho

1. Criar branch a partir de `main`
2. Desenvolver feature/fix
3. Escrever testes
4. Rodar linting: `pnpm lint`
5. Rodar testes: `pnpm test`
6. Criar Pull Request

### Padrões de Commit

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração sem mudança de funcionalidade
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

### Code Review

- Todos os PRs devem ser revisados
- Testes devem passar
- Linting deve estar ok
- Documentação deve estar atualizada

---

## 📞 Suporte

### Documentação

- Consulte este índice para encontrar documentação específica
- Documentos marcados com ⭐ são essenciais para novos desenvolvedores

### Contato

- **Issues**: Use GitHub Issues para bugs e features
- **Discussões**: Use GitHub Discussions para dúvidas gerais

---

## 📝 Changelog

### 2026-01-10

- ✨ Reorganização completa da documentação
- ✨ Criação do Design System
- ✨ Criação dos Backend Standards
- ✨ Estruturação em 8 categorias

### 2024-XX-XX

- 🎉 Versão inicial do projeto

---

## 📄 Licença

[Definir licença]

---

**Última atualização**: 2026-01-10
