# Configuração ESLint e Prettier

## 📋 Visão Geral

Este documento descreve a configuração do ESLint e Prettier para formatação automática de código e remoção de imports não utilizados.

---

## ✅ Configurações Implementadas

### 1. ESLint

**Arquivo**: `apps/web/.eslintrc.cjs`

#### Plugins Adicionados:
- `eslint-plugin-unused-imports` - Remove imports não utilizados automaticamente

#### Regras Configuradas:
- ✅ `unused-imports/no-unused-imports`: Remove imports não utilizados
- ✅ `unused-imports/no-unused-vars`: Detecta variáveis não utilizadas
- ✅ `prefer-const`: Força uso de `const` quando possível
- ✅ `no-var`: Proíbe uso de `var`
- ✅ `object-shorthand`: Força uso de shorthand em objetos
- ✅ `prefer-arrow-callback`: Prefere arrow functions
- ✅ `prefer-template`: Prefere template strings
- ✅ `no-console`: Avisa sobre console.log (permite console.warn e console.error)

---

### 2. Prettier

**Arquivo**: `.prettierrc`

#### Configurações:
- `semi: false` - Sem ponto e vírgula
- `singleQuote: true` - Aspas simples
- `tabWidth: 2` - 2 espaços para indentação
- `trailingComma: "es5"` - Vírgula final quando possível
- `printWidth: 100` - 100 caracteres por linha
- `arrowParens: "avoid"` - Evita parênteses em arrow functions com um parâmetro
- `endOfLine: "lf"` - Fim de linha LF
- `bracketSpacing: true` - Espaços em objetos
- `jsxSingleQuote: false` - Aspas duplas em JSX

**Arquivo**: `.prettierignore`

Ignora:
- `node_modules`
- `dist`
- `build`
- `.next`
- `.turbo`
- `coverage`
- Arquivos minificados
- Lock files

---

### 3. Scripts NPM

#### Root (`package.json`):
```json
{
  "lint": "turbo run lint",
  "lint:fix": "turbo run lint:fix",
  "format": "turbo run format",
  "format:check": "turbo run format:check"
}
```

#### Web App (`apps/web/package.json`):
```json
{
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "lint:fix": "eslint . --ext ts,tsx --fix",
  "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\""
}
```

---

### 4. Turborepo

**Arquivo**: `turbo.json`

#### Tasks Adicionadas:
- `lint:fix` - Executa lint com correção automática (sem cache)
- `format` - Formata código com Prettier (sem cache)
- `format:check` - Verifica formatação sem alterar arquivos (sem cache)

---

## 🚀 Como Usar

### Formatar Código

```bash
# Formatar todos os arquivos
pnpm format

# Verificar formatação sem alterar
pnpm format:check
```

### Lint e Correção Automática

```bash
# Verificar problemas
pnpm lint

# Corrigir problemas automaticamente (remove imports não utilizados)
pnpm lint:fix
```

### Executar Ambos

```bash
# Formatar e corrigir lint
pnpm format && pnpm lint:fix
```

---

## 📝 O que é Corrigido Automaticamente

### ESLint (`lint:fix`):
- ✅ Remove imports não utilizados
- ✅ Remove variáveis não utilizadas
- ✅ Converte `var` para `const`/`let`
- ✅ Converte para arrow functions quando apropriado
- ✅ Converte para template strings
- ✅ Aplica object shorthand

### Prettier (`format`):
- ✅ Formatação de código (indentação, espaços, quebras de linha)
- ✅ Aspas simples/duplas
- ✅ Ponto e vírgula
- ✅ Comprimento de linha

---

## ⚙️ Integração com Editor

### VS Code

Adicione ao `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Extensões Recomendadas:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)

---

## 🔍 Exemplos

### Antes (com imports não utilizados):
```typescript
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function MyComponent() {
  const [count, setCount] = useState(0)
  
  return <Button>Click</Button>
}
```

### Depois (`pnpm lint:fix`):
```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function MyComponent() {
  const [count, setCount] = useState(0)
  
  return <Button>Click</Button>
}
```

---

## 📊 Status

- ✅ ESLint configurado
- ✅ Prettier configurado
- ✅ Plugin de imports não utilizados instalado
- ✅ Scripts NPM criados
- ✅ Turborepo configurado
- ✅ Arquivos formatados

---

**Última atualização**: 2025-01-04
