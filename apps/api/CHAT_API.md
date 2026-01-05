# Chat API - Especificação de Endpoints e WebSocket

## Visão Geral

Este documento especifica os endpoints REST e eventos WebSocket necessários para implementar o sistema de chat no backend, baseado na implementação realizada no aplicativo mobile.

**Arquitetura:**

- **REST API**: Para operações CRUD, listagem e histórico
- **WebSocket**: Para comunicação em tempo real (obrigatório)
  - Novas mensagens
  - Status de leitura
  - Indicador de digitação
  - Status online/offline
  - Atualizações de conversa

## Modelos de Dados

### Message

```typescript
interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string; // ISO 8601 format
  read: boolean;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Conversation

```typescript
interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### ChatUser (Simplificado para Chat)

```typescript
interface ChatUser {
  id: string;
  name: string;
  avatar: string | null;
  isOnline: boolean;
}
```

## Endpoints

### 1. Listar Conversas

**GET** `/api/chat/conversations`

Retorna a lista de conversas do usuário autenticado, ordenadas pela última mensagem.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "data": [
    {
      "id": "conv-1",
      "participants": [
        {
          "id": "user-2",
          "name": "Ana Silva",
          "avatar": "https://example.com/avatar.jpg",
          "isOnline": true
        }
      ],
      "lastMessage": {
        "id": "msg-1",
        "text": "Precisamos alinhar a escala de domingo.",
        "senderId": "user-2",
        "timestamp": "2024-03-10T10:32:00Z",
        "read": false
      },
      "unreadCount": 1,
      "createdAt": "2024-03-01T10:00:00Z",
      "updatedAt": "2024-03-10T10:32:00Z"
    }
  ]
}
```

**Query Parameters:**

- `limit` (opcional): Número máximo de conversas (padrão: 50)
- `offset` (opcional): Offset para paginação (padrão: 0)

---

### 2. Obter Mensagens de uma Conversa

**GET** `/api/chat/conversations/:conversationId/messages`

Retorna as mensagens de uma conversa específica, ordenadas por timestamp (mais antigas primeiro).

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "data": [
    {
      "id": "msg-1",
      "text": "Olá Rafael, tudo bem?",
      "senderId": "user-2",
      "timestamp": "2024-03-10T10:30:00Z",
      "read": true,
      "conversationId": "conv-1",
      "createdAt": "2024-03-10T10:30:00Z",
      "updatedAt": "2024-03-10T10:30:00Z"
    },
    {
      "id": "msg-2",
      "text": "Oi Ana! Tudo ótimo e com você?",
      "senderId": "user-1",
      "timestamp": "2024-03-10T10:31:00Z",
      "read": true,
      "conversationId": "conv-1",
      "createdAt": "2024-03-10T10:31:00Z",
      "updatedAt": "2024-03-10T10:31:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 50,
    "offset": 0
  }
}
```

**Query Parameters:**

- `limit` (opcional): Número máximo de mensagens (padrão: 50)
- `offset` (opcional): Offset para paginação (padrão: 0)
- `before` (opcional): Timestamp ISO para carregar mensagens anteriores (para scroll infinito)

---

### 3. Enviar Mensagem

**POST** `/api/chat/conversations/:conversationId/messages`

Cria uma nova mensagem em uma conversa.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "text": "Olá, como posso ajudar?"
}
```

**Response 201:**

```json
{
  "data": {
    "id": "msg-3",
    "text": "Olá, como posso ajudar?",
    "senderId": "user-1",
    "timestamp": "2024-03-10T10:35:00Z",
    "read": false,
    "conversationId": "conv-1",
    "createdAt": "2024-03-10T10:35:00Z",
    "updatedAt": "2024-03-10T10:35:00Z"
  }
}
```

**Validação:**

- `text`: obrigatório, string não vazia, máximo 5000 caracteres
- `conversationId`: deve existir e o usuário deve ser participante

**Erros:**

- `400`: Texto vazio ou muito longo
- `403`: Usuário não é participante da conversa
- `404`: Conversa não encontrada

---

### 4. Criar ou Obter Conversa

**POST** `/api/chat/conversations`

Cria uma nova conversa entre o usuário autenticado e outro usuário, ou retorna a conversa existente.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "participantId": "user-2"
}
```

**Response 200 (conversa existente) ou 201 (nova conversa):**

```json
{
  "data": {
    "id": "conv-1",
    "participants": [
      {
        "id": "user-1",
        "name": "Rafael",
        "avatar": "https://example.com/avatar1.jpg",
        "isOnline": true
      },
      {
        "id": "user-2",
        "name": "Ana Silva",
        "avatar": "https://example.com/avatar2.jpg",
        "isOnline": true
      }
    ],
    "lastMessage": null,
    "unreadCount": 0,
    "createdAt": "2024-03-10T10:00:00Z",
    "updatedAt": "2024-03-10T10:00:00Z"
  }
}
```

**Validação:**

- `participantId`: obrigatório, deve ser um ID de usuário válido e diferente do usuário autenticado

**Erros:**

- `400`: participantId inválido ou igual ao usuário autenticado
- `404`: Usuário participante não encontrado

---

### 5. Marcar Mensagens como Lidas

**PUT** `/api/chat/conversations/:conversationId/messages/read`

Marca todas as mensagens não lidas de uma conversa como lidas.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "data": {
    "updatedCount": 3
  }
}
```

**Erros:**

- `403`: Usuário não é participante da conversa
- `404`: Conversa não encontrada

---

### 6. Obter Status Online de Usuários

**GET** `/api/chat/users/:userId/status`

Retorna o status online de um usuário específico.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "data": {
    "userId": "user-2",
    "isOnline": true,
    "lastSeen": "2024-03-10T10:35:00Z"
  }
}
```

---

### 7. Obter Contagem de Mensagens Não Lidas

**GET** `/api/chat/conversations/unread-count`

Retorna o total de mensagens não lidas do usuário autenticado.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "data": {
    "totalUnread": 5
  }
}
```

## WebSocket (Obrigatório - Comunicação em Tempo Real)

O chat utiliza WebSocket para comunicação em tempo real. Todos os eventos de chat (novas mensagens, status de leitura, digitação, status online) são transmitidos via WebSocket.

### Conexão WebSocket

**URL:** `ws://localhost:3001/chat` (desenvolvimento) ou `wss://api.example.com/chat` (produção)

**Autenticação:**
O cliente deve enviar o token JWT no header de conexão ou como query parameter:

- Header: `Authorization: Bearer <token>`
- Query: `?token=<jwt-token>`

**Conexão:**

```javascript
const ws = new WebSocket('ws://localhost:3001/chat?token=YOUR_JWT_TOKEN');
```

### Eventos do Cliente para o Servidor

Todos os eventos devem seguir o formato:

```json
{
  "event": "nome-do-evento",
  "data": { ... }
}
```

1. **join-conversation**: Entrar em uma conversa (receber atualizações em tempo real)

   ```json
   {
     "event": "join-conversation",
     "data": {
       "conversationId": "conv-1"
     }
   }
   ```

   - O servidor deve adicionar o cliente à sala da conversa
   - O cliente começará a receber eventos relacionados a essa conversa

2. **leave-conversation**: Sair de uma conversa (parar de receber atualizações)

   ```json
   {
     "event": "leave-conversation",
     "data": {
       "conversationId": "conv-1"
     }
   }
   ```

3. **send-message**: Enviar mensagem via WebSocket (alternativa ao POST REST)

   ```json
   {
     "event": "send-message",
     "data": {
       "conversationId": "conv-1",
       "text": "Olá, como posso ajudar?"
     }
   }
   ```

   - O servidor deve criar a mensagem e broadcast para todos os participantes
   - Resposta: evento `new-message` para todos os participantes

4. **typing**: Indicar que está digitando

   ```json
   {
     "event": "typing",
     "data": {
       "conversationId": "conv-1",
       "isTyping": true
     }
   }
   ```

   - Enviar `isTyping: true` quando começar a digitar
   - Enviar `isTyping: false` quando parar de digitar (ou após 3 segundos de inatividade)

5. **mark-read**: Marcar mensagens como lidas via WebSocket (alternativa ao PUT REST)
   ```json
   {
     "event": "mark-read",
     "data": {
       "conversationId": "conv-1",
       "messageIds": ["msg-1", "msg-2"] // opcional, se não enviar marca todas como lidas
     }
   }
   ```

### Eventos do Servidor para o Cliente

Todos os eventos seguem o formato:

```json
{
  "event": "nome-do-evento",
  "data": { ... },
  "timestamp": "2024-03-10T10:35:00Z"
}
```

1. **connected**: Confirmação de conexão bem-sucedida

   ```json
   {
     "event": "connected",
     "data": {
       "userId": "user-1",
       "serverTime": "2024-03-10T10:35:00Z"
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Enviado imediatamente após conexão bem-sucedida
   - Confirma que o usuário está autenticado e conectado

2. **new-message**: Nova mensagem recebida

   ```json
   {
     "event": "new-message",
     "data": {
       "id": "msg-3",
       "text": "Olá, como posso ajudar?",
       "senderId": "user-2",
       "timestamp": "2024-03-10T10:35:00Z",
       "read": false,
       "conversationId": "conv-1"
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Enviado para todos os participantes da conversa (exceto o remetente, se necessário)
   - Atualiza a lista de conversas automaticamente no cliente

3. **message-read**: Mensagem marcada como lida

   ```json
   {
     "event": "message-read",
     "data": {
       "conversationId": "conv-1",
       "messageIds": ["msg-1", "msg-2"],
       "readBy": "user-1"
     },
     "timestamp": "2024-03-10T10:36:00Z"
   }
   ```

   - Enviado para todos os participantes da conversa
   - Permite atualizar indicadores de leitura em tempo real

4. **user-typing**: Usuário está digitando

   ```json
   {
     "event": "user-typing",
     "data": {
       "conversationId": "conv-1",
       "userId": "user-2",
       "userName": "Ana Silva",
       "isTyping": true
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Enviado apenas para outros participantes (não para o próprio usuário)
   - O servidor deve enviar automaticamente `isTyping: false` após 3 segundos de inatividade

5. **user-online-status**: Status online de um usuário mudou

   ```json
   {
     "event": "user-online-status",
     "data": {
       "userId": "user-2",
       "isOnline": true,
       "lastSeen": "2024-03-10T10:35:00Z"
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Enviado para todos os usuários que têm conversas com o usuário
   - Atualizado quando usuário conecta/desconecta do WebSocket

6. **conversation-updated**: Conversa foi atualizada (nova mensagem, mudança de participantes, etc.)

   ```json
   {
     "event": "conversation-updated",
     "data": {
       "conversationId": "conv-1",
       "lastMessage": {
         "id": "msg-3",
         "text": "Olá, como posso ajudar?",
         "senderId": "user-2",
         "timestamp": "2024-03-10T10:35:00Z"
       },
       "unreadCount": 1
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Enviado para todos os participantes
   - Permite atualizar a lista de conversas sem recarregar

7. **error**: Erro ocorreu
   ```json
   {
     "event": "error",
     "data": {
       "code": "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR",
       "message": "Mensagem de erro descritiva",
       "details": {}
     },
     "timestamp": "2024-03-10T10:35:00Z"
   }
   ```

   - Enviado quando ocorre um erro ao processar um evento
   - Após erro de autenticação, a conexão deve ser fechada

## Estrutura de Banco de Dados Sugerida

### Tabela: conversations

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
```

### Tabela: messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(conversation_id, read) WHERE read = FALSE;
```

### Tabela: user_online_status (Opcional)

```sql
CREATE TABLE user_online_status (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_online_status_online ON user_online_status(is_online) WHERE is_online = TRUE;
```

## Regras de Negócio

1. **Criação de Conversa:**
   - Uma conversa pode ter 2 ou mais participantes
   - Se já existir uma conversa entre os mesmos participantes, retornar a existente
   - O usuário autenticado é automaticamente adicionado como participante

2. **Envio de Mensagem:**
   - Apenas participantes da conversa podem enviar mensagens
   - Mensagens são criadas com `read: false` para todos os participantes exceto o remetente
   - A conversa é atualizada com a última mensagem e timestamp

3. **Marcação como Lida:**
   - Apenas o destinatário pode marcar mensagens como lidas
   - Ao marcar como lida, atualizar o `unreadCount` da conversa

4. **Status Online:**
   - Atualizar `last_seen` sempre que o usuário fizer uma requisição autenticada
   - Considerar usuário online se `last_seen` foi atualizado nos últimos 5 minutos
   - Implementar heartbeat via WebSocket para status em tempo real

5. **Permissões:**
   - Usuários só podem ver conversas das quais são participantes
   - Usuários só podem enviar mensagens em conversas das quais são participantes
   - Administradores podem ver todas as conversas (opcional)

## Notas de Implementação

1. **Paginação:**
   - Implementar paginação cursor-based para melhor performance em listas grandes
   - Usar `created_at` como cursor para mensagens

2. **Performance:**
   - Indexar `conversation_id` e `created_at` na tabela de mensagens
   - Cachear lista de conversas com TTL curto (30-60 segundos)
   - Usar Redis para status online em tempo real

3. **Segurança:**
   - Validar que o usuário é participante antes de retornar dados da conversa
   - Sanitizar texto das mensagens para prevenir XSS
   - Limitar taxa de envio de mensagens por usuário (rate limiting)

4. **Notificações Push (Futuro):**
   - Enviar notificação push quando nova mensagem chegar e usuário não estiver online
   - Integrar com serviço de notificações push (FCM, APNS)

## Exemplo de Uso

### Fluxo Completo

1. **Listar conversas:**

   ```bash
   GET /api/chat/conversations
   ```

2. **Criar/obter conversa:**

   ```bash
   POST /api/chat/conversations
   Body: { "participantId": "user-2" }
   ```

3. **Enviar mensagem:**

   ```bash
   POST /api/chat/conversations/conv-1/messages
   Body: { "text": "Olá!" }
   ```

4. **Obter mensagens:**

   ```bash
   GET /api/chat/conversations/conv-1/messages
   ```

5. **Marcar como lida:**
   ```bash
   PUT /api/chat/conversations/conv-1/messages/read
   ```
