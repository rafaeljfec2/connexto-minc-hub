# Backlog de Desenvolvimento - Web (React + Vite + TypeScript)

## 📋 Visão Geral

Este documento organiza todas as funcionalidades a serem implementadas no **Frontend Web** do sistema MINC Teams, seguindo a arquitetura definida e priorizando o desenvolvimento incremental.

---

## ✅ Concluído

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

## 🎯 Fase 1: MVP Funcional

### EPIC-002: Sistema de Autenticação (Web)

- [ ] Integração com endpoint de login
- [ ] Integração com endpoint de refresh token
- [ ] Integração com endpoint de logout
- [ ] Tela de recuperação de senha
- [ ] Tela de alteração de senha
- [ ] Context de autenticação atualizado
- [ ] Interceptors para refresh token
- [ ] Tratamento de erros de autenticação

### EPIC-003: Sistema de Usuários e Papéis (Web)

- [ ] Página de gestão de usuários (`/users`)
- [ ] Listagem de usuários
- [ ] Formulário de criação de usuário
- [ ] Formulário de edição de usuário
- [ ] Vinculação Usuário ↔ Servo
- [ ] Gestão de papéis (select de papéis)
- [ ] Validação: Servo só acessa se tiver usuário vinculado
- [ ] Bloqueio de acesso para servos sem usuário

### EPIC-004: Sorteio Automático de Equipes (Web)

- [ ] Interface para executar sorteio mensal
- [ ] Configuração de regras de sorteio
- [ ] Visualização de histórico de sorteios
- [ ] Confirmação de sorteio
- [ ] Feedback visual do processo

### EPIC-005: Remanejamento Manual (Web)

- [ ] Interface para remanejamento (`/schedules/:id/reassign`)
- [ ] Drag and drop de servos entre equipes
- [ ] Histórico de alterações (modal/timeline)
- [ ] Confirmação de remanejamento
- [ ] Notificação de alterações

### EPIC-006: Controle de Frequência (Web)

- [ ] Página de lista de presença (`/schedules/:id/attendance`)
- [ ] Registro de presença (checkboxes)
- [ ] Visualização de frequência por servo
- [ ] Relatório de frequência (gráficos)
- [ ] Dashboard de frequência

### EPIC-007: Comunicação Segmentada (Web)

- [ ] Página de comunicação (`/communication`)
- [ ] Formulário de envio de mensagem
- [ ] Seleção de segmento (Time, Equipe, Servo)
- [ ] Histórico de mensagens enviadas
- [ ] Preview de mensagem
- [ ] Agendamento de mensagens

### EPIC-008: Dashboard de Indicadores (Web)

- [ ] Página de dashboard (`/dashboard`)
- [ ] Gráficos de frequência (Chart.js/Recharts)
- [ ] Estatísticas de equipes
- [ ] Cards de métricas
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Filtros de período

### EPIC-009: Refinamentos de Interface (Web)

- [ ] Página de Perfil do Usuário (`/profile`)
- [ ] Página de Configurações (`/settings`)
- [ ] Melhorias de acessibilidade
- [ ] Otimizações de performance (lazy loading)
- [ ] Testes E2E (Playwright/Cypress)

### EPIC-011: Sistema de Hierarquia (Web)

- [ ] Interface de gestão de hierarquia
- [ ] Visualização de níveis hierárquicos
- [ ] Atribuição de papéis por interface
- [ ] Validação de permissões na UI

---

## 🎯 Fase 2: QR Code, Relatórios e Automações

### EPIC-010: Pesquisa e Análise de QR Code (Web)

- [ ] Pesquisa de bibliotecas para web
- [ ] Protótipo de geração de QR Code
- [ ] Protótipo de leitura de QR Code (câmera)
- [ ] Testes de compatibilidade de navegadores

### EPIC-012: Geração de QR Code (Web)

- [ ] Tela de geração de QR Code (`/servos/:id/qr-code`)
- [ ] Componente de exibição de QR Code
- [ ] Botão de atualizar QR Code
- [ ] Contador de expiração
- [ ] Histórico de QR Codes gerados

### EPIC-013: Leitura de QR Code (Web)

- [ ] Tela de leitura de QR Code (`/check-ins/scan`)
- [ ] Integração com câmera do navegador
- [ ] Scanner de QR Code (biblioteca)
- [ ] Feedback visual de leitura
- [ ] Confirmação de check-in
- [ ] Tratamento de erros (QR Code inválido, expirado, etc.)
- [ ] Alternância entre câmeras

### EPIC-014: Check-in Manual (Web)

- [ ] Tela de check-in manual (`/check-ins/manual`)
- [ ] Lista de servos da equipe
- [ ] Checkboxes de presença
- [ ] Campo de justificativa de ausência
- [ ] Confirmação de check-in

### EPIC-015: Relatórios Detalhados (Web)

- [ ] Página de relatórios (`/reports`)
- [ ] Filtros avançados
- [ ] Visualização de relatórios
- [ ] Botão de exportação (PDF/Excel)
- [ ] Gráficos e visualizações

### EPIC-016: Automações e Notificações (Web)

- [ ] Configuração de preferências de notificação
- [ ] Lista de notificações recebidas
- [ ] Badge de notificações não lidas
- [ ] Integração com Web Push API

---

## 🎯 Fase 3: Expansão e Melhorias

### EPIC-017: Multi-ministério (Web)

- [ ] Seletor de ministério (header)
- [ ] Isolamento de dados por ministério
- [ ] Gestão centralizada
- [ ] Relatórios consolidados

### EPIC-018: Funcionalidades Avançadas (Web)

- [ ] Calendário integrado
- [ ] Sincronização com Google Calendar
- [ ] Chat interno
- [ ] Upload de documentos
- [ ] Biblioteca de recursos

### EPIC-022: Testes Automatizados (Web)

- [ ] Testes unitários (componentes)
- [ ] Testes de integração (páginas)
- [ ] Testes E2E (fluxos completos)
- [ ] Testes de acessibilidade
- [ ] Cobertura mínima de 80%

---

## 🎯 Priorização

### Prioridade Alta (P0)

1. EPIC-002: Sistema de Autenticação (Web)
2. EPIC-003: Sistema de Usuários e Papéis (Web)
3. Integração Frontend-Backend

### Prioridade Média (P1)

1. EPIC-004: Sorteio Automático de Equipes (Web)
2. EPIC-006: Controle de Frequência (Web)
3. EPIC-005: Remanejamento Manual (Web)
4. EPIC-008: Dashboard de Indicadores (Web)

### Prioridade Baixa (P2)

1. EPIC-007: Comunicação Segmentada (Web)
2. EPIC-012: Geração de QR Code (Web)
3. EPIC-013: Leitura de QR Code (Web)
4. EPIC-015: Relatórios Detalhados (Web)
5. EPIC-016: Automações e Notificações (Web)

---

## 📅 Roadmap Sugerido

### Q1 2024
- ✅ Estrutura base e frontend MVP
- 🚧 Autenticação (EPIC-002)
- 🚧 Integração com backend

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
- 📝 Funcionalidades avançadas (EPIC-018)
- 📝 Melhorias e refinamentos

---

## 📝 Notas Importantes

### Hierarquia de Usuários

1. **Pastor** - Acesso total ao sistema
2. **Líder de Time/Ministério** - Gerencia o time/ministério
3. **Líder de Equipe** - Gerencia a equipe, pode ler QR Code
4. **Servo** - Gera QR Code, não faz check-in próprio

### Fluxo de Check-in com QR Code (Web)

1. Servo acessa web e gera QR Code único
2. No dia do culto, servo apresenta QR Code
3. Líder acessa web e abre tela de leitura
4. Líder escaneia QR Code via câmera do navegador
5. Sistema valida e registra check-in
6. Confirmação visual é exibida

### Requisitos de Usuário

- **Servo só acessa se tiver usuário vinculado**
- Bloqueio de acesso para servos sem usuário
- Validação na UI antes de permitir acesso

---

## 🔄 Atualizações

- **Última atualização**: 2024-01-XX
- **Versão**: 1.0.0
- **Próxima revisão**: Semanal
