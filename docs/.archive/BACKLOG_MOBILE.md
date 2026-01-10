# Backlog de Desenvolvimento - Mobile (React Native)

## 📋 Visão Geral

Este documento organiza todas as funcionalidades a serem implementadas no **Aplicativo Mobile** do sistema MINC Teams, seguindo a arquitetura definida e priorizando o desenvolvimento incremental.

---

## 🎯 Fase 3: Aplicativo Mobile

### EPIC-019: Setup do App Mobile

- [ ] Configuração do projeto React Native
- [ ] Integração com monorepo
- [ ] Navegação (React Navigation)
- [ ] Autenticação mobile (context)
- [ ] Design system mobile (componentes base)
- [ ] Configuração de build (Android/iOS)
- [ ] Configuração de ambiente

### EPIC-020: Funcionalidades Mobile - Autenticação

- [ ] Tela de login
- [ ] Tela de recuperação de senha
- [ ] Integração com backend
- [ ] Armazenamento seguro de tokens (Keychain/Keystore)
- [ ] Refresh token automático

### EPIC-020: Funcionalidades Mobile - Dashboard

- [ ] Dashboard mobile (home)
- [ ] Cards de informações rápidas
- [ ] Navegação principal
- [ ] Notificações push

### EPIC-020: Funcionalidades Mobile - Escalas

- [ ] Visualização de escalas do servo
- [ ] Calendário de escalas
- [ ] Detalhes da escala
- [ ] Notificações de escala

### EPIC-020: Funcionalidades Mobile - QR Code (Servo)

- [ ] Tela de geração de QR Code
- [ ] Componente de exibição de QR Code
- [ ] Atualização de QR Code
- [ ] Contador de expiração
- [ ] Compartilhamento de QR Code

### EPIC-020: Funcionalidades Mobile - QR Code (Líder)

- [ ] Tela de leitura de QR Code
- [ ] Integração com câmera nativa
- [ ] Scanner de QR Code (react-native-camera)
- [ ] Feedback visual e sonoro
- [ ] Confirmação de check-in
- [ ] Lista de check-ins realizados

### EPIC-020: Funcionalidades Mobile - Check-in Manual

- [ ] Tela de check-in manual
- [ ] Lista de servos da equipe
- [ ] Marcação de presença
- [ ] Justificativa de ausência
- [ ] Sincronização offline

### EPIC-020: Funcionalidades Mobile - Notificações

- [ ] Configuração de Firebase Cloud Messaging
- [ ] Recebimento de notificações push
- [ ] Tratamento de notificações
- [ ] Badge de notificações
- [ ] Histórico de notificações

### EPIC-020: Funcionalidades Mobile - Modo Offline

- [ ] Armazenamento local (AsyncStorage/SQLite)
- [ ] Sincronização de dados
- [ ] Queue de ações offline
- [ ] Sincronização quando online
- [ ] Indicador de status de conexão

### EPIC-020: Funcionalidades Mobile - Perfil

- [ ] Tela de perfil do usuário
- [ ] Edição de informações
- [ ] Configurações do app
- [ ] Logout

### EPIC-022: Testes Automatizados (Mobile)

- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes E2E (Detox)
- [ ] Testes em dispositivos reais
- [ ] Cobertura mínima de 80%

---

## 🎯 Priorização

### Prioridade Alta (P0)

1. EPIC-019: Setup do App Mobile
2. EPIC-020: Funcionalidades Mobile - Autenticação

### Prioridade Média (P1)

1. EPIC-020: Funcionalidades Mobile - Dashboard
2. EPIC-020: Funcionalidades Mobile - Escalas
3. EPIC-020: Funcionalidades Mobile - QR Code (Servo)
4. EPIC-020: Funcionalidades Mobile - QR Code (Líder)

### Prioridade Baixa (P2)

1. EPIC-020: Funcionalidades Mobile - Check-in Manual
2. EPIC-020: Funcionalidades Mobile - Notificações
3. EPIC-020: Funcionalidades Mobile - Modo Offline
4. EPIC-020: Funcionalidades Mobile - Perfil

---

## 📅 Roadmap Sugerido

### Q3 2024

- 📝 Setup do App Mobile (EPIC-019)
- 📝 Autenticação Mobile (EPIC-020)

### Q4 2024

- 📝 Funcionalidades Mobile principais (EPIC-020)
- 📝 QR Code Mobile (EPIC-020)
- 📝 Modo Offline (EPIC-020)
- 📝 Testes (EPIC-022)

---

## 📝 Notas Importantes

### Hierarquia de Usuários

1. **PASTORr** - Acesso total ao sistema
2. **Líder de Time/Ministério** - Gerencia o time/ministério
3. **Líder de Equipe** - Gerencia a equipe, pode ler QR Code
4. **Servo** - Gera QR Code, não faz check-in próprio

### Fluxo de Check-in com QR Code (Mobile)

1. Servo acessa app mobile e gera QR Code único
2. No dia do culto, servo apresenta QR Code
3. Líder abre app mobile e acessa tela de leitura
4. Líder escaneia QR Code via câmera nativa
5. Sistema valida e registra check-in
6. Feedback visual e sonoro de confirmação

### Requisitos de Usuário

- **Servo só acessa se tiver usuário vinculado**
- Validação no app antes de permitir acesso
- Armazenamento seguro de credenciais

### Funcionalidades Mobile Específicas

- **Câmera nativa**: Melhor experiência para leitura de QR Code
- **Modo offline**: Funcionalidade crítica para check-in
- **Notificações push**: Alertas importantes
- **Performance**: App deve ser rápido e responsivo

---

## 🔄 Atualizações

- **Última atualização**: 2024-01-XX
- **Versão**: 1.0.0
- **Próxima revisão**: Semanal
