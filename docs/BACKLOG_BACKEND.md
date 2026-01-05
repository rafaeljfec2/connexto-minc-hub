# Backlog de Desenvolvimento - Backend (NestJS + PostgreSQL)

## 📋 Visão Geral

Este documento organiza todas as funcionalidades a serem implementadas no **Backend** do sistema MINC Teams, seguindo a arquitetura definida e priorizando o desenvolvimento incremental.

---

## 🎯 Fase 1: MVP Funcional

### EPIC-001: Implementação do Backend NestJS

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

### EPIC-002: Sistema de Autenticação (Backend)

- [ ] Endpoint de login (`POST /auth/login`)
- [ ] Endpoint de refresh token (`POST /auth/refresh`)
- [ ] Endpoint de logout (`POST /auth/logout`)
- [ ] Endpoint de recuperação de senha (`POST /auth/forgot-password`)
- [ ] Endpoint de alteração de senha (`POST /auth/change-password`)
- [ ] Geração e validação de JWT
- [ ] Refresh token rotation
- [ ] Rate limiting para endpoints de autenticação

### EPIC-003: Sistema de Usuários e Papéis (Backend)

- [ ] Modelo de Usuário do Sistema (entidade)
- [ ] Vinculação Usuário ↔ Pessoa/Servo
- [ ] CRUD de usuários (endpoints)
- [ ] Gestão de papéis (Admin, Coordenador, Líder, Membro)
- [ ] Atribuição de papéis
- [ ] Validação: Servo só acessa se tiver usuário vinculado
- [ ] Endpoints de gestão de usuários

### EPIC-004: Sorteio Automático de Equipes (Backend)

- [ ] Algoritmo de rodízio justo
- [ ] Configuração de regras de sorteio
- [ ] Endpoint para executar sorteio (`POST /schedules/draw`)
- [ ] Histórico de sorteios (modelo de dados)
- [ ] Validação de regras de sorteio
- [ ] Notificação de equipes sorteadas (service)

### EPIC-005: Remanejamento Manual (Backend)

- [ ] Endpoint para remanejamento (`PUT /schedules/:id/reassign`)
- [ ] Histórico de alterações (modelo de dados)
- [ ] Auditoria de mudanças (log de ações)
- [ ] Validação de permissões para remanejamento
- [ ] Notificação de alterações (service)

### EPIC-006: Controle de Frequência (Backend)

- [ ] Modelo de Presença (entidade)
- [ ] Endpoint para registro de presença (`POST /check-ins`)
- [ ] Endpoint para lista de presença (`GET /schedules/:id/attendance`)
- [ ] Endpoint para relatório de frequência (`GET /reports/attendance`)
- [ ] Cálculo de métricas de frequência
- [ ] Validação de check-in (QR Code ou manual)

### EPIC-007: Comunicação Segmentada (Backend)

- [ ] Modelo de Mensagem (entidade)
- [ ] Endpoint para envio de mensagem (`POST /messages`)
- [ ] Endpoint para histórico de mensagens (`GET /messages`)
- [ ] Service de segmentação (Time, Equipe, Servo)
- [ ] Integração com Firebase Cloud Messaging
- [ ] Service de notificações push
- [ ] Agendamento de mensagens

### EPIC-008: Dashboard de Indicadores (Backend)

- [ ] Endpoint de métricas de frequência (`GET /dashboard/attendance`)
- [ ] Endpoint de estatísticas de equipes (`GET /dashboard/teams`)
- [ ] Endpoint de estatísticas gerais (`GET /dashboard/stats`)
- [ ] Cálculo de KPIs
- [ ] Agregação de dados para gráficos

### EPIC-011: Sistema de Hierarquia (Backend)

- [ ] Modelo de dados de hierarquia
- [ ] Regras de permissão por nível (guards)
- [ ] Validação de acesso por nível
- [ ] Endpoints para gestão de hierarquia

---

## 🎯 Fase 2: QR Code, Relatórios e Automações

### EPIC-012: Geração de QR Code (Backend)

- [ ] Endpoint para gerar QR Code (`POST /servos/:id/qr-code`)
- [ ] Geração de payload criptografado
- [ ] Assinatura digital do QR Code
- [ ] Validação de expiração
- [ ] Histórico de QR Codes gerados
- [ ] Cache de QR Codes válidos

### EPIC-013: Validação de QR Code (Backend)

- [ ] Endpoint para validar QR Code (`POST /check-ins/validate-qr`)
- [ ] Validação de assinatura digital
- [ ] Validação de expiração
- [ ] Validação de pertencimento à equipe
- [ ] Validação de escala do dia
- [ ] Registro de check-in após validação
- [ ] Log de tentativas de validação

### EPIC-014: Check-in Manual (Backend)

- [ ] Endpoint para check-in manual (`POST /check-ins/manual`)
- [ ] Validação de permissões (apenas líder de equipe)
- [ ] Registro de múltiplos check-ins
- [ ] Campo de justificativa de ausência

### EPIC-015: Relatórios Detalhados (Backend)

- [ ] Endpoint de relatório por servo (`GET /reports/servos/:id`)
- [ ] Endpoint de relatório por equipe (`GET /reports/teams/:id`)
- [ ] Endpoint de relatório por time (`GET /reports/ministries/:id`)
- [ ] Endpoint de relatório de check-ins QR Code (`GET /reports/qr-code-check-ins`)
- [ ] Endpoint de relatório de escalas (`GET /reports/schedules`)
- [ ] Geração de PDF (service)
- [ ] Geração de Excel (service)
- [ ] Filtros avançados

### EPIC-016: Automações e Notificações (Backend)

- [ ] Service de lembretes de escala (24h antes)
- [ ] Service de notificação de check-in pendente
- [ ] Service de alertas de baixa frequência
- [ ] Service de notificação de remanejamento
- [ ] Agendamento de mensagens (cron jobs)
- [ ] Configuração de preferências de notificação

---

## 🎯 Fase 3: Expansão e Melhorias

### EPIC-017: Multi-ministério (Backend)

- [ ] Modelo de dados para múltiplos ministérios
- [ ] Isolamento de dados por ministério
- [ ] Endpoints para gestão centralizada
- [ ] Relatórios consolidados

### EPIC-021: Segurança Avançada (Backend)

- [ ] Criptografia de dados sensíveis
- [ ] Rate limiting global
- [ ] Proteção contra SQL injection (TypeORM)
- [ ] Validação de entrada rigorosa
- [ ] Auditoria de ações críticas
- [ ] Backup automático
- [ ] Política de retenção de dados
- [ ] LGPD compliance (endpoints de exclusão)

### EPIC-022: Testes Automatizados (Backend)

- [ ] Testes unitários (services)
- [ ] Testes de integração (controllers)
- [ ] Testes E2E (rotas completas)
- [ ] Testes de performance
- [ ] Cobertura mínima de 80%

### EPIC-023: Documentação (Backend)

- [ ] Documentação da API (Swagger/OpenAPI)
- [ ] Documentação de arquitetura
- [ ] Guia de desenvolvimento
- [ ] Documentação de QR Code

### EPIC-024: Infraestrutura (Backend)

- [ ] Configuração de CI/CD
- [ ] Ambientes (dev, staging, prod)
- [ ] Deploy automatizado
- [ ] Monitoramento (Sentry, LogRocket)
- [ ] Métricas e alertas
- [ ] Escalabilidade (load balancing)

---

## 🎯 Priorização

### Prioridade Alta (P0)

1. EPIC-001: Implementação do Backend NestJS
2. EPIC-002: Sistema de Autenticação (Backend)
3. EPIC-003: Sistema de Usuários e Papéis (Backend)

### Prioridade Média (P1)

1. EPIC-004: Sorteio Automático de Equipes
2. EPIC-006: Controle de Frequência
3. EPIC-005: Remanejamento Manual
4. EPIC-008: Dashboard de Indicadores

### Prioridade Baixa (P2)

1. EPIC-007: Comunicação Segmentada
2. EPIC-012: Geração de QR Code (Backend)
3. EPIC-013: Validação de QR Code (Backend)
4. EPIC-015: Relatórios Detalhados
5. EPIC-016: Automações e Notificações

---

## 📅 Roadmap Sugerido

### Q1 2024

- 🚧 Backend e API (EPIC-001)
- 🚧 Autenticação (EPIC-002)

### Q2 2024

- 📝 Funcionalidades de negócio (EPIC-004, EPIC-005, EPIC-006)
- 📝 Sistema de usuários (EPIC-003)
- 📝 Dashboard (EPIC-008)

### Q3 2024

- 📝 Estudo e implementação de QR Code (EPIC-012, EPIC-013)
- 📝 Relatórios (EPIC-015)
- 📝 Automações (EPIC-016)

### Q4 2024

- 📝 Expansão multi-ministério (EPIC-017)
- 📝 Segurança avançada (EPIC-021)
- 📝 Melhorias e refinamentos

---

## 📝 Notas Importantes

### Hierarquia de Usuários

1. **PASTORr** - Acesso total ao sistema
2. **Líder de Time/Ministério** - Gerencia o time/ministério
3. **Líder de Equipe** - Gerencia a equipe, pode ler QR Code
4. **Servo** - Gera QR Code, não faz check-in próprio

### Fluxo de Check-in com QR Code

1. Servo gera QR Code único
2. Líder escaneia QR Code
3. Backend valida:
   - QR Code válido?
   - Não expirado?
   - Servo pertence à equipe?
   - Servo está na escala?
4. Registra check-in se válido

### Requisitos de Usuário

- **Servo só acessa se tiver usuário vinculado**
- Usuário criado por Admin/Coordenador
- Vinculação Usuário ↔ Servo obrigatória

---

## 🔄 Atualizações

- **Última atualização**: 2024-01-XX
- **Versão**: 1.0.0
- **Próxima revisão**: Semanal
