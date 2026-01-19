interface ModalHeaderProps {
  readonly title: string
  readonly onClose: () => void
}

export function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
      <h2 className="text-lg sm:text-xl font-semibold text-dark-900 dark:text-dark-50">{title}</h2>
      <button
        onClick={onClose}
        className="text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-50 transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Fechar"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
