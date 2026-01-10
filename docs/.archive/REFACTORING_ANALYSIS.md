# Análise de Refatoração - App Web

## 🔍 Pontos Identificados para Refatoração

### 1. ⚠️ CRÍTICO - Duplicação de PlusIcon

**Problema**: Função `PlusIcon` duplicada em 6 arquivos diferentes

- `ChurchesPage.tsx`
- `MinistriesPage.tsx`
- `TeamsPage.tsx`
- `ServicesPage.tsx`
- `SchedulesPage.tsx`
- `PeoplePage.tsx`

**Solução**: Mover para `components/icons/index.tsx`

---

### 2. ⚠️ CRÍTICO - Rotas Duplicadas no App.tsx

**Problema**: Padrão repetitivo de `MOCK_MODE` em todas as rotas

- Código duplicado ~200 linhas
- Difícil manutenção
- Propenso a erros

**Solução**: Criar componente `ProtectedRouteWrapper` ou helper function

---

### 3. ⚠️ ALTO - Lógica de Modal/Formulário Duplicada

**Problema**: Padrão repetido em todas as páginas CRUD:

- `handleOpenModal` - similar em todas
- `handleCloseModal` - similar em todas
- `handleSubmit` - similar em todas
- `handleDeleteClick` - similar em todas
- `handleDeleteConfirm` - similar em todas

**Solução**: Criar hook `useCrudForm` que encapsula toda essa lógica

---

### 4. ⚠️ MÉDIO - Mock Data Duplicado

**Problema**: Dados mock aparecem em múltiplos arquivos

- `MOCK_MINISTRIES` em PeoplePage e TeamsPage
- `MOCK_TEAMS` em PeoplePage e TeamsPage
- `MOCK_PEOPLE` em TeamsPage

**Solução**: Centralizar em `lib/mockData.ts` ou `services/mockData.ts`

---

### 5. ⚠️ MÉDIO - Filtro de Busca Duplicado

**Problema**: Lógica de `filteredItems` com `useMemo` repetida

- Padrão similar em todas as páginas
- Pode ser extraído para hook

**Solução**: Melhorar `useSearch` ou criar `useFilteredItems`

---

### 6. ⚠️ BAIXO - Componente PageWithCrud Não Utilizado

**Problema**: Componente existe mas não está sendo usado

- Todas as páginas usam `CrudPageLayout` agora
- `PageWithCrud` pode ser removido ou atualizado

**Solução**: Remover ou atualizar para usar novos componentes

---

### 7. ⚠️ BAIXO - Constante MOCK_MODE Duplicada

**Problema**: `MOCK_MODE` definida em múltiplos lugares

- `App.tsx` (2x)
- `ProtectedRoute`

**Solução**: Centralizar em `lib/constants.ts` ou hook `useMockMode`

---

### 8. ⚠️ BAIXO - Funções Helper Duplicadas

**Problema**: Funções como `getChurchName`, `getMinistryName`, `getTeamName` duplicadas

- Aparecem em múltiplas páginas
- Lógica similar

**Solução**: Criar helpers em `lib/helpers.ts` ou hooks específicos

---

## 📋 Plano de Refatoração

### Fase 1: Componentes e Icons

1. ✅ Mover `PlusIcon` para `components/icons`
2. ✅ Atualizar todas as importações

### Fase 2: Hooks Customizados

1. ✅ Criar `useCrudForm` hook
2. ✅ Criar `useMockMode` hook
3. ✅ Melhorar `useSearch` para incluir filtros customizados

### Fase 3: Centralização de Dados

1. ✅ Centralizar mock data
2. ✅ Centralizar constantes

### Fase 4: Rotas e Layout

1. ✅ Refatorar `App.tsx` para reduzir duplicação
2. ✅ Criar helper para rotas protegidas

### Fase 5: Limpeza

1. ✅ Remover `PageWithCrud` se não usado
2. ✅ Remover código morto
3. ✅ Atualizar imports

---

## 🎯 Priorização

### Prioridade Alta

1. PlusIcon duplicado
2. Rotas duplicadas no App.tsx
3. Lógica de modal/formulário duplicada

### Prioridade Média

4. Mock data duplicado
5. Filtro de busca duplicado

### Prioridade Baixa

6. PageWithCrud não utilizado
7. Constante MOCK_MODE duplicada
8. Funções helper duplicadas
