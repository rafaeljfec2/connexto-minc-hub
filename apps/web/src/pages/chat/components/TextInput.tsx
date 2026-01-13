import { useRef, useEffect } from 'react'
import { X } from 'lucide-react'

interface TextInputProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly onSend: () => void
  readonly disabled?: boolean
  readonly editMode?: boolean
  readonly onCancelEdit?: () => void
}

function getPlaceholderText(disabled?: boolean, editMode?: boolean): string {
  if (disabled) return 'Enviando arquivo...'
  if (editMode) return 'Edite a mensagem...'
  return 'Digite uma mensagem...'
}

export function TextInput({
  value,
  onChange,
  onSend,
  disabled,
  editMode,
  onCancelEdit,
}: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [value])

  // Focus on edit mode
  useEffect(() => {
    if (editMode && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(value.length, value.length)
    }
  }, [editMode, value.length])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        onSend()
      }
    }
  }

  return (
    <>
      {/* Input Container */}
      <div className="flex-1 bg-dark-100 dark:bg-dark-800 rounded-full px-4 py-2.5 min-h-[44px] flex items-center">
        {editMode && (
          <div className="flex items-center gap-2 mr-2 pb-0.5 border-r border-dark-300 dark:border-dark-700 pr-2">
            <svg
              className="h-4 w-4 text-primary-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="text-xs text-dark-600 dark:text-dark-400 font-medium">Editando</span>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholderText(disabled, editMode)}
          disabled={disabled}
          rows={1}
          className="w-full resize-none bg-transparent text-sm text-dark-900 dark:text-dark-50 placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none disabled:cursor-not-allowed max-h-32 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
          }}
        />
      </div>

      {/* Edit mode buttons */}
      {editMode && (
        <>
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-2.5 rounded-full transition-colors mb-0.5 text-dark-500 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700 flex-shrink-0"
            aria-label="Cancelar"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={!value.trim() || disabled}
            className={`p-2.5 rounded-full transition-colors mb-0.5 flex-shrink-0 ${
              value.trim() && !disabled
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-dark-200 dark:bg-dark-800 text-dark-500 dark:text-dark-400 cursor-not-allowed'
            }`}
            aria-label="Salvar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </>
      )}
    </>
  )
}
