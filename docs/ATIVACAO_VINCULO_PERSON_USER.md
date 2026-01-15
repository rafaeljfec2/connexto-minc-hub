# Garantia de Vínculo Person-User na Ativação

## Fluxo de Ativação e Vínculo

### 1. Busca da Pessoa pelo Telefone

**Processo:**

1. Usuário digita telefone no frontend (ex: `(11) 98765-4321`)
2. Frontend normaliza removendo formatação: `11987654321`
3. Backend recebe telefone normalizado
4. Backend busca pessoa comparando telefones normalizados (apenas números)

**Normalização:**

- Remove todos os caracteres não numéricos: `(11) 98765-4321` → `11987654321`
- Comparação case-insensitive e format-agnostic
- Aceita telefones com ou sem formatação no banco

**Query Otimizada:**

```typescript
// Busca pessoas não deletadas com telefone
// Normaliza telefones em memória e compara
const person = await this.findPersonByPhone(normalizedPhone)
```

### 2. Validações Antes de Criar User

**Validações realizadas:**

1. ✅ Pessoa existe no banco
2. ✅ Pessoa não tem User vinculado (`findByPersonId`)
3. ✅ Email não está em uso (`findByEmail`)
4. ✅ Pessoa pertence ao escopo do código de acesso
5. ✅ Código de acesso está válido e ativo

### 3. Criação do User com Vínculo

**Código crítico:**

```typescript
const user = await this.usersService.create({
  email: dto.email,
  passwordHash,
  name: person.name,
  role: UserRole.SERVO,
  personId: person.id, // ⚠️ VÍNCULO CRÍTICO
  canCheckIn: false,
})
```

**Validação pós-criação:**

```typescript
// Verifica se o vínculo foi criado corretamente
if (!user.personId || user.personId !== person.id) {
  throw new BadRequestException('Erro ao vincular usuário à pessoa')
}

// Garante que o usuário está ativo
if (!user.isActive) {
  user.isActive = true
  await this.usersService.update(user.id, { isActive: true })
}
```

### 4. Login Automático Após Ativação

**Fluxo:**

1. User é criado com `personId` vinculado
2. Token JWT é gerado com dados do User
3. Token é salvo no localStorage do frontend
4. User é salvo no localStorage do frontend
5. `login()` é chamado para atualizar o contexto React
6. Usuário é redirecionado para o dashboard

**Garantias:**

- ✅ User tem `personId` correto
- ✅ User está `isActive = true`
- ✅ Token JWT contém `sub` (userId), `email`, `role`
- ✅ Frontend tem token e user salvos
- ✅ Contexto React está atualizado

## Estrutura do Vínculo

### Relacionamento no Banco

```sql
-- Tabela users
users (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES persons(id),
  email VARCHAR UNIQUE,
  name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN DEFAULT true,
  ...
)

-- Tabela persons
persons (
  id UUID PRIMARY KEY,
  phone VARCHAR,
  name VARCHAR,
  ...
)
```

### Relacionamento TypeORM

```typescript
// UserEntity
@OneToOne(() => PersonEntity, { nullable: true })
@JoinColumn({ name: 'person_id' })
person: PersonEntity | null;

@Column({ type: 'uuid', nullable: true, name: 'person_id' })
personId: string | null;

// PersonEntity
@OneToOne(() => UserEntity, { nullable: true })
user: UserEntity | null;
```

## Validações de Segurança

### 1. Telefone Único por Pessoa

- Cada pessoa tem um telefone único
- Busca normaliza telefones antes de comparar
- Aceita diferentes formatos: `(11) 98765-4321`, `11987654321`, `+55 11 98765-4321`

### 2. Pessoa Não Pode Ter Múltiplos Users

- Validação antes de criar: `findByPersonId(person.id)`
- Se já existe User, lança `ConflictException`
- Garante relação 1:1 entre Person e User

### 3. Email Único no Sistema

- Validação antes de criar: `findByEmail(email)`
- Se email já existe, lança `ConflictException`
- Garante que cada User tem email único

### 4. Escopo do Código

- Pessoa deve pertencer ao escopo do código (Igreja/Ministério/Time)
- Validação antes de gerar token temporário
- Garante que apenas pessoas autorizadas podem ativar

## Logs e Monitoramento

### Logs de Sucesso

```
[ActivationService] Usuário criado e vinculado com sucesso {
  userId: 'uuid',
  personId: 'uuid',
  email: 'user@example.com',
  name: 'João Silva'
}
```

### Logs de Erro

```
[ActivationService] Erro crítico: Vínculo Person-User não foi criado corretamente {
  userId: 'uuid',
  personId: 'uuid',
  userPersonId: null
}
```

### Eventos de Segurança

- `activation_check_success`: Validação bem-sucedida
- `activation_completed`: User criado com sucesso
- `activation_check_failed`: Falha na validação (vários motivos)
- `activation_complete_failed`: Falha ao criar User

## Troubleshooting

### Problema: "Telefone não encontrado"

**Possíveis causas:**

1. Telefone não foi importado na base de dados
2. Formato do telefone diferente do esperado
3. Telefone está em outra pessoa

**Solução:**

- Verificar se pessoa existe: `SELECT * FROM persons WHERE phone LIKE '%11987654321%'`
- Verificar formato: Telefones devem ter pelo menos 10 dígitos
- Normalizar telefone manualmente e buscar

### Problema: "Esta pessoa já possui uma conta ativada"

**Possíveis causas:**

1. Pessoa já tem User vinculado
2. User foi criado anteriormente

**Solução:**

- Verificar vínculo: `SELECT * FROM users WHERE person_id = 'person-uuid'`
- Se User existe, pessoa deve fazer login normalmente
- Se User não existe mas erro persiste, verificar dados inconsistentes

### Problema: User criado mas não consegue fazer login

**Possíveis causas:**

1. User não está ativo (`isActive = false`)
2. Token não foi salvo corretamente
3. Vínculo Person-User não foi criado

**Solução:**

- Verificar `isActive`: `SELECT is_active FROM users WHERE id = 'user-uuid'`
- Verificar `personId`: `SELECT person_id FROM users WHERE id = 'user-uuid'`
- Verificar logs do backend para erros durante criação
- Verificar localStorage do frontend (token e user)

### Problema: User criado mas não aparece vinculado à Person

**Possíveis causas:**

1. `personId` não foi salvo no banco
2. Relacionamento TypeORM não foi carregado

**Solução:**

- Verificar banco diretamente: `SELECT person_id FROM users WHERE id = 'user-uuid'`
- Verificar se `personId` está sendo passado corretamente no `create()`
- Verificar logs para erros durante criação
- Recarregar User do banco após criação

## Testes Recomendados

### Teste 1: Busca por Telefone

```typescript
// Teste com diferentes formatos
normalizePhone('(11) 98765-4321') === '11987654321'
normalizePhone('11987654321') === '11987654321'
normalizePhone('+55 11 98765-4321') === '5511987654321'
```

### Teste 2: Criação de User com Vínculo

```typescript
// Verificar após criação
const user = await usersService.create({ ..., personId: 'person-id' });
expect(user.personId).toBe('person-id');
expect(user.isActive).toBe(true);
```

### Teste 3: Login Após Ativação

```typescript
// Verificar que User consegue fazer login
const loginResult = await authService.login(user.email, password)
expect(loginResult.user.personId).toBe('person-id')
expect(loginResult.token).toBeDefined()
```

## Melhorias Futuras

1. **Índice no Telefone Normalizado**: Criar coluna `phone_normalized` com índice para busca mais rápida
2. **Cache de Busca**: Cachear resultados de busca por telefone para melhor performance
3. **Validação de Telefone**: Validar formato brasileiro (10 ou 11 dígitos)
4. **Histórico de Ativações**: Tabela para rastrear todas as ativações realizadas
