import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { QRCodeSVG } from 'qrcode.react'

type Mode = 'scan' | 'generate'

export default function CheckinPage() {
  const { user } = useAuth()
  const [mode, setMode] = useState<Mode>('generate')

  const qrValue = user?.id ? JSON.stringify({ userId: user.id, type: 'check-in' }) : 'check-in-mock'

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto pb-20 pt-4">
          <div className="px-4 mb-4">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-1">Check-in</h1>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Escaneie o QR code para registrar presença
            </p>
          </div>

          {/* Toggle Segments */}
          <div className="px-4 mb-4">
            <div className="flex bg-dark-900 dark:bg-dark-900 rounded-xl p-1 border border-dark-800">
              <button
                type="button"
                onClick={() => setMode('generate')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'generate'
                    ? 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 font-bold'
                    : 'text-dark-400 dark:text-dark-400'
                }`}
              >
                Meu Código
              </button>
              <button
                type="button"
                onClick={() => setMode('scan')}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'scan'
                    ? 'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 font-bold'
                    : 'text-dark-400 dark:text-dark-400'
                }`}
              >
                Ler Código
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-4">
            {mode === 'generate' ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-sm p-8">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-1">
                      Meu Código de Check-in
                    </h2>
                    <p className="text-sm text-dark-600 dark:text-dark-400 mb-8">
                      Apresente este código para leitura
                    </p>

                    <div className="bg-white p-6 rounded-2xl border border-dark-200 dark:border-dark-800 mb-8 flex justify-center">
                      <QRCodeSVG value={qrValue} size={200} />
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-1">
                        {user?.name || 'Usuário'}
                      </p>
                      <p className="text-sm font-medium text-primary-500 dark:text-primary-400">
                        Membro
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-sm p-8">
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-64 h-64 border-2 border-primary-500 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-lg" />
                      </div>
                    </div>
                    <p className="text-base text-dark-900 dark:text-dark-50 mb-2">
                      Posicione o QR code dentro da área
                    </p>
                    <p className="text-sm text-dark-600 dark:text-dark-400">
                      A câmera será ativada quando você permitir o acesso
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <main className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Check-in" description="Escaneie o QR code para registrar presença" />
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <h2 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-1">
                Meu Código de Check-in
              </h2>
              <p className="text-sm text-dark-600 dark:text-dark-400 mb-8">
                Apresente este código para leitura
              </p>

              <div className="bg-white p-6 rounded-2xl border border-dark-200 dark:border-dark-800 mb-8 flex justify-center">
                <QRCodeSVG value={qrValue} size={200} />
              </div>

              <div className="text-center">
                <p className="text-lg font-bold text-dark-900 dark:text-dark-50 mb-1">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-sm font-medium text-primary-500 dark:text-primary-400">Membro</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
