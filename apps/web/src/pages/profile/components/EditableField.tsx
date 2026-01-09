import { useState } from 'react'

interface EditableFieldProps {
  label: string
  value: string
  onSave: (value: string) => Promise<void>
  type?: 'text' | 'email' | 'tel' | 'textarea'
  placeholder?: string
  required?: boolean
}

export function EditableField({
  label,
  value: initialValue,
  onSave,
  type = 'text',
  placeholder,
  required = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (required && !value.trim()) {
      setError('Este campo é obrigatório')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      await onSave(value)
      setIsEditing(false)
    } catch (err) {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setValue(initialValue)
    setIsEditing(false)
    setError('')
  }

  if (!isEditing) {
    return (
      <div className="group">
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          {label}
        </label>
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-dark-50 dark:bg-dark-800/50 group-hover:bg-dark-100 dark:group-hover:bg-dark-800 transition-colors">
          <span className="text-dark-900 dark:text-dark-50 flex-1">
            {initialValue || (
              <span className="text-dark-400 dark:text-dark-500 italic">
                {placeholder || 'Não informado'}
              </span>
            )}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-all"
            aria-label={`Editar ${label}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-dark-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-dark-50 placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            autoFocus
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-dark-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-dark-50 placeholder-dark-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            autoFocus
          />
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-offset-dark-900"
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </span>
            ) : (
              'Salvar'
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 bg-dark-100 hover:bg-dark-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-300 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-dark-500 focus:ring-offset-2 dark:ring-offset-dark-900"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
