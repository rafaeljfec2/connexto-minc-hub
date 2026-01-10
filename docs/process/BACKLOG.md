# Backlog de Desenvolvimento - MINC Teams

## 📋 Visão Geral

Este documento é um índice geral dos backlogs do sistema MINC Teams. Os backlogs foram separados por plataforma para melhor organização:

- **[BACKLOG_BACKEND.md](./BACKLOG_BACKEND.md)** - Backend (NestJS + PostgreSQL)
- **[BACKLOG_WEB.md](./BACKLOG_WEB.md)** - Frontend Web (React + Vite + TypeScript)
- **[BACKLOG_MOBILE.md](./BACKLOG_MOBILE.md)** - Aplicativo Mobile (React Native)

---

## 🎯 Fase 1: MVP Funcional (Em Andamento)

### ✅ Concluído

- [x] Estrutura do monorepo (pnpm + Turborepo)
- [x] Frontend web (React + Vite + TypeScript)
- [x] Sistema de autenticação mock
- [x] Layout responsivo (mobile-first)
- [x] Sistema de temas (dark/light)
- [x] Componentes reutilizáveis de CRUD
- [x] Página de Igrejas (cadastro completo)
- [x] Página de Times/Ministérios (cadastro completo)
- [x] Página de Equipes (cadastro completo)
- [x] Página de Servos (cadastro completo)
- [x] Página de Cultos/Serviços (cadastro completo)
- [x] Página de Escalas (cadastro completo)
- [x] Visualização Grid/List em todas as páginas de cadastro
- [x] Sistema de filtros e busca
- [x] Página de Sorteio Mensal (visualização)

---

## 🔧 BACKEND (NestJS + PostgreSQL)

### 📝 Fase 1: MVP Funcional

#### EPIC-001: Implementação do Backend NestJS

- [ ] Configuração do projeto NestJS
- [ ] Estrutura de módulos (Clean Architecture)
- [ ] Configuração do PostgreSQL
- [ ] Migrations do banco de dados
- [ ] Entidades e DTOs
- [ ] Serviços de negócio
- [ ] Controllers e rotas REST
- [ ] Middleware de autenticação JWT
- [ ] Guards de autorização por papel
- [ ] Validação de dados (class-validator)
- [ ] Tratamento de erros global
- [ ] Logging e monitoramento

#### EPIC-002: Sistema de Autenticação (Backend)

- [ ] Endpoint de login (`POST /auth/login`)
- [ ] Endpoint de refresh token (`POST /auth/refresh`)
- [ ] Endpoint de logout (`POST /auth/logout`)
- [ ] Endpoint de recuperação de senha (`POST /auth/forgot-password`)
- [ ] Endpoint de alteração de senha (`POST /auth/change-password`)
- [ ] Geração e validação de JWT
- [ ] Refresh token rotation
- [ ] Rate limiting para endpoints de autenticação

#### EPIC-003: Sistema de Usuários e Papéis (Backend)

- [ ] Modelo de Usuário do Sistema (entidade)
- [ ] Vinculação Usuário ↔ Pessoa/Servo
- [ ] CRUD de usuários (endpoints)
- [ ] Gestão de papéis (Admin, Coordenador, Líder, Membro)
- [ ] Atribuição de papéis
- [ ] Validação: Servo só acessa se tiver usuário vinculado
- [ ] Endpoints de gestão de usuários

#### EPIC-004: Sorteio Automático de Equipes (Backend)

- [ ] Algoritmo de rodízio justo
- [ ] Configuração de regras de sorteio
- [ ] Endpoint para executar sorteio (`POST /schedules/draw`)
- [ ] Histórico de sorteios (modelo de dados)
- [ ] Validação de regras de sorteio
- [ ] Notificação de equipes sorteadas (service)

#### EPIC-005: Remanejamento Manual (Backend)

- [ ] Endpoint para remanejamento (`PUT /schedules/:id/reassign`)
- [ ] Histórico de alterações (modelo de dados)
- [ ] Auditoria de mudanças (log de ações)
- [ ] Validação de permissões para remanejamento
- [ ] Notificação de alterações (service)

#### EPIC-006: Controle de Frequência (Backend)

- [ ] Modelo de Presença (entidade)
- [ ] Endpoint para registro de presença (`POST /check-ins`)
- [ ] Endpoint para lista de presença (`GET /schedules/:id/attendance`)
- [ ] Endpoint para relatório de frequência (`GET /reports/attendance`)
- [ ] Cálculo de métricas de frequência
- [ ] Validação de check-in (QR Code ou manual)

#### EPIC-007: Comunicação Segmentada (Backend)

- [ ] Modelo de Mensagem (entidade)
- [ ] Endpoint para envio de mensagem (`POST /messages`)
- [ ] Endpoint para histórico de mensagens (`GET /messages`)
- [ ] Service de segmentação (Time, Equipe, Servo)
- [ ] Integração com Firebase Cloud Messaging
- [ ] Service de notificações push
- [ ] Agendamento de mensagens

#### EPIC-008: Dashboard de Indicadores (Backend)

- [ ] Endpoint de métricas de frequência (`GET /dashboard/attendance`)
- [ ] Endpoint de estatísticas de equipes (`GET /dashboard/teams`)
- [ ] Endpoint de estatísticas gerais (`GET /dashboard/stats`)
- [ ] Cálculo de KPIs
- [ ] Agregação de dados para gráficos

#### EPIC-011: Sistema de Hierarquia (Backend)

- [ ] Modelo de dados de hierarquia
- [ ] Regras de permissão por nível (guards)
- [ ] Validação de acesso por nível
- [ ] Endpoints para gestão de hierarquia

#### EPIC-012: Geração de QR Code (Backend)

- [ ] Endpoint para gerar QR Code (`POST /servos/:id/qr-code`)
- [ ] Geração de payload criptografado
- [ ] Assinatura digital do QR Code
- [ ] Validação de expiração
- [ ] Histórico de QR Codes gerados
- [ ] Cache de QR Codes válidos

#### EPIC-013: Validação de QR Code (Backend)

- [ ] Endpoint para validar QR Code (`POST /check-ins/validate-qr`)
- [ ] Validação de assinatura digital
- [ ] Validação de expiração
- [ ] Validação de pertencimento à equipe
- [ ] Validação de escala do dia
- [ ] Registro de check-in após validação
- [ ] Log de tentativas de validação

#### EPIC-014: Check-in Manual (Backend)

- [ ] Endpoint para check-in manual (`POST /check-ins/manual`)
- [ ] Validação de permissões (apenas líder de equipe)
- [ ] Registro de múltiplos check-ins
- [ ] Campo de justificativa de ausência

#### EPIC-015: Relatórios Detalhados (Backend)

- [ ] Endpoint de relatório por servo (`GET /reports/servos/:id`)
- [ ] Endpoint de relatório por equipe (`GET /reports/teams/:id`)
- [ ] Endpoint de relatório por time (`GET /reports/ministries/:id`)
- [ ] Endpoint de relatório de check-ins QR Code (`GET /reports/qr-code-check-ins`)
- [ ] Endpoint de relatório de escalas (`GET /reports/schedules`)
- [ ] Geração de PDF (service)
- [ ] Geração de Excel (service)
- [ ] Filtros avançados

#### EPIC-016: Automações e Notificações (Backend)

- [ ] Service de lembretes de escala (24h antes)
- [ ] Service de notificação de check-in pendente
- [ ] Service de alertas de baixa frequência
- [ ] Service de notificação de remanejamento
- [ ] Agendamento de mensagens (cron jobs)
- [ ] Configuração de preferências de notificação

#### EPIC-021: Segurança Avançada (Backend)

- [ ] Criptografia de dados sensíveis
- [ ] Rate limiting global
- [ ] Proteção contra SQL injection (TypeORM)
- [ ] Validação de entrada rigorosa
- [ ] Auditoria de ações críticas
- [ ] Backup automático
- [ ] Política de retenção de dados
- [ ] LGPD compliance (endpoints de exclusão)

#### EPIC-022: Testes Automatizados (Backend)

- [ ] Testes unitários (services)
- [ ] Testes de integração (controllers)
- [ ] Testes E2E (rotas completas)
- [ ] Testes de performance
- [ ] Cobertura mínima de 80%

#### EPIC-023: Documentação (Backend)

- [ ] Documentação da API (Swagger/OpenAPI)
- [ ] Documentação de arquitetura
- [ ] Guia de desenvolvimento
- [ ] Documentação de QR Code

#### EPIC-024: Infraestrutura (Backend)

- [ ] Configuração de CI/CD
- [ ] Ambientes (dev, staging, prod)
- [ ] Deploy automatizado
- [ ] Monitoramento (Sentry, LogRocket)
- [ ] Métricas e alertas
- [ ] Escalabilidade (load balancing)

---

## 💻 WEB (React + Vite + TypeScript)

### 📝 Fase 1: MVP Funcional

#### EPIC-002: Sistema de Autenticação (Web)

- [ ] Integração com endpoint de login
- [ ] Integração com endpoint de refresh token
- [ ] Integração com endpoint de logout
- [ ] Tela de recuperação de senha
- [ ] Tela de alteração de senha
- [ ] Context de autenticação atualizado
- [ ] Interceptors para refresh token
- [ ] Tratamento de erros de autenticação

#### EPIC-003: Sistema de Usuários e Papéis (Web)

- [ ] Página de gestão de usuários (`/users`)
- [ ] Listagem de usuários
- [ ] Formulário de criação de usuário
- [ ] Formulário de edição de usuário
- [ ] Vinculação Usuário ↔ Servo
- [ ] Gestão de papéis (select de papéis)
- [ ] Validação: Servo só acessa se tiver usuário vinculado
- [ ] Bloqueio de acesso para servos sem usuário

#### EPIC-004: Sorteio Automático de Equipes (Web)

- [ ] Interface para executar sorteio mensal
- [ ] Configuração de regras de sorteio
- [ ] Visualização de histórico de sorteios
- [ ] Confirmação de sorteio
- [ ] Feedback visual do processo

#### EPIC-005: Remanejamento Manual (Web)

- [ ] Interface para remanejamento (`/schedules/:id/reassign`)
- [ ] Drag and drop de servos entre equipes
- [ ] Histórico de alterações (modal/timeline)
- [ ] Confirmação de remanejamento
- [ ] Notificação de alterações

#### EPIC-006: Controle de Frequência (Web)

- [ ] Página de lista de presença (`/schedules/:id/attendance`)
- [ ] Registro de presença (checkboxes)
- [ ] Visualização de frequência por servo
- [ ] Relatório de frequência (gráficos)
- [ ] Dashboard de frequência

#### EPIC-007: Comunicação Segmentada (Web)

- [ ] Página de comunicação (`/communication`)
- [ ] Formulário de envio de mensagem
- [ ] Seleção de segmento (Time, Equipe, Servo)
- [ ] Histórico de mensagens enviadas
- [ ] Preview de mensagem
- [ ] Agendamento de mensagens

#### EPIC-008: Dashboard de Indicadores (Web)

- [ ] Página de dashboard (`/dashboard`)
- [ ] Gráficos de frequência (Chart.js/Recharts)
- [ ] Estatísticas de equipes
- [ ] Cards de métricas
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Filtros de período

#### EPIC-009: Refinamentos de Interface (Web)

- [ ] Página de Perfil do Usuário (`/profile`)
- [ ] Página de Configurações (`/settings`)
- [ ] Melhorias de acessibilidade
- [ ] Otimizações de performance (lazy loading)
- [ ] Testes E2E (Playwright/Cypress)

#### EPIC-010: Pesquisa e Análise de QR Code (Web)

- [ ] Pesquisa de bibliotecas para web
- [ ] Protótipo de geração de QR Code
- [ ] Protótipo de leitura de QR Code (câmera)
- [ ] Testes de compatibilidade de navegadores

#### EPIC-011: Sistema de Hierarquia (Web)

- [ ] Interface de gestão de hierarquia
- [ ] Visualização de níveis hierárquicos
- [ ] Atribuição de papéis por interface
- [ ] Validação de permissões na UI

#### EPIC-012: Geração de QR Code (Web)

- [ ] Tela de geração de QR Code (`/servos/:id/qr-code`)
- [ ] Componente de exibição de QR Code
- [ ] Botão de atualizar QR Code
- [ ] Contador de expiração
- [ ] Histórico de QR Codes gerados

#### EPIC-013: Leitura de QR Code (Web)

- [ ] Tela de leitura de QR Code (`/check-ins/scan`)
- [ ] Integração com câmera do navegador
- [ ] Scanner de QR Code (biblioteca)
- [ ] Feedback visual de leitura
- [ ] Confirmação de check-in
- [ ] Tratamento de erros (QR Code inválido, expirado, etc.)
- [ ] Alternância entre câmeras

#### EPIC-014: Check-in Manual (Web)

- [ ] Tela de check-in manual (`/check-ins/manual`)
- [ ] Lista de servos da equipe
- [ ] Checkboxes de presença
- [ ] Campo de justificativa de ausência
- [ ] Confirmação de check-in

#### EPIC-015: Relatórios Detalhados (Web)

- [ ] Página de relatórios (`/reports`)
- [ ] Filtros avançados
- [ ] Visualização de relatórios
- [ ] Botão de exportação (PDF/Excel)
- [ ] Gráficos e visualizações

#### EPIC-016: Automações e Notificações (Web)

- [ ] Configuração de preferências de notificação
- [ ] Lista de notificações recebidas
- [ ] Badge de notificações não lidas
- [ ] Integração com Web Push API

#### EPIC-017: Multi-ministério (Web)

- [ ] Seletor de ministério (header)
- [ ] Isolamento de dados por ministério
- [ ] Gestão centralizada
- [ ] Relatórios consolidados

#### EPIC-018: Funcionalidades Avançadas (Web)

- [ ] Calendário integrado
- [ ] Sincronização com Google Calendar
- [ ] Chat interno
- [ ] Upload de documentos
- [ ] Biblioteca de recursos

#### EPIC-022: Testes Automatizados (Web)

- [ ] Testes unitários (componentes)
- [ ] Testes de integração (páginas)
- [ ] Testes E2E (fluxos completos)
- [ ] Testes de acessibilidade
- [ ] Cobertura mínima de 80%

---

## 📱 MOBILE (React Native)

### 📝 Fase 3: Aplicativo Mobile

#### EPIC-019: Setup do App Mobile

- [ ] Configuração do projeto React Native
- [ ] Integração com monorepo
- [ ] Navegação (React Navigation)
- [ ] Autenticação mobile (context)
- [ ] Design system mobile (componentes base)
- [ ] Configuração de build (Android/iOS)
- [ ] Configuração de ambiente

#### EPIC-020: Funcionalidades Mobile - Autenticação

- [ ] Tela de login
- [ ] Tela de recuperação de senha
- [ ] Integração com backend
- [ ] Armazenamento seguro de tokens (Keychain/Keystore)
- [ ] Refresh token automático

#### EPIC-020: Funcionalidades Mobile - Dashboard

- [ ] Dashboard mobile (home)
- [ ] Cards de informações rápidas
- [ ] Navegação principal
- [ ] Notificações push

#### EPIC-020: Funcionalidades Mobile - Escalas

- [ ] Visualização de escalas do servo
- [ ] Calendário de escalas
- [ ] Detalhes da escala
- [ ] Notificações de escala

#### EPIC-020: Funcionalidades Mobile - QR Code (Servo)

- [ ] Tela de geração de QR Code
- [ ] Componente de exibição de QR Code
- [ ] Atualização de QR Code
- [ ] Contador de expiração
- [ ] Compartilhamento de QR Code

#### EPIC-020: Funcionalidades Mobile - QR Code (Líder)

- [ ] Tela de leitura de QR Code
- [ ] Integração com câmera nativa
- [ ] Scanner de QR Code (react-native-camera)
- [ ] Feedback visual e sonoro
- [ ] Confirmação de check-in
- [ ] Lista de check-ins realizados

#### EPIC-020: Funcionalidades Mobile - Check-in Manual

- [ ] Tela de check-in manual
- [ ] Lista de servos da equipe
- [ ] Marcação de presença
- [ ] Justificativa de ausência
- [ ] Sincronização offline

#### EPIC-020: Funcionalidades Mobile - Notificações

- [ ] Configuração de Firebase Cloud Messaging
- [ ] Recebimento de notificações push
- [ ] Tratamento de notificações
- [ ] Badge de notificações
- [ ] Histórico de notificações

#### EPIC-020: Funcionalidades Mobile - Modo Offline

- [ ] Armazenamento local (AsyncStorage/SQLite)
- [ ] Sincronização de dados
- [ ] Queue de ações offline
- [ ] Sincronização quando online
- [ ] Indicador de status de conexão

#### EPIC-020: Funcionalidades Mobile - Perfil

- [ ] Tela de perfil do usuário
- [ ] Edição de informações
- [ ] Configurações do app
- [ ] Logout

#### EPIC-022: Testes Automatizados (Mobile)

- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes E2E (Detox)
- [ ] Testes em dispositivos reais
- [ ] Cobertura mínima de 80%

---

## 📊 Métricas de Sucesso

### KPIs a Acompanhar

- [ ] Taxa de uso do sistema
- [ ] Taxa de check-in via QR Code
- [ ] Tempo médio de check-in
- [ ] Satisfação dos usuários
- [ ] Taxa de erro
- [ ] Performance da aplicação

---

## 🎯 Priorização

### Prioridade Alta (P0) - Backend

1. EPIC-001: Implementação do Backend NestJS
2. EPIC-002: Sistema de Autenticação (Backend)
3. EPIC-003: Sistema de Usuários e Papéis (Backend)

### Prioridade Alta (P0) - Web

1. EPIC-002: Sistema de Autenticação (Web)
2. EPIC-003: Sistema de Usuários e Papéis (Web)
3. Integração Frontend-Backend

### Prioridade Média (P1) - Backend

1. EPIC-004: Sorteio Automático de Equipes
2. EPIC-006: Controle de Frequência
3. EPIC-005: Remanejamento Manual
4. EPIC-008: Dashboard de Indicadores

### Prioridade Média (P1) - Web

1. EPIC-004: Sorteio Automático de Equipes (Web)
2. EPIC-006: Controle de Frequência (Web)
3. EPIC-005: Remanejamento Manual (Web)
4. EPIC-008: Dashboard de Indicadores (Web)

### Prioridade Baixa (P2) - Backend

1. EPIC-007: Comunicação Segmentada
2. EPIC-010: Pesquisa de QR Code
3. EPIC-012: Geração de QR Code (Backend)
4. EPIC-013: Validação de QR Code (Backend)
5. EPIC-015: Relatórios Detalhados

### Prioridade Baixa (P2) - Web

1. EPIC-007: Comunicação Segmentada (Web)
2. EPIC-012: Geração de QR Code (Web)
3. EPIC-013: Leitura de QR Code (Web)
4. EPIC-015: Relatórios Detalhados (Web)

### Prioridade Baixa (P2) - Mobile

1. EPIC-019: Setup do App Mobile
2. EPIC-020: Funcionalidades Mobile (após backend completo)

---

## 📅 Roadmap Sugerido

### Q1 2024

- ✅ Estrutura base e frontend MVP (Web)
- 🚧 Backend e API (Backend)
- 🚧 Autenticação (Backend + Web)

### Q2 2024

- 📝 Funcionalidades de negócio (Backend + Web)
- 📝 Sistema de usuários (Backend + Web)
- 📝 Controle de frequência (Backend + Web)

### Q3 2024

- 📝 Estudo e implementação de QR Code (Backend + Web)
- 📝 Relatórios (Backend + Web)
- 📝 Automações (Backend + Web)
- 📝 Setup do App Mobile (Mobile)

### Q4 2024

- 📝 Funcionalidades Mobile (Mobile)
- 📝 Expansão multi-ministério (Backend + Web)
- 📝 Melhorias e refinamentos (Todas as plataformas)

---

## 📝 Notas Importantes

### Hierarquia de Usuários - Detalhamento

1. **PASTORr**

   - Acesso total ao sistema
   - Pode gerenciar todos os níveis
   - Visualiza todos os relatórios
   - Pode atribuir papéis

2. **Líder de Time/Ministério**

   - Gerencia o time/ministério
   - Visualiza equipes e servos do time
   - Pode criar e gerenciar equipes
   - Visualiza relatórios do time
   - Não pode ler QR Code (apenas líder de equipe)

3. **Líder de Equipe**

   - Gerencia a equipe específica
   - Visualiza servos da equipe
   - **Pode ler QR Code dos servos da equipe**
   - Faz check-in dos servos
   - Visualiza relatórios da equipe

4. **Servo**
   - Visualiza apenas suas informações
   - Visualiza suas escalas
   - **Gera QR Code para check-in**
   - Não pode fazer check-in próprio
   - Recebe notificações

### Fluxo de Check-in com QR Code

1. Servo acessa o app (web ou mobile) e gera seu QR Code único
2. No dia do culto, servo apresenta QR Code ao líder de equipe
3. Líder de equipe abre o app (web ou mobile) e acessa a tela de leitura de QR Code
4. Líder escaneia o QR Code do servo
5. Sistema valida (backend):
   - QR Code é válido?
   - QR Code não expirou?
   - Servo pertence à equipe do líder?
   - Servo está na escala do dia?
6. Se válido, registra check-in e confirma
7. Se inválido, exibe erro específico

### Requisitos de Usuário

- **Servo só pode acessar o sistema se tiver um usuário vinculado**
- Usuário deve ser criado por Admin/Coordenador
- Vinculação Usuário ↔ Servo é obrigatória
- Servo sem usuário não tem acesso ao sistema

---

## 🔄 Atualizações

- **Última atualização**: 2024-01-XX
- **Versão do backlog**: 2.0.0
- **Próxima revisão**: Semanal

---

## 📞 Contato e Dúvidas

Para dúvidas sobre o backlog ou sugestões de priorização, entre em contato com o time de desenvolvimento.
