import { useState } from 'react'

interface ChatInputProps {
  readonly onSend: (text: string) => void
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('')

  function handleSend() {
    if (text.trim()) {
      onSend(text)
      setText('')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t border-dark-200 dark:border-dark-800 bg-transparent">
      <button
        type="button"
        className="p-2.5 text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300 transition-colors"
        aria-label="Anexar"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <div className="flex-1 bg-dark-100 dark:bg-dark-800 rounded-2xl px-4 py-2.5 min-h-[40px] max-h-[100px] flex items-center">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem..."
          className="w-full bg-transparent text-dark-900 dark:text-dark-50 placeholder:text-dark-500 dark:placeholder:text-dark-400 text-sm resize-none outline-none overflow-y-auto"
          rows={1}
          maxLength={500}
        />
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={!text.trim()}
        className={`p-2.5 rounded-full transition-colors ${
          text.trim()
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-dark-200 dark:bg-dark-800 text-dark-500 dark:text-dark-400 cursor-not-allowed'
        }`}
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
    </div>
  )
}
