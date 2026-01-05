# Implementação Mobile no Padrão da Web

Este documento descreve como as screens mobile serão implementadas seguindo o mesmo padrão funcional da versão web.

## 📋 Padrão Identificado da Web

### 1. DashboardPage
- **Estrutura**: Grid de cards com estatísticas
- **Componentes**: Cards com título e valor
- **Funcionalidades**: 
  - Total de Servos
  - Equipes Ativas
  - Próximo Culto
  - Presença (Mês)
  - Atividades Recentes
  - Próximas Escalas

### 2. Páginas CRUD (People, Teams, Schedules)
- **Estrutura**: CrudPageLayout + CrudFilters + CrudView
- **Componentes**:
  - PageHeader (título, descrição, ícone, botão criar)
  - CrudFilters (busca + filtros)
  - CrudView (grid cards ou list table)
  - Cards específicos (ServoCard, TeamCard, ScheduleCard)
- **Funcionalidades**:
  - Listar itens (grid ou list)
  - Buscar
  - Filtrar
  - Criar (modal)
  - Editar (modal)
  - Deletar (confirm dialog)
  - useCrud hook para gerenciar estado

### 3. ProfilePage
- **Estrutura**: PageHeader + Cards com formulários
- **Componentes**:
  - PageHeader (título, descrição)
  - Card com formulário de informações pessoais
  - Card com formulário de alterar senha
  - Botão logout
- **Funcionalidades**:
  - Exibir informações do usuário
  - Editar informações
  - Alterar senha (futuro)
  - Logout

## 📱 Adaptação para Mobile

### Mobile-First Design
- **Listagens**: FlatList com cards (não usa table)
- **Busca**: SearchBar no topo (Input com ícone)
- **Filtros**: Select/Picker (dropdown nativo)
- **Modals**: Bottom sheet ou Modal nativo
- **Formulários**: ScrollView com Inputs
- **Navegação**: Stack Navigator + Bottom Tab Navigator

### Componentes Mobile Equivalentes

| Web | Mobile |
|-----|--------|
| `CrudPageLayout` | Screen com ScrollView/FlatList |
| `PageHeader` | View com Text (título) + Text (descrição) |
| `CrudFilters` | View com Input (busca) + Picker (filtros) |
| `CrudView` | FlatList com cards |
| `ServoCard` | Card component (React Native) |
| `TeamCard` | Card component (React Native) |
| `ScheduleCard` | Card component (React Native) |
| `Modal` | Modal (React Native) |
| `ConfirmDialog` | Alert ou Modal customizado |

## 🎯 Estrutura de Implementação

### PeopleScreen
```typescript
// Estrutura similar a PeoplePage
- useState para dados
- useMemo para filtros
- FlatList com ServoCard
- SearchBar
- Filtros (Ministry, Team)
- Modal para criar/editar
- ConfirmDialog para deletar
```

### TeamsScreen
```typescript
// Estrutura similar a TeamsPage
- useState para dados
- useMemo para filtros
- FlatList com TeamCard
- SearchBar
- Modal para criar/editar
- ConfirmDialog para deletar
```

### SchedulesScreen
```typescript
// Estrutura similar a SchedulesPage
- useState para dados
- useMemo para filtros
- FlatList com ScheduleCard
- SearchBar
- Modal para criar/editar
- ConfirmDialog para deletar
```

### ProfileScreen
```typescript
// Estrutura similar a ProfilePage
- useState para formData
- ScrollView com Cards
- Input components
- Button logout
```

### DashboardScreen
```typescript
// Estrutura similar a DashboardPage
- Grid de cards com estatísticas (2 colunas no mobile)
- Cards de atividades recentes
- Cards de próximas escalas
```

## 📝 Notas de Implementação

1. **Dados**: Usar os mesmos mock data da web (`@minc-hub/shared` ou criar versão mobile)
2. **Services**: Usar os services compartilhados (`peopleService`, `teamsService`, etc.)
3. **Types**: Usar types compartilhados (`@minc-hub/shared/types`)
4. **Design System**: Usar theme compartilhado (já implementado)
5. **Hooks**: Criar hooks similares se necessário (useCrud para mobile?)

## ✅ Checklist de Implementação

- [ ] DashboardScreen (estatísticas)
- [ ] PeopleScreen (FlatList + ServoCard + Search + Filters)
- [ ] TeamsScreen (FlatList + TeamCard + Search)
- [ ] SchedulesScreen (FlatList + ScheduleCard + Search)
- [ ] ProfileScreen (ScrollView + Form + Logout)
- [ ] Componentes de Card (ServoCard, TeamCard, ScheduleCard)
- [ ] SearchBar component
- [ ] Modal component (se necessário)
- [ ] ConfirmDialog component (se necessário)
