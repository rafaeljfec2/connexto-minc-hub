interface PasswordStrengthIndicatorProps {
  readonly password: string
}

type StrengthLevel = 'weak' | 'medium' | 'strong'

interface StrengthConfig {
  level: StrengthLevel
  label: string
  color: string
  bgColor: string
  percentage: number
}

function calculatePasswordStrength(password: string): StrengthConfig {
  if (!password) {
    return {
      level: 'weak',
      label: '',
      color: 'bg-dark-200',
      bgColor: 'bg-dark-100',
      percentage: 0,
    }
  }

  let strength = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  if (checks.length) strength += 1
  if (checks.uppercase) strength += 1
  if (checks.lowercase) strength += 1
  if (checks.number) strength += 1
  if (checks.special) strength += 1

  if (strength <= 2) {
    return {
      level: 'weak',
      label: 'Senha fraca',
      color: 'bg-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      percentage: 33,
    }
  }

  if (strength <= 4) {
    return {
      level: 'medium',
      label: 'Senha média',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      percentage: 66,
    }
  }

  return {
    level: 'strong',
    label: 'Senha forte',
    color: 'bg-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    percentage: 100,
  }
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = calculatePasswordStrength(password)

  if (!password) {
    return null
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-dark-500 dark:text-dark-400">Força da senha</span>
        {strength.label && (
          <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>
            {strength.label}
          </span>
        )}
      </div>
      <div className="h-2 bg-dark-200 dark:bg-dark-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all duration-300 ease-out`}
          style={{ width: `${strength.percentage}%` }}
          role="progressbar"
          aria-valuenow={strength.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Força da senha: ${strength.label || 'Nenhuma'}`}
        />
      </div>
    </div>
  )
}
