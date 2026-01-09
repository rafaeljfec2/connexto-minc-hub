export type CheckInErrorType =
  | 'closed'
  | 'no-schedule'
  | 'not-linked'
  | 'already-checked'
  | 'other'
  | null

interface ErrorMessageProps {
  errorType: CheckInErrorType
  errorMessage?: string | null
}

export function ErrorMessage({ errorType, errorMessage }: Readonly<ErrorMessageProps>) {
  if (!errorType) return null

  const getClosedDescription = () => {
    if (errorMessage?.includes('Check-in opens') && errorMessage.includes('Opens at')) {
      const timeMatch = /Opens at (\d{2}:\d{2}:\d{2})/.exec(errorMessage)
      if (timeMatch) {
        const time = timeMatch[1].slice(0, 5)
        return `Check-in disponível a partir das ${time} (30 min antes do culto)`
      }
    }
    return errorMessage || 'O horário de check-in já passou ou ainda não está disponível'
  }

  const errorMessages = {
    closed: {
      title: 'Check-in fechado',
      description: getClosedDescription(),
      icon: '🕐',
    },
    'no-schedule': {
      title: 'Não há agenda para hoje',
      description: 'Você não possui escalas agendadas para esta data',
      icon: '📅',
    },
    'not-linked': {
      title: 'Usuário não vinculado',
      description: 'Você precisa estar vinculado a uma pessoa para gerar QR Code',
      icon: '⚠️',
    },
    'already-checked': {
      title: 'Check-in já realizado',
      description: 'Você já fez check-in para esta escala',
      icon: '✅',
    },
    other: {
      title: 'Erro',
      description: errorMessage || 'Ocorreu um erro ao gerar o QR Code',
      icon: '❌',
    },
  }

  const error = errorMessages[errorType]
  if (!error) return null

  return (
    <div className="bg-dark-100 dark:bg-dark-800 p-6 rounded-2xl mb-8">
      <div className="text-center">
        <div className="text-4xl mb-3">{error.icon}</div>
        <p className="text-base font-medium text-dark-900 dark:text-dark-50 mb-2">{error.title}</p>
        <p className="text-sm text-dark-600 dark:text-dark-400">{error.description}</p>
      </div>
    </div>
  )
}
