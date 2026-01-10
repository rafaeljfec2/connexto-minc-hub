# Variáveis de Ambiente - MINC Teams

Este documento descreve todas as variáveis de ambiente necessárias para o deploy e desenvolvimento da aplicação.

## Variáveis Obrigatórias para Produção

### `VITE_API_URL`
- **Descrição**: URL base da API backend
- **Tipo**: String (URL)
- **Exemplo**: `https://api.minc-teams.com`
- **Obrigatória**: Sim (para produção)
- **Padrão**: `http://localhost:3001` (apenas em desenvolvimento)
- **Uso**: Configura a URL base para todas as requisições HTTP da aplicação

## Variáveis Opcionais

### `VITE_MOCK_MODE`
- **Descrição**: Habilita o modo de desenvolvimento com dados mockados
- **Tipo**: String ("true" ou "false")
- **Exemplo**: `true`
- **Obrigatória**: Não
- **Padrão**: `false`
- **Uso**: Quando `true` ou quando `VITE_API_URL` não está definida, a aplicação roda sem backend, usando dados mockados

## Configuração por Ambiente

### Desenvolvimento Local
```env
VITE_API_URL=http://localhost:3001
VITE_MOCK_MODE=true
```

### Staging
```env
VITE_API_URL=https://api-staging.minc-teams.com
VITE_MOCK_MODE=false
```

### Produção
```env
VITE_API_URL=https://api.minc-teams.com
VITE_MOCK_MODE=false
```

## Como Configurar

### 1. Criar arquivo `.env`
Copie o arquivo `.env.example` para `.env` na raiz do projeto `apps/web/`:
```bash
cp apps/web/.env.example apps/web/.env
```

### 2. Editar variáveis
Edite o arquivo `.env` com os valores apropriados para seu ambiente.

### 3. Build
As variáveis são injetadas durante o build do Vite:
```bash
pnpm build
```

## Importante

⚠️ **Nunca commite o arquivo `.env` no repositório!**

- O arquivo `.env` contém informações sensíveis
- Use `.env.example` como template
- Adicione `.env` ao `.gitignore`

## Variáveis no Vite

Todas as variáveis de ambiente no Vite devem começar com `VITE_` para serem expostas ao código do cliente.

## Verificação

Para verificar se as variáveis estão sendo carregadas corretamente, você pode verificar no console do navegador:
```javascript
console.log(import.meta.env.VITE_API_URL)
```
