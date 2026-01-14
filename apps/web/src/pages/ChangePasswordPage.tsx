import { useState, useCallback, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'
import { Button } from '@/components/ui/Button'
import { changePassword } from '@/services/auth.service'
import { Alert, AlertType } from '@/components/ui/Alert'
import { ROUTES } from '@/navigator/routes.constants'

interface FormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean
    type: AlertType
    title: string
    message: string
  } | null>(null)

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Senha atual é obrigatória'
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória'
    } else {
      if (newPassword.length < 8) {
        newErrors.newPassword = 'A senha deve ter no mínimo 8 caracteres'
      } else if (!/[A-Z]/.test(newPassword)) {
        newErrors.newPassword = 'A senha deve conter pelo menos uma letra maiúscula'
      } else if (!/\d/.test(newPassword)) {
        newErrors.newPassword = 'A senha deve conter pelo menos um número'
      }
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [currentPassword, newPassword, confirmPassword])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      setIsLoading(true)
      setErrors({})

      try {
        await changePassword({
          currentPassword,
          newPassword,
        })

        setAlertConfig({
          isOpen: true,
          type: 'success',
          title: 'Senha alterada com sucesso!',
          message: 'Sua senha foi alterada com sucesso. Você será redirecionado para o perfil.',
        })

        setTimeout(() => {
          navigate(ROUTES.PROFILE)
        }, 2000)
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error && 'response' in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
            : 'Erro ao alterar senha. Verifique se a senha atual está correta.'

        if (errorMessage?.includes('incorrect') || errorMessage?.includes('incorreta')) {
          setErrors({
            currentPassword: 'Senha atual incorreta',
          })
        } else {
          setAlertConfig({
            isOpen: true,
            type: 'error',
            title: 'Erro ao alterar senha',
            message: errorMessage || 'Ocorreu um erro ao alterar sua senha. Tente novamente.',
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [currentPassword, newPassword, validateForm, navigate]
  )

  return (
    <div className="h-full bg-transparent dark:bg-dark-950 lg:bg-transparent lg:dark:bg-transparent">
      <div className="max-w-2xl mx-auto px-4 py-6 lg:pt-0 lg:pb-6">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(ROUTES.PROFILE)}
            className="mb-4 flex items-center gap-2 text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200 transition-colors"
            aria-label="Voltar para o perfil"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar
          </button>
        </div>

        <div className="bg-white dark:bg-dark-900 rounded-[2rem] shadow-sm p-6 sm:p-8 border border-white/20">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">Alterar Senha</h1>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
              Altere sua senha para manter sua conta segura
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <PasswordInput
              id="currentPassword"
              label="Senha Atual"
              value={currentPassword}
              onChange={e => {
                setCurrentPassword(e.target.value)
                if (errors.currentPassword) {
                  setErrors(prev => ({ ...prev, currentPassword: undefined }))
                }
              }}
              error={errors.currentPassword}
              placeholder="Digite sua senha atual"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />

            {/* New Password */}
            <div>
              <PasswordInput
                id="newPassword"
                label="Nova Senha"
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value)
                  if (errors.newPassword) {
                    setErrors(prev => ({ ...prev, newPassword: undefined }))
                  }
                }}
                error={errors.newPassword}
                placeholder="Digite sua nova senha"
                autoComplete="new-password"
                required
                disabled={isLoading}
              />
              <PasswordStrengthIndicator password={newPassword} />
              {!errors.newPassword && newPassword && (
                <div className="mt-2 text-xs text-dark-500 dark:text-dark-400">
                  <p>A senha deve conter:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                      No mínimo 8 caracteres
                    </li>
                    <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                      Pelo menos uma letra maiúscula
                    </li>
                    <li className={/\d/.test(newPassword) ? 'text-green-600' : ''}>
                      Pelo menos um número
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <PasswordInput
              id="confirmPassword"
              label="Confirmar Nova Senha"
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: undefined }))
                }
              }}
              error={errors.confirmPassword}
              placeholder="Confirme sua nova senha"
              autoComplete="new-password"
              required
              disabled={isLoading}
            />

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto order-2 sm:order-1"
                onClick={() => navigate(ROUTES.PROFILE)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:w-auto order-1 sm:order-2"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Salvar Nova Senha
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Alert Component */}
      {alertConfig && (
        <Alert
          isOpen={alertConfig.isOpen}
          onClose={() => setAlertConfig(null)}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
        />
      )}
    </div>
  )
}
