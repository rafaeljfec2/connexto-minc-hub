import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Card } from '@/components/ui/Card'
import { useActivation } from '@/hooks/useActivation'

interface LocationState {
  tempToken?: string
  personName?: string
}

export default function CompleteActivationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { completeActivation, isLoading } = useActivation()
  const [tempToken, setTempToken] = useState<string>('')
  const [personName, setPersonName] = useState<string>('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  useEffect(() => {
    const state = location.state as LocationState | null
    if (!state?.tempToken) {
      // Não mostrar erro aqui, apenas redirecionar silenciosamente
      // O erro será mostrado pelo hook useActivation se necessário
      navigate('/activate')
      return
    }
    setTempToken(state.tempToken)
    if (state.personName) {
      setPersonName(state.personName)
    }
  }, [location.state, navigate])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    setEmail(value)
    setEmailError('')
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    setPasswordError('')
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem')
    } else {
      setConfirmPasswordError('')
    }
  }

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    setConfirmPasswordError('')
    if (value !== password) {
      setConfirmPasswordError('As senhas não coincidem')
    } else {
      setConfirmPasswordError('')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')

    // Validações
    if (!email.trim()) {
      setEmailError('Email é obrigatório')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Email inválido')
      return
    }

    if (!password) {
      setPasswordError('Senha é obrigatória')
      return
    }

    if (password.length < 6) {
      setPasswordError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('As senhas não coincidem')
      return
    }

    if (!tempToken) {
      // Redirecionar para página de ativação se não houver token
      navigate('/activate')
      return
    }

    try {
      await completeActivation(tempToken, email, password)
      // Redirecionar para dashboard após sucesso
      navigate('/')
    } catch (error) {
      // Erro já é tratado no hook
    }
  }

  if (!tempToken) {
    return null // Aguardando carregamento do token
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-900 dark:to-dark-800 px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
              {personName ? `Olá, ${personName}!` : 'Completar Ativação'}
            </h1>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Crie sua senha e email para finalizar a ativação da sua conta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
              disabled={isLoading}
              required
              autoFocus
            />

            <PasswordInput
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={handlePasswordChange}
              error={passwordError}
              disabled={isLoading}
              required
              minLength={6}
            />

            <PasswordInput
              label="Confirmar Senha"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              error={confirmPasswordError}
              disabled={isLoading}
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
              Ativar Conta
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
