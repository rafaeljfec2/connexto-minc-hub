interface AudioRecorderUIProps {
  readonly duration: number
  readonly onCancel: () => void
  readonly onSend: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioRecorderUI({ duration, onCancel, onSend }: AudioRecorderUIProps) {
  return (
    <>
      {/* Cancel/Trash button */}
      <button
        type="button"
        onClick={onCancel}
        className="p-2.5 rounded-full transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0 mb-0.5"
        aria-label="Cancelar gravação"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      {/* Recording indicator */}
      <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-bottom-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
        <span className="text-sm font-medium text-dark-700 dark:text-dark-300 min-w-[3rem]">
          {formatDuration(duration)}
        </span>

        {/* Audio waveform visualization */}
        <div className="flex items-center gap-0.5 flex-1 h-6">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`wave-${i}`}
              className="w-0.5 bg-dark-400 dark:bg-dark-500 rounded-full transition-all"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animation: `pulse ${Math.random() * 0.5 + 0.5}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Send button */}
      <button
        type="button"
        onClick={onSend}
        className="p-2.5 rounded-full transition-colors mb-0.5 bg-primary-500 text-white hover:bg-primary-600 flex-shrink-0"
        aria-label="Enviar áudio"
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
    </>
  )
}
