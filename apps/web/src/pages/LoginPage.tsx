import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { BrandText } from '@/components/ui/BrandText'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }

      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 100)
    } catch (err: unknown) {
      let errorMessage = 'Email ou senha inválidos'

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
        if (axiosError.response?.status === 401) {
          errorMessage = 'Credenciais inválidas'
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message
        } else if (axiosError.response?.status === 429) {
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.'
        } else if (axiosError.response?.status === 500) {
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.'
        } else if (axiosError.response?.status === 0 || axiosError.response?.status === undefined) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        const error = err as { message?: string }
        if (error.message) {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-dark-950 font-sans">
      <div className="w-full max-w-[400px] bg-white dark:bg-dark-900 rounded-[2rem] shadow-xl p-8 border border-white/20">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <img
              src="/minc-teams-logo.png"
              alt="MINC Teams"
              className="h-24 w-auto object-contain invert dark:invert-0"
              onError={e => {
                const target = e.target as HTMLImageElement
                target.src = '/Logo-minc.png'
                target.className = 'h-20 w-auto object-contain invert dark:invert-0'
              }}
            />
          </div>

          <div className="my-2">
            <BrandText size="xl" />
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sistema de gestão dos times da MINC
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-800 border-none rounded-xl text-dark-900 dark:text-dark-50 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-dark-800 transition-all font-medium"
                placeholder="rafaeljfec2@gmail.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-800 border-none rounded-xl text-dark-900 dark:text-dark-50 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:bg-white dark:focus:bg-dark-800 transition-all font-medium tracking-wide"
                placeholder="•••••••••••"
              />
            </div>
            <div className="flex items-center justify-between">
              {/* Remember Me Checkbox */}
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-50 dark:bg-dark-800 border-gray-300 dark:border-dark-700 rounded focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                />
                <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors">
                  Permanecer conectado
                </span>
              </label>

              <a
                href="#"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-500"
              >
                Esqueceu a senha?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full py-6 rounded-xl bg-[#E65100] hover:bg-[#EF6C00] text-white font-bold text-base shadow-lg shadow-orange-500/20 border-none"
          >
            Entrar
          </Button>
        </form>
      </div>

      <div className="mt-8 text-center bg-transparent">
        <p className="text-sm text-gray-400">
          Created by <span className="text-orange-500 font-semibold">Connexto Tecnologia</span>
        </p>
      </div>
    </div>
  )
}
