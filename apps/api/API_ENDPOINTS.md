# Endpoints da API - MINC Teams

Documentação completa de todos os endpoints disponíveis na API.

## Base URL

```
http://localhost:3001
```

## Autenticação

Todos os endpoints (exceto `/auth/login` e `/auth/refresh-token`) requerem autenticação via JWT.

Os tokens são enviados automaticamente via cookies HttpOnly. Alternativamente, pode-se usar o header:

```
Authorization: Bearer <token>
```

---

## Autenticação

### POST /auth/login

Realiza login e retorna cookies HttpOnly com tokens.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "name": "Nome do Usuário",
    "email": "user@example.com",
    "role": "admin",
    "isActive": true,
    "personId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Cookies:** `access_token`, `refresh_token` (HttpOnly)

---

### POST /auth/refresh-token

Renova os tokens de autenticação.

**Body (opcional):**
```json
{
  "refreshToken": "refresh-token-here"
}
```

Ou usar o cookie `refresh_token`.

**Response:** `200 OK`
```json
{
  "message": "Tokens refreshed successfully"
}
```

---

### POST /auth/logout

Realiza logout e limpa os cookies.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

### POST /auth/forgot-password

Solicita recuperação de senha.

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "E-mail de recuperação enviado com sucesso"
}
```

---

### POST /auth/reset-password

Reseta a senha usando o token recebido por email.

**Body:**
```json
{
  "email": "user@example.com",
  "token": "reset-token-here",
  "password": "newPassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Senha alterada com sucesso"
}
```

---

### GET /auth/me

Retorna informações do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Nome do Usuário",
  "email": "user@example.com",
  "role": "admin",
  "isActive": true,
  "personId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Churches (Igrejas)

### GET /churches

Lista todas as igrejas.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Minha Igreja na Cidade",
    "address": "Rua Exemplo, 123",
    "phone": "(11) 99999-9999",
    "email": "contato@igreja.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
  }
]
```

---

### GET /churches/:id

Obtém uma igreja por ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Minha Igreja na Cidade",
  "address": "Rua Exemplo, 123",
  "phone": "(11) 99999-9999",
  "email": "contato@igreja.com",
  "ministries": [],
  "services": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### POST /churches

Cria uma nova igreja.

**Body:**
```json
{
  "name": "Minha Igreja na Cidade",
  "address": "Rua Exemplo, 123",
  "phone": "(11) 99999-9999",
  "email": "contato@igreja.com"
}
```

**Response:** `201 Created`

---

### PATCH /churches/:id

Atualiza uma igreja.

**Body:**
```json
{
  "name": "Novo Nome",
  "phone": "(11) 88888-8888"
}
```

**Response:** `200 OK`

---

### DELETE /churches/:id

Remove uma igreja (soft delete).

**Response:** `200 OK`

---

## Ministries (Ministérios)

### GET /ministries

Lista todos os ministérios.

**Query Params:**
- `churchId` (opcional) - Filtrar por igreja

**Response:** `200 OK`

---

### GET /ministries/:id

Obtém um ministério por ID.

**Response:** `200 OK`

---

### POST /ministries

Cria um novo ministério.

**Body:**
```json
{
  "name": "Boas-Vindas",
  "churchId": "uuid-da-igreja",
  "description": "Ministério responsável por receber visitantes",
  "isActive": true
}
```

**Response:** `201 Created`

---

### PATCH /ministries/:id

Atualiza um ministério.

**Response:** `200 OK`

---

### DELETE /ministries/:id

Remove um ministério (soft delete).

**Response:** `200 OK`

---

## Persons (Pessoas/Servos)

### GET /persons

Lista todas as pessoas.

**Query Params:**
- `ministryId` (opcional) - Filtrar por ministério
- `teamId` (opcional) - Filtrar por equipe

**Response:** `200 OK`

---

### GET /persons/:id

Obtém uma pessoa por ID.

**Response:** `200 OK`

---

### POST /persons

Cria uma nova pessoa.

**Body:**
```json
{
  "name": "João Silva",
  "ministryId": "uuid-do-ministerio",
  "teamId": "uuid-da-equipe",
  "email": "joao@example.com",
  "phone": "(11) 99999-9999",
  "birthDate": "1990-01-01",
  "address": "Rua Exemplo, 123",
  "notes": "Observações"
}
```

**Response:** `201 Created`

---

### PATCH /persons/:id

Atualiza uma pessoa.

**Response:** `200 OK`

---

### DELETE /persons/:id

Remove uma pessoa (soft delete).

**Response:** `200 OK`

---

## Services (Cultos/Serviços)

### GET /services

Lista todos os cultos.

**Query Params:**
- `churchId` (opcional) - Filtrar por igreja

**Response:** `200 OK`

---

### GET /services/:id

Obtém um culto por ID.

**Response:** `200 OK`

---

### POST /services

Cria um novo culto.

**Body:**
```json
{
  "churchId": "uuid-da-igreja",
  "type": "sunday_morning",
  "dayOfWeek": 0,
  "time": "09:00:00",
  "name": "Culto da Manhã",
  "isActive": true
}
```

**Tipos:** `sunday_morning`, `sunday_evening`, `wednesday`, `friday`, `special`

**Response:** `201 Created`

---

### PATCH /services/:id

Atualiza um culto.

**Response:** `200 OK`

---

### DELETE /services/:id

Remove um culto (soft delete).

**Response:** `200 OK`

---

## Teams (Equipes)

### GET /teams

Lista todas as equipes.

**Query Params:**
- `ministryId` (opcional) - Filtrar por ministério

**Response:** `200 OK`

---

### GET /teams/:id

Obtém uma equipe por ID.

**Response:** `200 OK`

---

### POST /teams

Cria uma nova equipe.

**Body:**
```json
{
  "name": "Equipe A",
  "ministryId": "uuid-do-ministerio",
  "leaderId": "uuid-do-lider",
  "description": "Equipe responsável pelo recebimento",
  "isActive": true
}
```

**Response:** `201 Created`

---

### PATCH /teams/:id

Atualiza uma equipe.

**Response:** `200 OK`

---

### DELETE /teams/:id

Remove uma equipe (soft delete).

**Response:** `200 OK`

---

### POST /teams/:id/members

Adiciona um membro à equipe.

**Body:**
```json
{
  "personId": "uuid-da-pessoa"
}
```

**Response:** `201 Created`

---

### GET /teams/:id/members

Lista membros da equipe.

**Response:** `200 OK`

---

### DELETE /teams/:id/members/:personId

Remove um membro da equipe.

**Response:** `200 OK`

---

## Schedules (Escalas)

### GET /schedules

Lista todas as escalas.

**Query Params:**
- `serviceId` (opcional) - Filtrar por culto
- `startDate` (opcional) - Data inicial (YYYY-MM-DD)
- `endDate` (opcional) - Data final (YYYY-MM-DD)

**Response:** `200 OK`

---

### GET /schedules/:id

Obtém uma escala por ID.

**Response:** `200 OK`

---

### POST /schedules

Cria uma nova escala.

**Body:**
```json
{
  "serviceId": "uuid-do-culto",
  "date": "2024-01-15",
  "teamIds": ["uuid-equipe-1", "uuid-equipe-2"]
}
```

**Response:** `201 Created`

---

### PATCH /schedules/:id

Atualiza uma escala.

**Response:** `200 OK`

---

### DELETE /schedules/:id

Remove uma escala (soft delete).

**Response:** `200 OK`

---

### POST /schedules/:id/teams

Adiciona uma equipe à escala.

**Body:**
```json
{
  "teamId": "uuid-da-equipe"
}
```

**Response:** `201 Created`

---

### GET /schedules/:id/teams

Lista equipes da escala.

**Response:** `200 OK`

---

### DELETE /schedules/:id/teams/:teamId

Remove uma equipe da escala.

**Response:** `200 OK`

---

## Attendances (Check-ins)

### GET /attendances

Lista todos os check-ins.

**Query Params:**
- `scheduleId` (opcional) - Filtrar por escala
- `personId` (opcional) - Filtrar por pessoa

**Response:** `200 OK`

---

### GET /attendances/schedule/:scheduleId/stats

Obtém estatísticas de presença de uma escala.

**Response:** `200 OK`
```json
{
  "total": 10,
  "present": 8,
  "absent": 2,
  "attendances": []
}
```

---

### GET /attendances/:id

Obtém um check-in por ID.

**Response:** `200 OK`

---

### POST /attendances

Registra um check-in.

**Body:**
```json
{
  "scheduleId": "uuid-da-escala",
  "personId": "uuid-da-pessoa",
  "method": "qr_code",
  "qrCodeData": {
    "qrCode": "abc123",
    "timestamp": "2024-01-15T10:00:00Z"
  },
  "absenceReason": null
}
```

**Métodos:** `qr_code`, `manual`

**Response:** `201 Created`

---

### PATCH /attendances/:id

Atualiza um check-in.

**Response:** `200 OK`

---

### DELETE /attendances/:id

Remove um check-in.

**Response:** `200 OK`

---

## Chat (Comunicação)

> **Nota:** Para especificações completas do Chat API, consulte [CHAT_API.md](./CHAT_API.md)

O sistema de chat permite comunicação entre usuários do sistema. Os principais endpoints são:

- `GET /api/chat/conversations` - Listar conversas do usuário
- `GET /api/chat/conversations/:id/messages` - Obter mensagens de uma conversa
- `POST /api/chat/conversations/:id/messages` - Enviar mensagem
- `POST /api/chat/conversations` - Criar ou obter conversa
- `PUT /api/chat/conversations/:id/messages/read` - Marcar mensagens como lidas
- `GET /api/chat/users/:id/status` - Obter status online de usuário
- `GET /api/chat/conversations/unread-count` - Contagem de mensagens não lidas

Para detalhes completos, exemplos de requisições/respostas, estrutura de banco de dados e especificação de WebSocket, consulte [CHAT_API.md](./CHAT_API.md).

---

## Health Check

### GET /health

Verifica o status da API.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Não autorizado
- `404 Not Found` - Recurso não encontrado
- `409 Conflict` - Conflito (ex: duplicação)
- `422 Unprocessable Entity` - Erro de validação
- `500 Internal Server Error` - Erro interno do servidor

---

## Documentação Swagger

Acesse a documentação interativa em:

```
http://localhost:3001/api/docs
```

---

## Exemplos de Uso

### Criar uma igreja e seus ministérios

```bash
# 1. Criar igreja
POST /churches
{
  "name": "Minha Igreja na Cidade"
}

# 2. Criar ministério
POST /ministries
{
  "name": "Boas-Vindas",
  "churchId": "<church-id>"
}

# 3. Criar equipe
POST /teams
{
  "name": "Equipe A",
  "ministryId": "<ministry-id>"
}
```

### Criar uma escala e registrar check-ins

```bash
# 1. Criar culto
POST /services
{
  "churchId": "<church-id>",
  "type": "sunday_morning",
  "dayOfWeek": 0,
  "time": "09:00:00",
  "name": "Culto da Manhã"
}

# 2. Criar escala
POST /schedules
{
  "serviceId": "<service-id>",
  "date": "2024-01-15",
  "teamIds": ["<team-id>"]
}

# 3. Registrar check-in
POST /attendances
{
  "scheduleId": "<schedule-id>",
  "personId": "<person-id>",
  "method": "qr_code"
}
```

---

**Última atualização:** 2024-01-XX
