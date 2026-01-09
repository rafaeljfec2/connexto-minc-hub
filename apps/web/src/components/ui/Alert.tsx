import { ReactNode } from 'react'

export type AlertType = 'info' | 'warning' | 'error' | 'success'

interface AlertProps {
  isOpen: boolean
  onClose: () => void
  type?: AlertType
  icon?: ReactNode
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  showCancel?: boolean
}

const alertStyles = {
  info: {
    iconBg: 'bg-primary-100 dark:bg-primary-900/30',
    iconColor: 'text-primary-600 dark:text-primary-400',
    buttonBg: 'bg-primary-500 hover:bg-primary-600',
  },
  warning: {
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    buttonBg: 'bg-orange-500 hover:bg-orange-600',
  },
  error: {
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    buttonBg: 'bg-red-500 hover:bg-red-600',
  },
  success: {
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    buttonBg: 'bg-green-500 hover:bg-green-600',
  },
}

const defaultIcons = {
  info: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  error: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  success: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
}

export function Alert({
  isOpen,
  onClose,
  type = 'info',
  icon,
  title,
  message,
  confirmText = 'Entendi',
  cancelText = 'Cancelar',
  onConfirm,
  showCancel = false,
}: AlertProps) {
  if (!isOpen) return null

  const styles = alertStyles[type]
  const displayIcon = icon || defaultIcons[type]

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-900 rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
        <div className="text-center">
          {/* Icon */}
          <div
            className={`mx-auto w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center mb-4`}
          >
            <div className={styles.iconColor}>{displayIcon}</div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-dark-600 dark:text-dark-400 mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            {showCancel && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-dark-100 hover:bg-dark-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-300 rounded-lg font-medium transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`${showCancel ? 'flex-1' : 'w-full'} px-4 py-2 ${styles.buttonBg} text-white rounded-lg font-medium transition-colors`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
