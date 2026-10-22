# ESLint and Prettier Configuration

## Overview

This document describes ESLint and Prettier setup for automatic formatting and removal of unused imports.

---

## Implemented settings

### 1. ESLint

**File:** `apps/web/.eslintrc.cjs`

#### Plugins

- `eslint-plugin-unused-imports` — removes unused imports on fix

#### Rules

- `unused-imports/no-unused-imports`: error on unused imports
- `unused-imports/no-unused-vars`: warn on unused variables
- `prefer-const`: prefer `const` when reassignment is not needed
- `no-var`: disallow `var`
- `object-shorthand`: require object shorthand where possible
- `prefer-arrow-callback`: prefer arrow functions for callbacks
- `prefer-template`: prefer template literals
- `no-console`: warn on `console.log` (allows `console.warn` and `console.error`)

---

### 2. Prettier

**File:** `.prettierrc`

| Option | Value |
| ------ | ----- |
| `semi` | `false` |
| `singleQuote` | `true` |
| `tabWidth` | `2` |
| `trailingComma` | `"es5"` |
| `printWidth` | `100` |
| `arrowParens` | `"avoid"` |
| `endOfLine` | `"lf"` |
| `bracketSpacing` | `true` |
| `jsxSingleQuote` | `false` |

**File:** `.prettierignore` ignores `node_modules`, build outputs, `.turbo`, `coverage`, minified files, and lockfiles.

---

### 3. npm scripts

#### Root (`package.json`)

```json
{
  "lint": "turbo run lint",
  "lint:fix": "turbo run lint:fix",
  "format": "turbo run format",
  "format:check": "turbo run format:check"
}
```

#### Web app (`apps/web/package.json`)

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

**File:** `turbo.json`

Tasks (typically without cache):

- `lint:fix`
- `format`
- `format:check`

---

## Usage

### Format code

```bash
pnpm format
pnpm format:check
```

### Lint and auto-fix

```bash
pnpm lint
pnpm lint:fix
```

### Format and lint together

```bash
pnpm format && pnpm lint:fix
```

---

## What auto-fix changes

### ESLint (`lint:fix`)

- Removes unused imports and variables
- Converts `var` to `const` / `let` where applicable
- Applies arrow callbacks, template strings, and object shorthand

### Prettier (`format`)

- Indentation, spacing, line breaks
- Quote style and line width

---

## Editor integration (VS Code)

Example `.vscode/settings.json`:

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

**Recommended extensions:** ESLint, Prettier.

---

## Example

**Before:**

```typescript
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function MyComponent() {
  const [count, setCount] = useState(0)

  return <Button>Click</Button>
}
```

**After `pnpm lint:fix`:**

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function MyComponent() {
  const [count, setCount] = useState(0)

  return <Button>Click</Button>
}
```

---

## Status

- ESLint configured
- Prettier configured
- Unused-imports plugin installed
- npm and Turborepo scripts wired
- Repository formatted per these rules

---

**Last updated:** 2025-01-04
