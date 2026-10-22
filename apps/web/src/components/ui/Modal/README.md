# Modal Component

Refactored Modal component following software engineering best practices.

## Structure

```
Modal/
├── Modal.tsx              # Main component
├── index.ts               # Public exports
├── hooks/
│   ├── useModalBodyLock.ts    # Body scroll management
│   └── useModalKeyboard.ts    # Keyboard events (ESC)
├── components/
│   ├── ModalBackdrop.tsx      # Modal backdrop
│   ├── ModalContainer.tsx     # Main container
│   ├── ModalHeader.tsx        # Header with title and close button
│   └── ModalContent.tsx       # Content area
└── utils/
    └── modalSizes.ts          # Size constants
```

## Usage

```tsx
import { Modal } from '@/components/ui/Modal'
;<Modal isOpen={isOpen} onClose={handleClose} title="Modal Title" size="lg">
  {/* Modal content */}
</Modal>
```

## Features

- ✅ Body scroll lock when open
- ✅ Close with ESC key
- ✅ Close on backdrop click
- ✅ Touch event support on mobile
- ✅ Safety timeout to restore scroll
- ✅ Automatic restore on global events
- ✅ Responsive (mobile and desktop)
- ✅ Accessibility (ARIA labels)

## Hooks

### `useModalBodyLock`

Manages body scroll lock and includes a safety timeout.

### `useModalKeyboard`

Handles keyboard events, especially ESC to close.

### `useModalSafetyRestore`

Ensures overflow is always restored on global events.

## Components

### `ModalBackdrop`

Dark backdrop that covers the screen and allows closing on click.

### `ModalContainer`

Main container with responsive styles and animations.

### `ModalHeader`

Header with title and close button.

### `ModalContent`

Content area with responsive padding.

## Sizes

- `sm`: max-w-md
- `md`: max-w-lg (default)
- `lg`: max-w-3xl
- `xl`: max-w-5xl
