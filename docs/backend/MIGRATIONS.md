# Migrations - MINC Teams API

Este documento explica como trabalhar com migrations do TypeORM no projeto.

## O que são Migrations?

Migrations são arquivos que descrevem mudanças no schema do banco de dados de forma versionada e controlada. Elas permitem:

- Versionar mudanças no banco de dados
- Aplicar mudanças de forma consistente em diferentes ambientes
- Reverter mudanças quando necessário
- Colaborar em equipe com histórico de mudanças

## Comandos Disponíveis

### Criar uma Nova Migration

Para criar uma migration vazia (você escreve o SQL manualmente):

```bash
pnpm migration:create src/migrations/NomeDaMigration
```

**Exemplo:**
```bash
pnpm migration:create src/migrations/AddEmailToPersons
```

### Gerar Migration Automaticamente

Para gerar uma migration baseada nas mudanças nas entidades:

```bash
pnpm migration:generate src/migrations/NomeDaMigration
```

**Exemplo:**
```bash
pnpm migration:generate src/migrations/AddEmailToPersons
```

⚠️ **Atenção**: Este comando compara as entidades com o banco atual. Certifique-se de que o banco está atualizado antes de usar.

### Executar Migrations

Para aplicar todas as migrations pendentes:

```bash
pnpm migration:run
```

### Reverter Última Migration

Para reverter a última migration executada:

```bash
pnpm migration:revert
```

### Ver Status das Migrations

Para ver quais migrations foram executadas e quais estão pendentes:

```bash
pnpm migration:show
```

## Estrutura de uma Migration

Uma migration típica tem esta estrutura:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class NomeDaMigration1234567890123 implements MigrationInterface {
  name = 'NomeDaMigration1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Código para aplicar a migration
    await queryRunner.query(`CREATE TABLE ...`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Código para reverter a migration
    await queryRunner.query(`DROP TABLE ...`);
  }
}
```

### Métodos

- **`up()`**: Executado quando a migration é aplicada. Contém as mudanças a serem feitas.
- **`down()`**: Executado quando a migration é revertida. Deve desfazer o que `up()` fez.

## Migration Inicial

A migration inicial (`1700000000000-InitialSchema.ts`) cria todas as tabelas base do sistema:

1. **churches** - Igrejas
2. **ministries** - Ministérios/Times
3. **persons** - Pessoas/Servos
4. **users** - Usuários do sistema
5. **teams** - Equipes
6. **team_members** - Relacionamento N:N entre equipes e pessoas
7. **services** - Cultos/Serviços
8. **schedules** - Escalas
9. **schedule_teams** - Relacionamento N:N entre escalas e equipes
10. **attendances** - Check-ins/Presenças
11. **refresh_tokens** - Tokens de refresh
12. **password_reset_tokens** - Tokens de reset de senha

Também cria:
- ENUMs: `service_type`, `attendance_method`
- Índices para performance
- Triggers para `updated_at` automático
- Constraints de integridade referencial

## Ordem de Criação

A migration inicial segue a ordem correta respeitando as dependências de foreign keys:

1. Primeiro cria tabelas sem dependências (churches)
2. Depois cria tabelas que dependem das anteriores
3. Por fim, cria relacionamentos N:N e tabelas auxiliares

## Boas Práticas

### 1. Nomenclatura

Use nomes descritivos que expliquem o que a migration faz:

- ✅ `AddEmailToPersons`
- ✅ `CreateAuditLogsTable`
- ✅ `AddIndexToUsersEmail`
- ❌ `Migration1`
- ❌ `Update`

### 2. Sempre Implemente `down()`

Toda migration deve ter um método `down()` que reverte as mudanças:

```typescript
public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`DROP TABLE IF EXISTS audit_logs;`);
}
```

### 3. Use Transações

O TypeORM executa migrations em transações automaticamente, mas você pode criar transações customizadas se necessário.

### 4. Teste em Desenvolvimento Primeiro

Sempre teste migrations em desenvolvimento antes de aplicar em produção:

```bash
# 1. Teste localmente
pnpm migration:run

# 2. Verifique se funcionou
pnpm migration:show

# 3. Se necessário, reverta
pnpm migration:revert
```

### 5. Não Modifique Migrations Já Executadas

Se uma migration já foi executada em produção, **não a modifique**. Crie uma nova migration para fazer ajustes.

### 6. Backup Antes de Migrations Importantes

Sempre faça backup do banco antes de executar migrations em produção:

```bash
# Exemplo de backup PostgreSQL
pg_dump -U minc_teams -d minc_teams > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Troubleshooting

### Erro: "Migration already executed"

Se você tentar executar uma migration que já foi executada, o TypeORM irá ignorá-la. Isso é normal.

### Erro: "Migration failed"

Se uma migration falhar:

1. Verifique os logs de erro
2. Corrija o problema na migration
3. Se necessário, reverta: `pnpm migration:revert`
4. Corrija e execute novamente: `pnpm migration:run`

### Erro: "Cannot find migration"

Certifique-se de que:
- O arquivo está na pasta `src/migrations/`
- O nome da classe corresponde ao nome do arquivo
- O timestamp no nome está correto

### Limpar Todas as Migrations (Desenvolvimento Apenas)

⚠️ **CUIDADO**: Use apenas em desenvolvimento!

```bash
# Conectar ao banco
docker-compose exec postgres psql -U minc_teams -d minc_teams

# Deletar tabela de migrations
DROP TABLE IF EXISTS migrations;

# Sair
\q
```

Depois execute as migrations novamente:
```bash
pnpm migration:run
```

## Próximas Migrations

Migrations futuras podem incluir:

- [ ] Tabela `schedule_reassignments` (remanejamentos)
- [ ] Tabela `messages` e `message_recipients` (comunicação)
- [ ] Tabela `notifications` e `notification_preferences` (notificações)
- [ ] Tabela `qr_code_logs` (logs de QR Code)
- [ ] Tabela `audit_logs` (auditoria)
- [ ] Tabela `draw_history` (histórico de sorteios)

## Referências

- [TypeORM Migrations](https://typeorm.io/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
