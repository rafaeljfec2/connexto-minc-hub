interface SendButtonProps {
  readonly onClick: () => void
  readonly disabled?: boolean
}

export function SendButton({ onClick, disabled }: SendButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="p-2.5 rounded-full transition-colors mb-0.5 bg-primary-500 text-white hover:bg-primary-600 flex-shrink-0"
      aria-label="Enviar"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    </button>
  )
}
