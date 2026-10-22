# Design System

> **Last updated:** 2026-01-10  
> **Status:** Active

## Overview

MINC Teams design system for the Welcome ministry at Minha Igreja na Cidade. Visual language inspired by [minhachurchnacidade.com](https://minhachurchnacidade.com/): warm orange/red gradients and subtle grain texture.

## Table of contents

- [Principles](#principles)
- [Color palette](#color-palette)
- [Typography](#typography)
- [Spacing](#spacing)
- [Base components](#base-components)
- [Responsiveness](#responsiveness)
- [Accessibility](#accessibility)
- [Animations](#animations)
- [Naming conventions](#naming-conventions)
- [CRUD page pattern](#crud-page-pattern)

---

## Principles

1. **Mobile-first** — default layouts for small screens; enhance at `md`/`lg`.
2. **Dark mode default** — `dark` class on root; full light theme via `light`.
3. **Consistency** — shared spacing, color, and type scale.
4. **Accessibility** — WCAG 2.1 AA contrast, keyboard, screen readers.
5. **Performance** — animate `transform` and `opacity` only when possible.

---

## Color palette

### Primary (orange)

Tailwind `primary-50` … `primary-950`. Actions: `primary-600`; focus rings: `primary-500`.

### Neutrals (`dark` scale)

- `dark-950` — app background (dark)
- `dark-900` — elevated surfaces
- `dark-800` — borders
- `dark-400` — secondary text (dark mode)
- Light mode: `white` backgrounds, `dark-50` primary text

### Warm grain gradient

Used for hero sections and emphasis headers — see `bg-gradient-warm-grain` in `tailwind.config.ts` (radial + linear stack with grain overlay).

---

## Typography

**Font:** `'Inter', system-ui, sans-serif`

| Token | Size | Use |
| ----- | ---- | --- |
| `text-xs` | 12px | Meta, badges |
| `text-sm` | 14px | Secondary copy |
| `text-base` | 16px | Body |
| `text-lg`–`text-4xl` | 18–36px | Headings, hero |

Weights: 400 body, 500 labels, 600 buttons/cards, 700 section titles.

Line height: `leading-relaxed` for body, `leading-tight` for headings.

---

## Spacing

Standard Tailwind spacing (`p-4` containers mobile, `p-6` desktop). Section gaps: `gap-2`–`gap-4`, vertical rhythm `mb-6`–`mb-8`.

**Safe areas (mobile notches):**

```css
.safe-area-top {
  padding-top: env(safe-area-inset-top, 0px);
}
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

## Base components

### Button

Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`. Sizes: `sm`, `md`, `lg`. States: hover scale, active press, disabled opacity, `focus-visible` ring.

### Input

Rounded `lg`, border + focus ring; optional `label` and `error` props.

### ComboBox

Searchable dropdown; `searchPlaceholder`, `options`, `value`, `onValueChange`.

### Card

`bg-white dark:bg-dark-900`, border, `shadow-sm`, optional hover elevation.

### Modal

Sizes `sm` | `md` | `lg` | `xl`; `isOpen`, `onClose`, `title`.

---

## Responsiveness

Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.

Pattern: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.

Mobile: single column + bottom nav; desktop: sidebar + multi-column grids.

---

## Accessibility

- Minimum contrast 4.5:1 (normal text), 3:1 (large text / UI)
- Keyboard: Tab order, Enter/Space activation, Esc closes modals
- `focus-visible` rings on interactive elements
- Semantic landmarks (`nav`, `main`) and descriptive `aria-label` on icon buttons
- Dynamic updates: `aria-live` where appropriate

---

## Animations

Default transition: `transition-all duration-200 ease-out`.

Utilities: `animate-fade-in`, `animate-fade-in-up`, `animate-slide-in-right`, `animate-scale-in`, `animate-spin`.

Prefer GPU-friendly properties; avoid animating layout-heavy properties.

---

## Naming conventions

- Components: PascalCase (`UserCard`)
- Props: camelCase; booleans `is*` / `has*`; handlers `on*`
- Files: `ComponentName.tsx`, `useHookName.ts`
- CSS utilities: kebab-case Tailwind composition

---

## CRUD page pattern

Use **ChurchesPage** as the reference implementation.

### Page controller

The page component owns data hooks, filters, and chooses mobile vs desktop view:

```tsx
export function EntityPage() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  return (
    <>
      {!isDesktop && <EntityMobileView {...props} />}
      {isDesktop && <EntityDesktopView {...props} />}
      <EntityFormModal />
    </>
  )
}
```

### Mobile list

1. Header with title + “New” (`PlusIcon`)
2. Full-width search
3. `CompactListItem` for rows

```tsx
<CompactListItem
  icon={<MyIcon />}
  title="Primary title"
  subtitle="Secondary line"
  metadata="Status or date"
  badge={{ text: 'Active', variant: 'success' }}
  onClick={handleClick}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

`ItemMenuDropdown` (portal-based) powers edit/delete overflow on mobile lists.

### Reference files

- `src/pages/ChurchesPage.tsx`
- `src/pages/churches/components/ChurchesMobileView.tsx`
- `src/pages/churches/components/ChurchListItem.tsx`

---

## Related documentation

- [Backend Standards](../backend/BACKEND_STANDARDS.md)
- [UI components](../../apps/web/src/components/ui/)
- [Tailwind config](../../apps/web/tailwind.config.ts)

## Changelog

- **2026-01-10:** Initial design system document
