# Backlog de Desenvolvimento - MINC Teams

> **Last Updated**: 2026-01-10  
> **Status**: Active  
> **Version**: 3.1.0

## 📋 Visão Geral

Este documento consolida o backlog completo do sistema MINC Teams, organizado por plataforma e prioridade. Para backlogs específicos por área, consulte:

- [Backend Standards](./backend/BACKEND_STANDARDS.md) - Padrões de desenvolvimento backend
- [Design System](./frontend/DESIGN_SYSTEM.md) - Sistema de design frontend
- [Mobile Strategy](./mobile/MOBILE_STRATEGY.md) - Estratégia mobile

---

## ✅ MVP Concluído (Fase 1)

### Infraestrutura e Setup

- [x] Monorepo (pnpm + Turborepo)
- [x] Backend NestJS + PostgreSQL + TypeORM
- [x] Frontend Web (React + Vite + TypeScript + Tailwind CSS)
- [x] Sistema de build e deploy (Vercel)
- [x] Migrations do banco de dados
- [x] Configuração de ambientes (dev, staging, prod)

### Autenticação e Segurança (Backend + Frontend)

- [x] Sistema de autenticação JWT
- [x] Endpoint de login (`POST /auth/login`)
- [x] Endpoint de refresh token (`POST /auth/refresh-token`)
- [x] Endpoint de logout (`POST /auth/logout`)
- [x] Endpoint de recuperação de senha (`POST /auth/forgot-password`)
- [x] Endpoint de reset de senha (`POST /auth/reset-password`)
- [x] Endpoint de usuário atual (`GET /auth/me`)
- [x] Refresh token com cookies HttpOnly
- [x] Guards de autorização por papel (JwtAuthGuard)
- [x] Controle de acesso baseado em roles
- [x] Rate limiting para endpoints sensíveis
- [x] Security logging (eventos de login, logout, etc.)
- [x] Context de autenticação (Frontend)
- [x] Interceptors para refresh token automático
- [x] Tela de login (Frontend)
- [x] Tratamento de erros de autenticação

### Gestão de Dados - CRUD Completo (Backend + Frontend)

#### Igrejas (Churches)

- [x] CRUD completo (Backend)
- [x] Soft delete
- [x] Página de gestão (Frontend)
- [x] Visualização Grid/List

#### Times/Ministérios (Ministries)

- [x] CRUD completo (Backend)
- [x] Filtro por igreja
- [x] Soft delete
- [x] Página de gestão (Frontend)
- [x] Visualização Grid/List
- [x] ComboBox para seleção

#### Equipes (Teams)

- [x] CRUD completo (Backend)
- [x] Filtro por ministério
- [x] Gestão de membros (add/remove)
- [x] Soft delete
- [x] Página de gestão (Frontend)
- [x] Página de detalhes de equipe
- [x] Visualização Grid/List
- [x] ComboBox para seleção

#### Servos/Pessoas (Persons)

- [x] CRUD completo (Backend)
- [x] Filtro por ministério e equipe
- [x] Vinculação com equipes (team members)
- [x] Soft delete
- [x] Página de gestão (Frontend)
- [x] Visualização Grid/List
- [x] Formulário completo com validações
- [x] ComboBox para seleção

#### Cultos/Serviços (Services)

- [x] CRUD completo (Backend)
- [x] Filtro por igreja
- [x] Tipos de culto (sunday_morning, sunday_evening, etc.)
- [x] Soft delete
- [x] Página de gestão (Frontend)
- [x] Visualização Grid/List

#### Escalas (Schedules)

- [x] CRUD completo (Backend)
- [x] Filtro por serviço e data
- [x] Gestão de equipes por escala
- [x] Soft delete
- [x] Página de gestão (Frontend)
- [x] Visualização Grid/List
- [x] Página de planejamento mensal

#### Usuários (Users)

- [x] CRUD completo (Backend)
- [x] Vinculação Usuário ↔ Pessoa
- [x] Gestão de papéis (admin, coordinator, leader, member)
- [x] Campo canCheckIn
- [x] Avatar support
- [x] Soft delete
- [x] Página de gestão (Frontend)
- [x] Formulário de criação/edição
- [x] ComboBox para seleção de papel e pessoa

### Comunicação (Chat)

- [x] Sistema de Chat (WebSocket + REST)
- [x] Conversas 1:1 (Backend)
- [x] Endpoint de conversas (`GET /chat/conversations`)
- [x] Endpoint de mensagens (`GET /chat/conversations/:id/messages`)
- [x] Endpoint de envio (`POST /chat/conversations/:id/messages`)
- [x] Endpoint de criar conversa (`POST /chat/conversations`)
- [x] Endpoint de marcar como lido (`PUT /chat/conversations/:id/messages/read`)
- [x] Endpoint de contagem não lidas (`GET /chat/conversations/unread-count`)
- [x] Grupos de chat (Backend)
- [x] Mensagens em tempo real (WebSocket)
- [x] Indicadores de mensagens não lidas
- [x] Status online/offline
- [x] Página de Chat (Frontend)
- [x] Página de detalhes de conversa
- [x] Componente de chat flutuante
- [x] Notificações de novas mensagens

### Check-in e Presença

- [x] Endpoint de geração de QR Code (`POST /checkin/generate-qr`)
- [x] Endpoint de validação de QR Code (`POST /checkin/validate-qr`)
- [x] Endpoint de histórico de check-in (`GET /checkin/history`)
- [x] Validação de regras de negócio (horário, equipe, escala)
- [x] Registro de presença (Attendances)
- [x] CRUD de attendances (Backend)
- [x] Estatísticas de presença por escala
- [x] Página de Check-in (Frontend)
- [x] Componente de QR Code display

### Planejamento e Escalas

- [x] Configuração de escalas mensais (Backend)
- [x] Endpoint de planejamento (`/schedule-planning`)
- [x] Geração automática de escalas
- [x] Configuração de regras de planejamento
- [x] Página de planejamento mensal (Frontend)
- [x] Página de configuração de planejamento
- [x] Visualização de escalas por mês
- [x] Calendário de escalas

### Interface Web

- [x] Layout responsivo (mobile-first)
- [x] Sistema de temas (dark/light mode)
- [x] Sidebar navigation (desktop)
- [x] Footer navigation (mobile)
- [x] Componentes base (Button, Input, Modal, Card, etc.)
- [x] Componentes avançados (ComboBox, DataTable, Pagination, etc.)
- [x] Visualização Grid/List em todas as páginas
- [x] Sistema de filtros e busca
- [x] Dashboard com indicadores
- [x] Página de perfil do usuário
- [x] Página de configurações
- [x] Design System completo e documentado

### Upload e Arquivos

- [x] Sistema de upload (Backend)
- [x] Endpoint de upload (`POST /upload`)
- [x] Suporte para avatares
- [x] Validação de tipos de arquivo

### Documentação

- [x] Swagger/OpenAPI (Backend)
- [x] Design System (Frontend)
- [x] Backend Standards
- [x] API Endpoints documentation
- [x] Database Schema documentation
- [x] Documentação reorganizada e profissional

---

## 🚧 Em Desenvolvimento (Fase 2)

### Check-in Avançado

- [ ] Interface de leitura de QR Code (câmera web)
- [ ] Feedback visual/sonoro de validação
- [ ] Check-in manual (interface completa)
- [ ] Justificativa de ausência
- [ ] Relatórios de frequência detalhados

### Comunicação Avançada

- [ ] Comunicação segmentada (Time, Equipe, Servo)
- [ ] Endpoint de envio em massa
- [ ] Envio de mensagens para grupos
- [ ] Agendamento de mensagens
- [ ] Notificações push (Firebase Cloud Messaging)
- [ ] Anexos em mensagens
- [ ] Página de comunicação segmentada (Frontend)

### Relatórios e Analytics

- [ ] Relatórios de frequência por período
- [ ] Relatórios por servo (histórico completo)
- [ ] Relatórios por equipe (performance)
- [ ] Relatórios por time (estatísticas)
- [ ] Exportação em PDF
- [ ] Exportação em Excel
- [ ] Gráficos interativos (Chart.js/Recharts)
- [ ] Dashboard de analytics avançado
- [ ] Filtros avançados de relatórios

### Automações

- [ ] Sorteio automático de equipes
- [ ] Algoritmo de rodízio justo
- [ ] Lembretes de escala (24h antes)
- [ ] Notificação de check-in pendente
- [ ] Alertas de baixa frequência
- [ ] Cron jobs para automações

---

## 📱 Mobile (Fase 3)

### Setup e Infraestrutura

- [ ] Configuração React Native + Expo
- [ ] Integração com monorepo
- [ ] Navegação (React Navigation)
- [ ] Design system mobile
- [ ] Build Android/iOS
- [ ] Configuração de ambientes

### Funcionalidades Core

- [ ] Autenticação mobile
- [ ] Dashboard mobile
- [ ] Visualização de escalas
- [ ] Geração de QR Code (Servo)
- [ ] Leitura de QR Code (Líder)
- [ ] Check-in manual
- [ ] Chat mobile
- [ ] Notificações push
- [ ] Modo offline
- [ ] Sincronização de dados

### Deploy

- [ ] Google Play Store
- [ ] Apple App Store
- [ ] TestFlight (beta)
- [ ] Documentação de deploy

---

## 🎯 Backlog por Prioridade

### P0 - Crítico (Próximas 2 semanas)

#### Frontend

- [ ] Interface de leitura de QR Code (câmera)
- [ ] Componente de scanner QR
- [ ] Tela de check-in manual completa
- [ ] Feedback visual de validação

#### Backend

- [ ] Melhorias no sistema de QR Code (se necessário)
- [ ] Otimizações de performance

### P1 - Alta (Próximo mês)

#### Backend

- [ ] Sistema de notificações push (Firebase)
- [ ] Endpoint de comunicação segmentada
- [ ] Endpoint de relatórios detalhados
- [ ] Agendamento de mensagens (cron jobs)
- [ ] Sorteio automático de equipes

#### Frontend

- [ ] Página de comunicação segmentada
- [ ] Página de relatórios
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Interface de sorteio automático
- [ ] Melhorias de acessibilidade (WCAG 2.1 AA)

### P2 - Média (Próximos 2-3 meses)

#### Backend

- [ ] Histórico de alterações (audit log)
- [ ] Auditoria de ações críticas
- [ ] Backup automático
- [ ] Política de retenção de dados

#### Frontend

- [ ] Drag and drop para remanejamento
- [ ] Histórico de alterações (timeline)
- [ ] Calendário integrado
- [ ] Sincronização com Google Calendar

#### Mobile

- [ ] Setup do projeto React Native
- [ ] Telas de autenticação
- [ ] Dashboard mobile
- [ ] QR Code (geração e leitura)
- [ ] Chat mobile

### P3 - Baixa (Backlog futuro)

#### Expansão

- [ ] Multi-ministério
- [ ] Multi-igreja
- [ ] Upload de documentos
- [ ] Biblioteca de recursos
- [ ] Integração com calendário externo

#### Qualidade

- [ ] Testes E2E completos (Playwright)
- [ ] Testes de performance
- [ ] Monitoramento avançado (Sentry)
- [ ] Métricas de uso (Analytics)
- [ ] Cobertura de testes >80%

---

## 📊 Épicos Detalhados

### EPIC-001: Interface de QR Code (Frontend)

**Objetivo**: Completar interface de leitura de QR Code para check-in

**Tarefas**:

- [ ] Componente de scanner QR (câmera web)
- [ ] Integração com html5-qrcode ou similar
- [ ] Feedback visual de leitura
- [ ] Feedback sonoro de validação
- [ ] Tratamento de erros (QR inválido, expirado, etc.)
- [ ] Alternância entre câmeras
- [ ] Histórico de check-ins realizados

**Critérios de Aceitação**:

- Líder pode escanear QR Code via câmera
- Sistema valida em tempo real
- Feedback claro de sucesso/erro
- Funciona em diferentes navegadores

---

### EPIC-002: Comunicação Segmentada

**Objetivo**: Permitir envio de mensagens para grupos específicos

**Backend**:

- [ ] Modelo de Mensagem Segmentada
- [ ] Service de segmentação (Time, Equipe, Servo)
- [ ] Integração com Firebase Cloud Messaging
- [ ] Agendamento de mensagens
- [ ] Histórico de envios

**Frontend**:

- [ ] Formulário de envio
- [ ] Seleção de destinatários (multi-select)
- [ ] Preview de mensagem
- [ ] Agendamento
- [ ] Histórico de mensagens enviadas

**Critérios de Aceitação**:

- Admin pode enviar para qualquer segmento
- Líder de Time pode enviar para seu time
- Líder de Equipe pode enviar para sua equipe
- Mensagens podem ser agendadas
- Histórico completo de envios

---

### EPIC-003: Relatórios e Analytics

**Objetivo**: Fornecer insights sobre frequência e engajamento

**Backend**:

- [ ] Endpoint de métricas de frequência
- [ ] Endpoint de estatísticas por servo
- [ ] Endpoint de estatísticas por equipe
- [ ] Endpoint de estatísticas por time
- [ ] Geração de PDF
- [ ] Geração de Excel

**Frontend**:

- [ ] Dashboard de analytics
- [ ] Gráficos de frequência (Chart.js)
- [ ] Filtros avançados (período, equipe, servo)
- [ ] Exportação de relatórios
- [ ] Visualizações customizadas

**Critérios de Aceitação**:

- Relatórios em tempo real
- Exportação em múltiplos formatos
- Filtros por período, equipe, servo
- Gráficos interativos
- Performance otimizada

---

## 🔄 Roadmap 2026

### Q1 2026 (Jan-Mar) - Check-in e Comunicação

**Status**: 🚧 Em andamento

**Concluído**:

- ✅ Reorganização completa da documentação
- ✅ Padronização de componentes (ComboBox em todas as páginas)
- ✅ Sistema de QR Code (Backend completo)
- ✅ Auditoria e atualização do backlog

**Em Desenvolvimento**:

- 🚧 Interface de leitura de QR Code (câmera web)
- 🚧 Check-in manual (interface completa)
- 🚧 Feedback visual/sonoro de validação

**Planejado para Q1**:

- 📝 Comunicação segmentada (backend + frontend)
- � Envio de mensagens em massa
- 📝 Notificações push (Firebase setup)
- 📝 Testes E2E do fluxo de check-in

**Meta Q1**: Sistema de check-in completo e funcional em produção

---

### Q2 2026 (Abr-Jun) - Relatórios e Automações

**Foco**: Analytics e automação de processos

**Planejado**:

- 📝 Dashboard de analytics avançado
- 📝 Relatórios de frequência detalhados
- 📝 Exportação em PDF/Excel
- 📝 Gráficos interativos (Chart.js/Recharts)
- 📝 Sorteio automático de equipes
- 📝 Algoritmo de rodízio justo
- 📝 Lembretes automáticos (24h antes da escala)
- 📝 Alertas de baixa frequência
- 📝 Histórico de alterações (audit log)

**Meta Q2**: Sistema de relatórios completo e automações funcionando

---

### Q3 2026 (Jul-Set) - Mobile MVP

**Foco**: Aplicativo mobile para servos e líderes

**Planejado**:

- 📝 Setup React Native + Expo
- 📝 Integração com monorepo
- 📝 Autenticação mobile
- 📝 Dashboard mobile
- 📝 Visualização de escalas
- 📝 Geração de QR Code (nativo)
- 📝 Leitura de QR Code (câmera nativa)
- 📝 Chat mobile
- 📝 Notificações push
- 📝 Modo offline básico
- 📝 Beta testing (TestFlight + Google Play Beta)

**Meta Q3**: App mobile em beta com funcionalidades core

---

### Q4 2026 (Out-Dez) - Expansão e Produção

**Foco**: Escalabilidade e lançamento oficial

**Planejado**:

- 📝 Multi-ministério (expansão além de Boas-Vindas)
- 📝 Multi-igreja (suporte para múltiplas igrejas)
- 📝 Otimizações de performance
- 📝 Testes de carga e stress
- 📝 Monitoramento avançado (Sentry)
- 📝 Analytics de uso
- 📝 Documentação de usuário final
- 📝 Treinamento de líderes
- 📝 Deploy em produção (web + mobile)
- 📝 Lançamento oficial

**Meta Q4**: Sistema em produção com múltiplos ministérios usando

---

### Milestones Críticos 2026

| Mês     | Milestone             | Descrição                          |
| ------- | --------------------- | ---------------------------------- |
| **Jan** | ✅ Docs reorganizadas | Documentação profissional completa |
| **Fev** | � Check-in QR Code    | Interface de leitura funcionando   |
| **Mar** | �📝 Comunicação       | Sistema de mensagens em massa      |
| **Abr** | 📝 Relatórios         | Dashboard de analytics             |
| **Mai** | 📝 Automações         | Sorteio e lembretes automáticos    |
| **Jun** | 📝 Testes E2E         | Cobertura de testes >80%           |
| **Jul** | 📝 Mobile Setup       | App mobile configurado             |
| **Ago** | 📝 Mobile Beta        | Beta testing iniciado              |
| **Set** | 📝 Mobile Release     | App em lojas (beta)                |
| **Out** | 📝 Multi-ministério   | Expansão para outros ministérios   |
| **Nov** | 📝 Performance        | Otimizações e testes de carga      |
| **Dez** | 📝 Produção           | Lançamento oficial                 |

---

### Dependências e Riscos

**Dependências**:

- Firebase setup para notificações push
- Aprovação nas lojas (Apple/Google) para mobile
- Infraestrutura de produção (servidor, banco de dados)
- Treinamento de usuários

**Riscos Identificados**:

- ⚠️ Complexidade do sorteio automático (algoritmo justo)
- ⚠️ Aprovação na App Store (pode demorar)
- ⚠️ Performance com múltiplas igrejas (escala)
- ⚠️ Adoção pelos usuários (treinamento necessário)

**Mitigações**:

- Prototipagem e testes do algoritmo de sorteio
- Iniciar processo de aprovação cedo (Q3)
- Testes de carga desde Q2
- Programa de treinamento desde Q1

---

## 📝 Notas Técnicas

### Hierarquia de Usuários

1. **Admin/Pastor**
   - Acesso total ao sistema
   - Gerencia todos os níveis
   - Visualiza todos os relatórios
   - Pode atribuir papéis

2. **Coordenador/Líder de Time**
   - Gerencia seu time/ministério
   - Visualiza equipes e servos do time
   - Cria e gerencia equipes
   - Visualiza relatórios do time
   - Não pode ler QR Code (apenas líder de equipe)

3. **Líder de Equipe**
   - Gerencia sua equipe específica
   - **Pode ler QR Code dos servos**
   - Faz check-in dos servos
   - Visualiza relatórios da equipe

4. **Servo/Membro**
   - Visualiza suas informações
   - Visualiza suas escalas
   - **Gera QR Code para check-in**
   - Recebe notificações
   - Não pode fazer check-in próprio

### Fluxo de Check-in com QR Code

1. Servo gera QR Code único via app
2. QR Code é válido por período configurável
3. No culto, apresenta QR Code ao líder
4. Líder escaneia QR Code via câmera
5. Sistema valida em tempo real:
   - QR Code válido e não expirado?
   - Servo pertence à equipe do líder?
   - Servo está na escala do dia?
   - Check-in já foi feito?
6. Se válido, registra check-in automaticamente
7. Confirmação visual e sonora
8. Registro salvo no banco de dados

---

## 📊 Métricas de Sucesso

### KPIs Principais

- Taxa de adoção do sistema (>80% dos servos)
- Taxa de check-in via QR Code (>70%)
- Tempo médio de check-in (<30 segundos)
- Satisfação dos usuários (>4.5/5)
- Uptime do sistema (>99.5%)

### Métricas de Qualidade

- Cobertura de testes (>80%)
- Performance (LCP <2.5s, FID <100ms)
- Acessibilidade (WCAG 2.1 AA)
- Zero erros críticos em produção
- Tempo de resposta API (<200ms p95)

---

## 🔗 Documentação Relacionada

- [Backend Standards](./backend/BACKEND_STANDARDS.md)
- [Design System](./frontend/DESIGN_SYSTEM.md)
- [API Endpoints](./backend/API_ENDPOINTS.md)
- [Database Schema](./architecture/DATABASE_SCHEMA.md)
- [Mobile Strategy](./mobile/MOBILE_STRATEGY.md)
- [Vercel Deployment](./devops/VERCEL_DEPLOYMENT.md)

---

## 📞 Contato

Para dúvidas sobre o backlog ou sugestões de priorização:

- **Issues**: GitHub Issues
- **Discussões**: GitHub Discussions
- **Revisão**: Semanal (sextas-feiras)

---

**Legenda**:

- ✅ Concluído
- 🚧 Em desenvolvimento
- 📝 Planejado
- ⏸️ Pausado
- ❌ Cancelado
