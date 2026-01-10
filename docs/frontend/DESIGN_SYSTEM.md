# Design System

> **Last Updated**: 2026-01-10  
> **Status**: Active

## Overview

Este documento define o Design System do MINC Teams, um sistema de gestão para o Time Boas-Vindas da Minha Igreja na Cidade. O design é inspirado no site [minhaigrejanacidade.com](https://minhaigrejanacidade.com/), utilizando uma paleta quente com gradientes e textura grain.

## Table of Contents

- [Princípios de Design](#princípios-de-design)
- [Paleta de Cores](#paleta-de-cores)
- [Tipografia](#tipografia)
- [Espaçamentos](#espaçamentos)
- [Componentes Base](#componentes-base)
- [Responsividade](#responsividade)
- [Acessibilidade](#acessibilidade)
- [Animações](#animações)
- [Convenções de Nomenclatura](#convenções-de-nomenclatura)

---

## Princípios de Design

### 1. Mobile-First

Todos os componentes são desenvolvidos priorizando dispositivos móveis, com melhorias progressivas para telas maiores.

### 2. Dark Mode por Padrão

O tema escuro é o padrão, com suporte completo para tema claro através da classe `light`.

### 3. Consistência Visual

Todos os componentes seguem os mesmos padrões de espaçamento, cores e tipografia.

### 4. Acessibilidade

Componentes seguem as diretrizes WCAG 2.1 AA, com foco em contraste, navegação por teclado e leitores de tela.

### 5. Performance

Animações otimizadas com `transform` e `opacity`, evitando reflows desnecessários.

---

## Paleta de Cores

### Cores Primárias (Orange/Red Gradient)

```css
primary: {
  50:  '#fff7ed',  /* Lightest */
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',  /* Base */
  600: '#ea580c',  /* Primary action */
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
  950: '#431407',  /* Darkest */
}
```

**Uso:**

- `primary-600`: Botões primários, links, elementos interativos
- `primary-500`: Bordas de foco, ícones ativos
- `primary-100/900`: Backgrounds sutis em light/dark mode

### Cores Neutras (Dark Scale)

```css
dark: {
  50:  '#fafafa',  /* Lightest */
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',  /* Texto secundário */
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',  /* Borders dark mode */
  900: '#18181b',  /* Backgrounds dark mode */
  950: '#09090b',  /* Base dark mode */
}
```

**Uso:**

- `dark-950`: Background principal (dark mode)
- `dark-900`: Cards e superfícies elevadas (dark mode)
- `dark-800`: Bordas e divisores (dark mode)
- `dark-50`: Texto principal (light mode)
- `white`: Background principal (light mode)

### Gradientes

```css
/* Gradiente quente com grain */
bg-gradient-warm-grain:
  radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.3) 0%, transparent 50%),
  radial-gradient(circle at 80% 80%, rgba(194, 65, 12, 0.4) 0%, transparent 50%),
  linear-gradient(135deg, #09090b 0%, #431407 25%, #c2410c 50%, #f97316 75%, #09090b 100%);
```

**Uso:**

- Headers de destaque
- Backgrounds de seções hero
- Elementos promocionais

---

## Tipografia

### Família de Fonte

```css
font-family: 'Inter', system-ui, sans-serif;
```

**Inter** é uma fonte otimizada para interfaces digitais, com excelente legibilidade em todos os tamanhos.

### Escala Tipográfica

| Classe Tailwind | Tamanho         | Uso                          |
| --------------- | --------------- | ---------------------------- |
| `text-xs`       | 0.75rem (12px)  | Labels pequenos, metadados   |
| `text-sm`       | 0.875rem (14px) | Texto secundário, descrições |
| `text-base`     | 1rem (16px)     | Texto principal              |
| `text-lg`       | 1.125rem (18px) | Subtítulos                   |
| `text-xl`       | 1.25rem (20px)  | Títulos de seção             |
| `text-2xl`      | 1.5rem (24px)   | Títulos de página            |
| `text-3xl`      | 1.875rem (30px) | Títulos principais           |
| `text-4xl`      | 2.25rem (36px)  | Hero titles                  |

### Pesos de Fonte

- **Regular (400)**: Texto principal
- **Medium (500)**: Ênfase sutil, labels
- **Semibold (600)**: Botões, títulos de cards
- **Bold (700)**: Títulos de seção, headings

### Line Height

- Texto corrido: `leading-relaxed` (1.625)
- Títulos: `leading-tight` (1.25)
- Labels: `leading-normal` (1.5)

---

## Espaçamentos

### Escala de Espaçamento (Tailwind)

| Classe | Valor          | Uso                  |
| ------ | -------------- | -------------------- |
| `p-1`  | 0.25rem (4px)  | Padding mínimo       |
| `p-2`  | 0.5rem (8px)   | Padding pequeno      |
| `p-3`  | 0.75rem (12px) | Padding médio        |
| `p-4`  | 1rem (16px)    | Padding padrão       |
| `p-6`  | 1.5rem (24px)  | Padding grande       |
| `p-8`  | 2rem (32px)    | Padding extra grande |

### Gaps e Margens

- **Gap entre elementos**: `gap-2` (8px) a `gap-4` (16px)
- **Margem entre seções**: `mb-6` (24px) a `mb-8` (32px)
- **Padding de containers**: `p-4` (16px) mobile, `p-6` (24px) desktop

### Safe Area Insets

Para dispositivos móveis com notch:

```css
.safe-area-top {
  padding-top: env(safe-area-inset-top, 0px);
}
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

## Componentes Base

### Button

**Variantes:**

```tsx
// Primary
<Button variant="primary">Criar</Button>
// Classes: bg-primary-600 text-white hover:bg-primary-700

// Secondary
<Button variant="secondary">Cancelar</Button>
// Classes: bg-dark-800 text-white hover:bg-dark-700

// Outline
<Button variant="outline">Editar</Button>
// Classes: border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white

// Ghost
<Button variant="ghost">Voltar</Button>
// Classes: text-dark-700 hover:bg-dark-100

// Danger
<Button variant="danger">Excluir</Button>
// Classes: bg-red-600 text-white hover:bg-red-700
```

**Tamanhos:**

- `sm`: `px-3 py-1.5 text-sm`
- `md`: `px-4 py-2 text-base` (padrão)
- `lg`: `px-6 py-3 text-lg`

**Estados:**

- Hover: `hover:scale-105`
- Active: `active:scale-95`
- Disabled: `disabled:opacity-50 disabled:pointer-events-none`
- Focus: `focus-visible:ring-2 focus-visible:ring-primary-500`

### Input

```tsx
<Input label="Nome" placeholder="Digite seu nome" error="Campo obrigatório" />
```

**Características:**

- Border radius: `rounded-lg`
- Padding: `px-3 py-2`
- Border: `border border-dark-300 dark:border-dark-700`
- Focus: `focus:ring-2 focus:ring-primary-500`
- Hover: `hover:border-primary-400`

### ComboBox

Dropdown com busca integrada:

```tsx
<ComboBox
  label="Selecione"
  options={options}
  value={value}
  onValueChange={setValue}
  searchable
  searchPlaceholder="Buscar..."
/>
```

### Card

```tsx
<Card hover>
  <CardContent>{/* Conteúdo */}</CardContent>
</Card>
```

**Características:**

- Background: `bg-white dark:bg-dark-900`
- Border: `border border-dark-200 dark:border-dark-800`
- Shadow: `shadow-sm`
- Hover: `hover:shadow-lg hover:shadow-primary-500/10`

### Modal

```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Título" size="md">
  {/* Conteúdo */}
</Modal>
```

**Tamanhos:**

- `sm`: `max-w-md`
- `md`: `max-w-lg` (padrão)
- `lg`: `max-w-2xl`
- `xl`: `max-w-4xl`

---

## Responsividade

### Breakpoints

```css
sm:  640px   /* Tablets pequenos */
md:  768px   /* Tablets */
lg:  1024px  /* Desktops pequenos */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Telas grandes */
```

### Padrões Mobile-First

```tsx
// Mobile: stack vertical
// Desktop: grid horizontal
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Layout Responsivo

- **Mobile**: Single column, full width
- **Tablet**: 2 columns grid
- **Desktop**: 3-4 columns grid, sidebar visível

---

## Acessibilidade

### Contraste de Cores

Todos os pares de cores atendem WCAG 2.1 AA:

- Texto normal: mínimo 4.5:1
- Texto grande: mínimo 3:1
- Elementos interativos: mínimo 3:1

### Navegação por Teclado

- **Tab**: Navegar entre elementos
- **Enter/Space**: Ativar botões
- **Esc**: Fechar modais
- **Arrow keys**: Navegar em listas

### Focus Visible

```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-primary-500
focus-visible:ring-offset-2
```

### ARIA Labels

```tsx
<button aria-label="Fechar modal">
  <XIcon />
</button>
```

### Leitores de Tela

- Usar elementos semânticos (`<nav>`, `<main>`, `<article>`)
- Labels descritivos em formulários
- Estados dinâmicos com `aria-live`

---

## Animações

### Transições Padrão

```css
transition-all duration-200 ease-out
```

### Animações Disponíveis

| Animação                 | Uso                                    |
| ------------------------ | -------------------------------------- |
| `animate-fade-in`        | Fade in simples (0.3s)                 |
| `animate-fade-in-up`     | Fade in com movimento para cima (0.4s) |
| `animate-slide-in-right` | Slide da esquerda (0.3s)               |
| `animate-scale-in`       | Scale in (0.2s)                        |
| `animate-spin`           | Loading spinners                       |
| `animate-pulse-slow`     | Pulsação lenta (3s)                    |

### Micro-interações

```tsx
// Hover scale
hover:scale-105

// Active scale
active:scale-95

// Smooth transitions
transition-all duration-200 ease-out
```

### Performance

- Usar `transform` e `opacity` para animações
- Evitar animar `width`, `height`, `top`, `left`
- Preferir `will-change` para animações complexas

---

## Convenções de Nomenclatura

### Componentes

- **PascalCase**: `Button`, `Modal`, `ComboBox`
- Sufixo descritivo: `UserCard`, `TeamItemCard`

### Props

- **camelCase**: `isOpen`, `onClose`, `searchPlaceholder`
- Booleans: prefixo `is`, `has`, `should`
- Handlers: prefixo `on` + verbo

### Classes CSS

- **kebab-case**: `bg-grain`, `safe-area-top`
- Utilitários Tailwind: composição de classes

### Arquivos

- Componentes: `ComponentName.tsx`
- Hooks: `useHookName.ts`
- Utils: `utilityName.ts`
- Types: `types.ts` ou `ComponentName.types.ts`

---

## Exemplos de Uso

### Formulário Completo

```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <Input label="Nome *" value={name} onChange={e => setName(e.target.value)} required />

  <ComboBox
    label="Equipe"
    options={teamOptions}
    value={selectedTeam}
    onValueChange={setSelectedTeam}
    searchable
  />

  <div className="flex justify-end gap-3 pt-4">
    <Button variant="outline" onClick={onCancel}>
      Cancelar
    </Button>
    <Button variant="primary" type="submit">
      Salvar
    </Button>
  </div>
</form>
```

### Card com Hover

```tsx
<Card hover className="p-6">
  <h3 className="text-lg font-semibold mb-2">Título do Card</h3>
  <p className="text-sm text-dark-500 dark:text-dark-400">Descrição do conteúdo</p>
</Card>
```

---

## Related Documentation

- [Backend Standards](../backend/BACKEND_STANDARDS.md)
- [Component Library](../../apps/web/src/components/ui/)
- [Tailwind Config](../../apps/web/tailwind.config.ts)

## Changelog

- 2026-01-10: Versão inicial do Design System
