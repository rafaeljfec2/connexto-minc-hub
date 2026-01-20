# Integração React Query com Chat WebSocket

## 📋 Visão Geral

O sistema de chat agora utiliza **React Query** para gerenciamento de estado e cache, mantendo a funcionalidade de **atualização em tempo real via WebSocket**.

## 🔧 Como Funciona

### 1. Hooks React Query

#### `useConversationsQuery`

Gerencia a lista de conversas do usuário.

```typescript
const {
  conversations,
  isLoading,
  refetch,
  updateConversationInCache,
  addConversationToCache,
  sortConversationsByLastUpdate,
} = useConversationsQuery()
```

**Funções de Cache:**

- `updateConversationInCache(id, updater)` - Atualiza uma conversa específica
- `addConversationToCache(conversation)` - Adiciona nova conversa
- `sortConversationsByLastUpdate()` - Reordena por última atualização

#### `useMessagesQuery`

Gerencia as mensagens de uma conversa específica.

```typescript
const {
  messages,
  isLoading,
  refetch,
  addMessageToCache,
  updateMessageInCache,
  markMessagesAsReadInCache,
} = useMessagesQuery(conversationId)
```

**Funções de Cache:**

- `addMessageToCache(message)` - Adiciona nova mensagem (chamado pelo WebSocket)
- `updateMessageInCache(id, updater)` - Atualiza mensagem (edição/deleção)
- `markMessagesAsReadInCache(ids?)` - Marca mensagens como lidas

### 2. Integração com WebSocket

O `ChatContext` utiliza o React Query para armazenar dados, mas o **WebSocket continua funcionando normalmente** para atualizações em tempo real.

#### Fluxo de Atualização:

```
WebSocket Event → Chat Event Handler → queryClient.setQueryData() → UI Atualizada
```

**Eventos WebSocket Tratados:**

- `new-message` - Nova mensagem recebida
- `conversation-updated` - Conversa atualizada
- `message-read` - Mensagem marcada como lida
- `message:edited` - Mensagem editada
- `message:deleted` - Mensagem deletada

#### Exemplo de Integração:

```typescript
// Em useChatEventHandlers.ts
const handleNewMessage = (message: Message) => {
  // Atualiza o cache do React Query via setMessages
  setMessages(prev => [...prev, message])

  // O setMessages agora usa queryClient.setQueryData internamente
}
```

### 3. ChatContext Modificado

O `ChatContext` agora:

1. **Usa React Query** para buscar e cachear dados
2. **Mantém WebSocket** para atualizações em tempo real
3. **Sincroniza** WebSocket com cache do React Query via `setMessages` e `setConversations`

```typescript
// Setters atualizados para usar React Query
const setMessages = useCallback(
  updater => {
    queryClient.setQueryData(['messages', selectedChurch?.id, conversationId], old =>
      typeof updater === 'function' ? updater(old) : updater
    )
  },
  [queryClient, selectedChurch?.id]
)
```

## ✅ Benefícios

### 1. **Cache Inteligente**

- Conversas e mensagens são cacheadas
- Reduz chamadas à API
- Navegação mais rápida entre conversas

### 2. **WebSocket em Tempo Real**

- Mensagens chegam instantaneamente
- Indicadores de "lido" em tempo real
- Notificações de edição/deleção

### 3. **Sincronização Automática**

- WebSocket atualiza o cache do React Query
- UI sempre sincronizada
- Sem duplicação de requisições

### 4. **Performance**

- Apenas conversas ativas buscam mensagens
- Cache compartilhado entre componentes
- Invalidação inteligente

## 🎯 Query Keys

```typescript
// Conversas
;['conversations', churchId, userId][
  // Mensagens de uma conversa
  ('messages', churchId, conversationId)
]
```

## 📊 Estado de Carregamento

```typescript
const { conversations, isLoading } = useConversationsQuery()
// isLoading: true quando buscando conversas

const { messages, isLoading } = useMessagesQuery(conversationId)
// isLoading: true quando buscando mensagens
```

## 🔄 Fluxo Completo de Mensagem

### Envio de Mensagem:

1. Usuário digita e envia mensagem
2. `sendMessage()` envia via WebSocket
3. Optimistic update adiciona mensagem temporária no cache
4. Servidor processa e retorna mensagem confirmada
5. WebSocket emite evento `new-message`
6. Event handler atualiza cache do React Query
7. Mensagem temporária é substituída pela real
8. UI atualizada automaticamente

### Recebimento de Mensagem:

1. WebSocket recebe evento `new-message`
2. Event handler chama `setMessages()`
3. `setMessages()` atualiza cache via `queryClient.setQueryData()`
4. React Query notifica componentes
5. UI renderiza nova mensagem
6. Se conversa está ativa, marca como lida automaticamente

## 🚀 Como Testar

1. Abra duas abas do navegador
2. Faça login com usuários diferentes
3. Inicie uma conversa
4. Envie mensagens de ambos os lados
5. Observe atualização em tempo real

## ⚠️ Considerações Importantes

### 1. **Não Remova WebSocket**

O WebSocket é essencial para atualizações em tempo real. O React Query apenas gerencia o cache, não substitui a comunicação em tempo real.

### 2. **Cache Invalidation**

O cache é atualizado automaticamente via WebSocket. Não é necessário invalidar manualmente, exceto em casos especiais.

### 3. **Query Keys Únicos**

Sempre incluir `churchId` nas query keys para evitar conflitos entre igrejas diferentes.

### 4. **Optimistic Updates**

Mensagens temporárias são substituídas quando a resposta do servidor chega via WebSocket.

## 📝 Logs de Debug

Para debug, você pode verificar:

```typescript
// No Chrome DevTools
window.__REACT_QUERY_DEVTOOLS__

// Ou usar o React Query DevTools (já integrado)
// Canto inferior direito da tela
```

## 🔮 Próximas Melhorias

- [ ] Implementar `useMutation` para operações de chat
- [ ] Adicionar retry logic específico para chat
- [ ] Implementar prefetching de conversas recentes
- [ ] Cache persistence (localStorage)

---

**Última Atualização**: Janeiro 2026
**Status**: ✅ Implementado e Funcionando
