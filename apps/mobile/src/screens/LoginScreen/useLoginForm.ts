import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface UseLoginFormReturn {
  email: string
  password: string
  error: string
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  handleLogin: () => Promise<void>
  clearError: () => void
}

export function useLoginForm(): UseLoginFormReturn {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const clearError = useCallback(() => {
    setError('')
  }, [])

  const handleLogin = useCallback(async () => {
    if (!isFormValid(email, password)) {
      setError('Por favor, preencha todos os campos')
      return
    }

    clearError()
    try {
      await login(email, password)
    } catch {
      setError('Email ou senha incorretos')
    }
  }, [email, password, login, clearError])

  return {
    email,
    password,
    error,
    setEmail,
    setPassword,
    handleLogin,
    clearError,
  }
}

function isFormValid(email: string, password: string): boolean {
  return email.trim().length > 0 && password.trim().length > 0
}
