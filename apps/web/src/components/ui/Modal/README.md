# Modal Component

Componente Modal refatorado seguindo boas práticas de engenharia de software.

## Estrutura

```
Modal/
├── Modal.tsx              # Componente principal
├── index.ts               # Exportações públicas
├── hooks/
│   ├── useModalBodyLock.ts    # Gerenciamento de scroll do body
│   └── useModalKeyboard.ts    # Eventos de teclado (ESC)
├── components/
│   ├── ModalBackdrop.tsx      # Backdrop do modal
│   ├── ModalContainer.tsx     # Container principal
│   ├── ModalHeader.tsx        # Cabeçalho com título e botão fechar
│   └── ModalContent.tsx       # Área de conteúdo
└── utils/
    └── modalSizes.ts          # Constantes de tamanhos
```

## Uso

```tsx
import { Modal } from '@/components/ui/Modal'

;<Modal isOpen={isOpen} onClose={handleClose} title="Título do Modal" size="lg">
  {/* Conteúdo do modal */}
</Modal>
```

## Funcionalidades

- ✅ Bloqueio de scroll do body quando aberto
- ✅ Fechamento com tecla ESC
- ✅ Fechamento ao clicar no backdrop
- ✅ Suporte a touch events no mobile
- ✅ Timeout de segurança para restaurar scroll
- ✅ Restauração automática em eventos globais
- ✅ Responsivo (mobile e desktop)
- ✅ Acessibilidade (ARIA labels)

## Hooks

### `useModalBodyLock`

Gerencia o bloqueio do scroll do body e inclui timeout de segurança.

### `useModalKeyboard`

Gerencia eventos de teclado, especialmente ESC para fechar.

### `useModalSafetyRestore`

Garante que o overflow seja sempre restaurado em eventos globais.

## Componentes

### `ModalBackdrop`

Backdrop escuro que cobre a tela e permite fechar ao clicar.

### `ModalContainer`

Container principal com estilos responsivos e animações.

### `ModalHeader`

Cabeçalho com título e botão de fechar.

### `ModalContent`

Área de conteúdo com padding responsivo.

## Tamanhos

- `sm`: max-w-md
- `md`: max-w-lg (padrão)
- `lg`: max-w-3xl
- `xl`: max-w-5xl
