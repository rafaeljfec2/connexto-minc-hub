import { useState, FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useActivation } from '@/hooks/useActivation'
import { formatPhone } from '@/utils/phone-mask'

export default function ActivateAccountPage() {
  const navigate = useNavigate()
  const { checkActivation, isLoading } = useActivation()
  const [phone, setPhone] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [codeError, setCodeError] = useState('')

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatPhone(value)
    setPhone(formatted)
    setPhoneError('')
  }

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setAccessCode(value)
    setCodeError('')
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPhoneError('')
    setCodeError('')

    // Validações básicas
    if (!phone.trim()) {
      setPhoneError('Telefone é obrigatório')
      return
    }

    if (!accessCode.trim()) {
      setCodeError('Código de acesso é obrigatório')
      return
    }

    // Validar telefone tem pelo menos 10 dígitos
    const phoneNumbers = phone.replace(/\D/g, '')
    if (phoneNumbers.length < 10) {
      setPhoneError('Telefone deve ter pelo menos 10 dígitos')
      return
    }

    // Validar código tem pelo menos 4 caracteres
    if (accessCode.length < 4) {
      setCodeError('Código de acesso deve ter pelo menos 4 caracteres')
      return
    }

    const result = await checkActivation(phone, accessCode)

    if (result && result.tempToken) {
      navigate('/activate/complete', {
        state: {
          tempToken: result.tempToken,
          personName: result.personName,
        },
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-900 dark:to-dark-800 px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50">
              Ativar Minha Conta
            </h1>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Digite seu telefone e o código de acesso fornecido pelo líder
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Telefone"
              type="tel"
              placeholder="(11) 98765-4321"
              value={phone}
              onChange={handlePhoneChange}
              error={phoneError}
              disabled={isLoading}
              required
              autoFocus
            />

            <Input
              label="Código de Acesso"
              type="text"
              placeholder="MINC2024"
              value={accessCode}
              onChange={handleCodeChange}
              error={codeError}
              disabled={isLoading}
              required
              maxLength={50}
              className="uppercase"
            />

            <Button type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
              Verificar
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-dark-500 dark:text-dark-500">
              Não tem um código? Entre em contato com o líder do seu time.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
