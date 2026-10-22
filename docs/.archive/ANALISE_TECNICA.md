# MINC Hub — Technical Analysis

**Date:** Archived snapshot  
**Scope:** Web frontend MVP (monorepo)

## Overview

MINC Hub is a management system for the Welcome ministry at Minha Igreja na Cidade, built as a pnpm + Turborepo monorepo. At the time of this review the project was in MVP phase with focus on the web frontend, using modern React and TypeScript.

## Strengths

### Architecture and structure

- Clear monorepo layout (`apps/web`, shared packages)
- React 18 + TypeScript + Vite
- Context API for global state (Auth, Theme)
- React Router for navigation
- Tailwind CSS for styling

### UI/UX

- Consistent visual language aligned with the ministry brand
- Animations and transitions implemented thoughtfully
- Reusable UI components

### Security (frontend)

- JWT tokens stored in localStorage (with known trade-offs)
- Protected routes by role
- Basic XSS awareness in forms

### Tooling

- ESLint + Prettier configured
- date-fns for date handling
- React Hook Form + Zod installed (underused in forms at review time)

## Critical issues

### 1. Rule violations (defaults)

**Location:** `apps/web/src/pages/SchedulesPage.tsx` (example)

- Use of `any` where `ServiceType` enum should apply
- Multiple uses of `||` for assignments where project rules require `??`

**Fix:** Use the `ServiceType` enum consistently; replace inappropriate `||` with `??`.

### 2. Code duplication

- `MOCK_MODE` duplicated across many files — centralize in `lib/constants.ts` or env
- Route wrappers repeated in `App.tsx` — use shared `ProtectedRoute` / layout components
- Large page files (e.g. 295+ lines) — split into focused components

### 3. Configuration drift

- Two ESLint config files (`.eslintrc.json` and `.eslintrc.cjs`) — keep only `.eslintrc.cjs`

### 4. Testing gap

- No unit or integration tests at review time — add coverage for auth and critical flows

### 5. Forms

- React Hook Form + Zod present but most forms used manual `useState` — migrate for validation consistency

### 6. Dead code

- `hasRole` exported from `AuthContext` but unused — remove or document future use

### 7. Duplicate constants

- `MOCK_MODE` defined twice in the same file in at least one module — define once at file top

### 8. Error handling

- Some catch blocks swallow errors — add logging and user-visible feedback where appropriate

## Priority recommendations

### Urgent (1–2 days)

1. Fix `any` and `||` violations in hot paths
2. Centralize `MOCK_MODE`
3. Remove duplicate ESLint config

### Important (3–5 days)

4. Refactor routing wrappers in `App.tsx`
5. Split oversized pages
6. Start unit tests for auth and CRUD hooks

### Medium term

7. Adopt React Hook Form + Zod on all forms
8. Document environment variables
9. Plan backend integration (mock mode off)

## Quality snapshot

| Area | Rating |
|------|--------|
| Structure | Good |
| TypeScript usage | Good with exceptions |
| Duplication | Needs work (MOCK_MODE, routes) |
| Tests | Missing |
| Rule adherence | Partial (`??`, enums) |

**Overall:** 4/5 — solid React/TypeScript base with clear wins from deduplication, tests, and stricter adherence to project defaults.
